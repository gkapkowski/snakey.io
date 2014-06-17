/* global require, console, module */
'use strict';
var request = require('request');
var _ = require('underscore');


var Player = function () {
    this.init.apply(this, arguments);
};


_.extend(Player.prototype, {
    body: [],
    possibleMoves: [], //redefine in subclass
    commonMoves: ['up', 'down', 'left', 'right'],
    moves: {
        up:   {x:  0, y:  1},
        down: {x:  0, y: -1},
        left: {x: -1, y:  0},
        right:{x:  1, y:  0}
    },

    /*
            up 
            0, 1
             ^
             |
     left <--H--> right 
     -1, 0   |     1, 0
             |
            down 
            0, -1
    */


    init: function (options) {
        this.options = options;
        this.origin = options.origin;
        this.name = options.name;
        this.uniqueId = options.id;
        this.reset();
    },

    reset: function () {
        var start = {
            x: _.sample(_.range(this.options.size)),
            y: _.sample(_.range(this.options.size))
        };
        this.body = [start];
    },

    getHead: function () {
        return this.body[0];
    },

    handleResponse: function (error, response, move) {
        if (error || (response.statusCode !== 200)) {
            console.log('Error', error, this.origin);
            return;
        }

        if(!_.contains(this.possibleMoves, move)){
            this.reset();
            return;
        }

        this.handleMove(move);
    },

    move: function (board, callWhenFinished) {
        var b = (_.map(board, function (row) {
            return row.join('');
        })).join('\n');

        var head = this.getHead();
        //replace # with H for player head
        var index = (head.y * board.length) + head.x + head.y;
        b = b.substr(0, index) + 'H' + b.substr(index+1);

        var self = this;

        request.post(this.origin, {
            form: {board: b},
            timeout: this.options.timeout
        }, function (error, response, move) {
            self.handleResponse(error, response, move);
            callWhenFinished(); // async thing
        });
    },

    movePoint: function (point, direction) {
        return {
            x: point.x + this.moves[direction].x,
            y: point.y + this.moves[direction].y
        };
    }

    /*
    handleMove: function (move) {
        //implement in subclass
    }
    */
});

module.exports = Player;