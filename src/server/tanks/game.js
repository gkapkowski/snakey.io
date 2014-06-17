/* global require, module */
'use strict';
var SynchronousGame = require('../game.js'),
    Tank = require('./tank.js'),
    _ = require('underscore');


var TankGame = function () {
    this.init.apply(this, arguments);
};


_.extend(TankGame.prototype, SynchronousGame.prototype, {
    name: 'TankGame',

    createPlayer: function (details) {
        return new Tank({
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


var HerokuTankGame = function () {
    this.init.apply(this, arguments);
};


_.extend(HerokuTankGame.prototype, TankGame.prototype, {
    name: 'HerokuGame',

    getPlayerOrigin: function (details) {
        return 'http://' + details.name + '.herokuapp.com/';
    }

});

module.exports = TankGame;