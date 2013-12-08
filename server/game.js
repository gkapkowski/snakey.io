var snakeModule = require('./snake.js');
var _ = require('underscore');
var async = require('async');

/*

Point:
- {x: ..., y: ...} Base point in game

*/

var BaseGame = {
    //Clients
    clients: [],

    //Board
    scores: {},
    apples: [],
    snakes: [],
    newSnakes: [],

    //Animation
    FPS: 30,
    lastFrame: new Date()*1,


    init: function (options) {
        _(this).bindAll(
            'start', 
            'addApple',
            'addApples',
            'addSnake',
            'updateScore',
            'validateSnake',
            'updateAllSnakes',
            'allSnakesUpdated');
        
        this.options = options;
        this.boardSize = options.size;

        this.addNewSnakes();
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

    addNewSnakes: function () {
        this.snakes = _.union(this.snakes, this.newSnakes);
        this.newSnakes.length = 0;
    },

    addSnake: function (snakeDetails) {
        var snake = new snakeModule.Snake({
            origin: this.getSnakeOrigin(snakeDetails),
            name: snakeDetails.name,
            size: this.boardSize,
            timeout: this.options.timeout,
            id: _.sample(_.range(100))
        });
        this.newSnakes.push(snake);
    },

    updateAllScores: function () {
        _.each(this.snakes, this.updateScore);
    },

    updateScore: function (snake) {
        var maxScore = this.scores[snake.name];
        var newScore = Math.max(snake.body.length, maxScore || 1);
        this.scores[snake.name] = newScore;
    },

    createBoard: function () {
        //Create board for all snakes to move upon
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
        _.each(this.snakes, function (snake) {
            _.each(snake.body, function (element, index) {
                if (index == 0) {
                    board[element.y][element.x] = 'S';
                } else {
                    board[element.y][element.x] = '#';
                }
            });
        });
        return board;
    },

    validateSnake: function (snake) {
        if (!this.isOnBoard(snake) || this.hasColided(snake)) {
            snake.reset();
        }

        //refactor!!
        var appleToEat = _.findWhere(this.apples, snake.getHead());
        if (!!appleToEat) {
            snake.grow = true;
            // Remove apple that was eaten
            this.apples = _.filter(this.apples, function (item) {
                return !_.isEqual(appleToEat, item);
            });
            this.addApple();
        }
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

    allSnakesUpdated: function (err) {
        //check if any snake dies or have eaten apple
        _.each(this.snakes, this.validateSnake);

        this.updateAllScores();

        var now = new Date()*1;
        if (now - this.lastFrame > (1000/this.FPS)) {
            this.emitFrame();
            this.lastFrame = now;
        }

        setTimeout(this.updateAllSnakes, this.options.speed);
    },

    //Call all snakes and update board state
    updateAllSnakes: function () {
        this.snakes = _.union(this.snakes, this.newSnakes);
        this.newSnakes.length = 0;

        var board = this.createBoard();

        //move ALL snakes
        async.each(this.snakes, function (snake, callWhenFinished) {

            snake.move(board, callWhenFinished);
        }, this.allSnakesUpdated);
    },

    getBoardState: function () {
        return {
            snakes: this.snakes,
            apples: this.apples
        }
    },

    isOnBoard: function (snake) {
        var head = snake.getHead();
        return (head.x >= 0) && 
        (head.y >= 0) && 
        (head.x <= this.boardSize - 1) && 
        (head.y <= this.boardSize - 1);
    },

    hasColided: function (snake) {
        var snakes = _.map(this.snakes, function (other) {
            if (other.uniqueId != snake.uniqueId) {
                //Other snake
                return other.body;
            } else {
                //My own body, check if I hit myself
                return other.body.slice(1);
            }
        });
        return _.any(snakes, function (otherBody) {
            return !!_.where(otherBody, snake.getHead()).length;
        });
    },

    registerViewer: function (socket) {
        this.clients.push(socket);
        socket.on('add-snake', this.addSnake);
    },

    start: function () {
        this.addNewSnakes();
        if (!_.isEmpty(this.snakes)){
            this.updateAllSnakes();
        } else {
            setTimeout(this.start, 1000);
        }
    }
};


var Game = function (options) {
    this.init.apply(this, arguments);
};

_.extend(Game.prototype, BaseGame, {
    name: 'Game',

    getSnakeOrigin: function (snakeDetails) {
        return snakeDetails.url;
    }

});

var HerokuGame = function (options) {
    this.init.apply(this, arguments);
};

_.extend(HerokuGame.prototype, BaseGame, {
    name: 'HerokuGame',

    getSnakeOrigin: function (snakeDetails) {
        return "http://" + snakeDetails.name + ".herokuapp.com/";
    }

});


exports.Game = Game;
exports.HerokuGame = HerokuGame;