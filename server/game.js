var snakes = require('./snake.js');
var _ = require('underscore');
var async = require('async');

/*

Point:
- {x: ..., y: ...} Base point in game

*/


var Game = function (options) {
    var self = this;
    self.FPS = 30;
    self.options = options;
    self.boardSize = options.size;
    self.sockets = [];
    self.scores = {};
    self.snakes = [];
    self.newSnakes = [];

    self.addSnake = function (snakeDetails) {
        var snake = new snakes.Snake({
            origin: "http://" + snakeDetails.name + ".herokuapp.com/",
            name: snakeDetails.name,
            size: self.boardSize,
            timeout: options.timeout,
            id: _.sample(_.range(100))
        });
        self.newSnakes.push(snake);
    };

    self.addNewSnakes = function () {
        self.snakes = _.union(self.snakes, self.newSnakes);
        self.newSnakes.length = 0;
    };

    self.init = function () {
        self.addNewSnakes();

        //self.addSnake({name:'http://localhost:8000/'});

        self.apples = [];
        _.each(_.range(options.apples), function () {
            self.apples.push({
                x: _.sample(_.range(self.boardSize)),
                y: _.sample(_.range(self.boardSize))
            });
        });

        self.lastFrame = new Date()*1;
    };

    self.updateScores = function () {
        var self = this;
        var snakes = self.snakes;
        _.each(snakes, function (snake) {
            var length;
            if (_.isUndefined(self.scores[snake.name])) {
                length = 1;
            } else {
                length = Math.max(snake.body.length, self.scores[snake.name]); 
            }
            self.scores[snake.name] = length;
        });
    };

    self.createBoard = function () {
        //Create board for all snakes to move upon
        var board = [];
        _.each(_.range(self.boardSize), function (y) {
            board[y] = [];
            _.each(_.range(self.boardSize), function (x) {
                board[y][x] = '.';
            });
        });

        _.each(self.apples, function (element, index) {
            board[element.y][element.x] = 'o';
        });

        _.each(self.snakes, function (snake) {
            _.each(snake.body, function (element, index) {
                if (index == 0) {
                    board[element.y][element.x] = 'S';
                } else {
                    board[element.y][element.x] = '#';
                }
            });
        });
        return board;
    };

    self.validateSnake = function (snake) {
        if (!self.isOnBoard(snake) || self.hasColided(snake)) {
            snake.reset();
        }

        //refactor!!
        var appleToEat = _.findWhere(self.apples, snake.getHead());
        if (!!appleToEat) {
            snake.grow = true;
            // Remove apple that was eaten
            self.apples = _.filter(self.apples, function (item) {
                return !_.isEqual(appleToEat, item);
            });
            self.apples.push({
                x: _.sample(_.range(self.boardSize)),
                y: _.sample(_.range(self.boardSize))
            });
        }
    };

    self.emitFrame = function () {
        var boardState = self.getBoardState();

        _.each(self.sockets, function (socket) {
            socket.emit('board', {
                size: self.boardSize, 
                state: boardState
            });
            socket.emit('scores', self.scores);
        });
    };

    self.allSnakesUpdated = function (err) {
        //check if any snake dies or have eaten apple
        _.each(self.snakes, self.validateSnake);

        self.updateScores();

        var now = new Date()*1;
        if (now - self.lastFrame > (1000/self.FPS)) {

            self.emitFrame();
            
            self.lastFrame = now;
        }
        setTimeout(function () {
            //Wont this lead to huge memory leak?
            self.updateAllSnakes(); 
        }, self.options.speed);
    };

    //Call all snakes and update board state
    self.updateAllSnakes = function () {
        self.snakes = _.union(self.snakes, self.newSnakes);
        self.newSnakes.length = 0;

        var board = self.createBoard();

        //move ALL snakes
        async.each(self.snakes, function (snake, callWhenFinished) {
            snake.move(board, callWhenFinished);
        }, self.allSnakesUpdated);
    };

    self.getBoardState = function () {
        return {
            snakes: self.snakes,
            apples: self.apples
        }
    };

    self.isOnBoard = function (snake) {
        var head = snake.getHead();
        return (head.x >= 0) && 
        (head.y >= 0) && 
        (head.x <= self.boardSize - 1) && 
        (head.y <= self.boardSize - 1);
    };

    self.hasColided = function (snake) {
        var snakes = _.map(self.snakes, function (other) {
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
    }

    self.registerViewer = function (socket) {
        self.sockets.push(socket);
    };

    self.start = function () {
        self.addNewSnakes();
        if (!_.isEmpty(self.snakes)){
            self.updateAllSnakes();
        } else {
            setTimeout(self.start, 1000);
        }
    };

    self.init();
};

exports.Game = Game