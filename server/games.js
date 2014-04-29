var playersModule = require('./players.js');
var _ = require('underscore');
var async = require('async');

/*

Point:
- {x: ..., y: ...} Base point in game

*/


var SynchronousGame = function (options) {
    this.init.apply(this, arguments);
};


_.extend(SynchronousGame.prototype, {
    //Animation
    FPS: 30,
    lastFrame: new Date()*1,
    
    started: false,

    init: function (options) {
        _(this).bindAll(
            'start', 
            'addPlayer',
            'updateScore',
            'isAlive',
            'updateAllPlayers',
            'allPlayersUpdated');
        
        this.options = options;
        this.boardSize = options.size;
        //Clients
        this.clients = [];
        //Score Board
        this.scores = {};
        //Players
        this.players = [];
        this.newPlayers = [];
    },

    toJSON: function () {
        return {
            players: this.players,
            options: this.options,
            boardSize: this.boardSize,
        };
    },

    addNewPlayers: function () {
        this.players = _.union(this.players, this.newPlayers);
        this.newPlayers.length = 0;
    },

    addPlayer: function (details) {
        this.newPlayers.push(this.createPlayer(details));
    },

    createPlayer: function (details) {
        //NOTE: implement in subclass.
    },

    updateAllScores: function () {
        _.each(this.players, this.updateScore);
    },

    updateScore: function (player) {
        var maxScore = this.scores[player.name];
        var newScore = Math.max(player.score(), maxScore || 1);
        this.scores[player.name] = newScore;
    },

    isAlive: function (player) {
        if (!this.isOnBoard(player) || this.hasColided(player)) {
            player.reset();
        }
    },

    isOnBoard: function (player) {
        var head = player.getHead();
        return (head.x >= 0) && 
        (head.y >= 0) && 
        (head.x <= this.boardSize - 1) && 
        (head.y <= this.boardSize - 1);
    },

    hasColided: function (player) {
        var players = _.map(this.players, function (other) {
            if (other.uniqueId != player.uniqueId) {
                //Other player
                return other.body;
            } else {
                //My own body, check if I hit myself
                return other.body.slice(1);
            }
        });
        var head = player.getHead();
        return _.any(players, function (otherBody) {
            return !!_.where(otherBody, head).length;
        });
    },

    //Call all players and update board state
    updateAllPlayers: function () {
        this.addNewPlayers();

        var board = this.createBoard();

        //move ALL players
        async.each(this.players, function (player, callWhenFinished) {
            player.move(board, callWhenFinished);
        }, this.allPlayersUpdated);
    },

    allPlayersUpdated: function (err) {
        //check if any snake dies or have eaten apple
        _.each(this.players, this.isAlive);
        this.onAllPlayersUpdated();

        this.updateAllScores();

        var now = new Date()*1;
        if (now - this.lastFrame > (1000/this.FPS)) {
            this.emitFrame();
            this.lastFrame = now;
        }

        setTimeout(this.updateAllPlayers, this.options.speed);
    },

    onAllPlayersUpdated: function () {
        //NOTE: implement in subclass
    },

    emitFrame: function () {
        var boardState = this.getBoardState();
        var boardSize = this.boardSize;
        var scores = this.scores;

        _.each(this.clients, function (socket) {
            socket.emit('board', {
                size: boardSize, 
                state: boardState
            });
            socket.emit('scores', scores);
        });
    },

    getBoardState: function () {
        return {players: this.players};
    },

    getPlayerOrigin: function (details) {
        return details.url;
    },

    registerViewer: function (socket) {
        this.clients.push(socket);
        socket.emit('config', {
            size: this.options.size,
            type: this.name 
        });
    },

    unregisterViewer: function (socket) {
        this.clients = _.filter(this.clients, function (item) {
            return item !== socket;
        });
    },

    start: function () {
        if (!this.started) { 
            this.updateAllPlayers();
            this.started = true;
        }
    }
});



var SnakeGame = function (options) {
    this.init.apply(this, arguments);
};


_.extend(SnakeGame.prototype, SynchronousGame.prototype, {
    name: 'SnakeGame',
    
    init: function (options) {
        SynchronousGame.prototype.init.apply(this, arguments);
        _(this).bindAll(
            'addApple',
            'addApples',
            'eatApple');

        this.apples = [];
        this.addApples();
    },

    addApples: function () {
        _.times(this.options.apples, this.addApple);
    },

    addApple: function () {
        this.apples.push({
            x: _.sample(_.range(this.boardSize)),
            y: _.sample(_.range(this.boardSize))
        });
    },

    createPlayer: function (details) {
        return new playersModule.Snake({
            origin: this.getPlayerOrigin(details),
            name: details.name,
            size: this.boardSize,
            timeout: this.options.timeout,
            id: _.sample(_.range(100))
        });
    },

    createBoard: function () {
        //Create board for all players to move upon
        var boardSize = this.boardSize;
        var board = [];
        _.times(boardSize, function (y) {
            board[y] = [];
            _.times(boardSize, function (x) {
                board[y][x] = '.';
            });
        });
        _.each(this.apples, function (element, index) {
            board[element.y][element.x] = 'o';
        });
        _.each(this.players, function (player) {
            _.each(player.body, function (element, index) {
                if (index === 0) {
                    board[element.y][element.x] = 'S';
                } else {
                    board[element.y][element.x] = '#';
                }
            });
        });
        return board;
    },

    eatApple: function (player) {
        //refactor!!
        var appleToEat = _.findWhere(this.apples, player.getHead());
        if (!!appleToEat) {
            player.grow = true;
            // Remove apple that was eaten
            this.apples = _.filter(this.apples, function (item) {
                return !_.isEqual(appleToEat, item);
            });
            this.addApple();
        }
    },

    onAllPlayersUpdated: function () {
        _.each(this.players, this.eatApple);
    },

    getBoardState: function () {
        return {
            players: this.players,
            apples: this.apples
        };
    }
});



var HerokuSnakeGame = function (options) {
    this.init.apply(this, arguments);
};


_.extend(HerokuSnakeGame.prototype, SnakeGame.prototype, {
    name: 'HerokuSnakeGame',

    getPlayerOrigin: function (details) {
        return "http://" + details.name + ".herokuapp.com/";
    }

});



var TankGame = function (options) {
    this.init.apply(this, arguments);
};


_.extend(TankGame.prototype, SynchronousGame.prototype, {
    name: 'TankGame',

    createPlayer: function (details) {
        return new playersModule.Tank({
            origin: this.getPlayerOrigin(details),
            name: details.name,
            size: this.boardSize,
            timeout: this.options.timeout,
            id: _.sample(_.range(100))
        });
    },

    createBoard: function () {
        //Create board for all players to move upon
        var boardSize = this.boardSize;
        var board = [];
        
        _.times(boardSize, function (y) {
            board[y] = [];
            _.times(boardSize, function (x) {
                board[y][x] = '.';
            });
        });

        _.each(this.players, function (player) {
            _.each(player.body, function (element) {
                board[element.y][element.x] = '#';
            });
        });
        return board;
    }
});


var HerokuTankGame = function (options) {
    this.init.apply(this, arguments);
};


_.extend(HerokuTankGame.prototype, TankGame.prototype, {
    name: 'HerokuGame',

    getPlayerOrigin: function (details) {
        return "http://" + details.name + ".herokuapp.com/";
    }

});


exports.SnakeGame = SnakeGame;
exports.HerokuSnakeGame = HerokuSnakeGame;
exports.TankGame = TankGame;
exports.HerokuTankGame = HerokuTankGame;