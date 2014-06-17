/* global require, module */
'use strict';
var SynchronousGame = require('../game.js'),
    Snake = require('./snake.js'),
    _ = require('underscore');

var SnakeGame = function () {
    this.init.apply(this, arguments);
};


_.extend(SnakeGame.prototype, SynchronousGame.prototype, {
    name: 'SnakeGame',
    
    init: function () {
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
        return new Snake({
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
        _.each(this.apples, function (element) {
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


var HerokuSnakeGame = function () {
    this.init.apply(this, arguments);
};


_.extend(HerokuSnakeGame.prototype, SnakeGame.prototype, {
    name: 'HerokuSnakeGame',

    getPlayerOrigin: function (details) {
        return 'http://' + details.name + '.herokuapp.com/';
    }

});


module.exports = SnakeGame;