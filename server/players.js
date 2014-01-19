var request = require('request'); 
var _ = require('underscore');

var commonMoves = ['up', 'down', 'left', 'right'];
var moves = {
    up: {
        x: 0, 
        y: 1
    },
    down: {
        x: 0, 
        y: -1
    },
    left: {
        x: -1, 
        y: 0
    },
    right: {
        x: 1, 
        y: 0
    },
};

/*
         up 0, 1
         |
         |
 left <--H--> right 
 -1, 0   |     1, 0
         |
        down 0, -1
*/


var movePoint = function (point, direction) {
    return {
        x: point.x + moves[direction].x,
        y: point.y + moves[direction].y
    };
};


var Player = function (options) {
    this.init.apply(this, arguments);
};


_.extend(Player.prototype, {
    body: [],
    possibleMoves: [], //redefine in subclass

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
        if (error || response.statusCode != 200) {
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
        b = b.substr(0, index) + "H" + b.substr(index+1);

        var self = this;

        request.post(this.origin, {
            form: {board: b},
            timeout: this.options.timeout
        }, function (error, response, move) {
            self.handleResponse(error, response, move);
            callWhenFinished(); // async thing
        });
    },

    handleMove: function (move) {
        //implement in subclass
    }
});


var Snake = function (options) {
    this.init.apply(this, arguments);
};

_.extend(Snake.prototype, Player.prototype, {
    grow: false,
    possibleMoves: commonMoves.slice(0),

    handleMove: function (move) {
        //calculate new head
        var newHead = movePoint(this.getHead(), move);
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



var Tank = function (options) {
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
        if (move == 'forward') {
            this.body = [movePoint(head, this.facing)];
        } else if (move == 'backward') {
            index = (this.directions.indexOf(this.facing) + 2) % this.directions.length;
            move = this.directions[index];
            this.body = [movePoint(head, move)];
        } else if (move == 'right') {
            index = (this.directions.indexOf(this.facing) + 1) % this.directions.length;
            this.facing = this.directions[index];
        } else if (move == 'left') {
            index = (this.directions.indexOf(this.facing) + 3) % this.directions.length;
            this.facing = this.directions[index];
        }
    },

    score: function () {
        return  this.kills;
    }
});


exports.Snake = Snake;
exports.Tank = Tank;