/* global require, module */
'use strict';
var Player = require('../player.js'),
    _ = require('underscore');

var Tank = function () {
    this.init.apply(this, arguments);
};


_.extend(Tank.prototype, Player.prototype, {
    possibleMoves: ['right', 'left', 'forward', 'backward', 'fire'],

    facing: 'up',
    directions: ['up', 'right', 'down', 'left'],
    kills: 0,

    handleMove: function (move) {
        var index;
        var head = this.getHead();
        if (move === 'forward') {
            this.body = [this.movePoint(head, this.facing)];
        } else if (move === 'backward') {
            index = (this.directions.indexOf(this.facing) + 2) % this.directions.length;
            move = this.directions[index];
            this.body = [this.movePoint(head, move)];
        } else if (move === 'right') {
            index = (this.directions.indexOf(this.facing) + 1) % this.directions.length;
            this.facing = this.directions[index];
        } else if (move === 'left') {
            index = (this.directions.indexOf(this.facing) + 3) % this.directions.length;
            this.facing = this.directions[index];
        }
    },

    score: function () {
        return  this.kills;
    }
});


module.exports = Tank;