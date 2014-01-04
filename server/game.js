var snakeModule = require('./snake.js');
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
    //Clients
    clients: [],

    //Score Board
    scores: {},

    //Animation
    FPS: 30,
    lastFrame: new Date()*1,

    //players
    players: [],
    newPlayers: [],

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

        this.addNewPlayers();
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
        //NOTE: implement in subclass
    },

    registerViewer: function (socket) {
        this.clients.push(socket);
        socket.on('add-player', this.addPlayer);
    },

    start: function () {
        this.addNewPlayers();
        if (!_.isEmpty(this.players)){
            this.updateAllPlayers();
        } else {
            setTimeout(this.start, 1000);
        }
    }
});



var Game = function (options) {
    this.init.apply(this, arguments);
};


_.extend(Game.prototype, SynchronousGame.prototype, {
    name: 'Game',
    apples: [],

    init: function (options) {
        SynchronousGame.prototype.init.apply(this, arguments);
        _(this).bindAll(
            'addApple',
            'addApples',
            'eatApple');
        
        this.addApples();
    },

    addApples: function () {
        _.each(_.range(this.options.apples), this.addApple);
    },

    addApple: function () {
        this.apples.push({
            x: _.sample(_.range(this.boardSize)),
            y: _.sample(_.range(this.boardSize))
        });
    },

    createPlayer: function (details) {
        return new snakeModule.Snake({
            origin: this.getSnakeOrigin(details),
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
        _.each(_.range(boardSize), function (y) {
            board[y] = [];
            _.each(_.range(boardSize), function (x) {
                board[y][x] = '.';
            });
        });
        _.each(this.apples, function (element, index) {
            board[element.y][element.x] = 'o';
        });
        _.each(this.players, function (snake) {
            _.each(snake.body, function (element, index) {
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
    },

    getSnakeOrigin: function (snakeDetails) {
        return snakeDetails.url;
    }
});



var HerokuGame = function (options) {
    this.init.apply(this, arguments);
};


_.extend(HerokuGame.prototype, Game.prototype, {
    name: 'HerokuGame',

    getSnakeOrigin: function (snakeDetails) {
        return "http://" + snakeDetails.name + ".herokuapp.com/";
    }

});


exports.Game = Game;
exports.HerokuGame = HerokuGame;