/* global require, module */
'use strict';
var Player = require('../player.js'),
    _ = require('underscore');


var Snake = function () {
    this.init.apply(this, arguments);
};

_.extend(Snake.prototype, Player.prototype, {
    grow: false,
    possibleMoves: Player.prototype.commonMoves.slice(0),

    handleMove: function (move) {
        //calculate new head
        var newHead = this.movePoint(this.getHead(), move);
        //Put new head if front of snake body
        this.body.unshift(newHead);

        if (!this.grow) {
            // if no apple eaten, remove last element
            this.body.pop();
        } else {
            // if apple eaten, leave last element
            this.grow = false;
        }
    },

    score: function () {
        return this.body.length;
    }
});

module.exports = Snake;