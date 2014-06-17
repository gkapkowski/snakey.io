/* global module, require */
'use strict';
var _ = require('underscore'),
    Board = require('./board.js');

var SnakeBoard = Board.extend({

    initialize: function () {
        Board.prototype.initialize.apply(this, arguments);
        _(this).bindAll('drawApple');
        this.colors.apple = '#ff0000';
    },

    drawOthers : function () {
        this.drawApples();
    },

    drawApples: function () {
        this.backgroundContext.fillStyle = this.colors.apple;
        _.each(this.board.state.apples, this.drawApple);
    },

    drawApple: function (coords) {
        this.backgroundContext.beginPath();
        this.backgroundContext.arc(
            coords.x * this.size + parseInt(this.size/2),
            coords.y * this.size + parseInt(this.size/2),
            parseInt(this.size/2), 0, 2*Math.PI);
        this.backgroundContext.fill();
        this.backgroundContext.stroke();
    },

    drawPlayer: function (snake) {
        var self = this;
        self.backgroundContext.fillStyle = self.colors.players[snake.uniqueId];
        _.each(snake.body, function (coords, index) {
            self.backgroundContext.beginPath();
            self.backgroundContext.arc(
                coords.x * self.size + parseInt(self.size/2),
                coords.y * self.size + parseInt(self.size/2),
                parseInt(self.size/2), 0, 2*Math.PI);
            self.backgroundContext.fill();
            self.backgroundContext.stroke();
            if (index === 0) {
                self.backgroundContext.fillText(
                    snake.options.name,
                    coords.x * self.size - 2,
                    coords.y * self.size - 2);
            }
        });
    }
});

module.exports = SnakeBoard;