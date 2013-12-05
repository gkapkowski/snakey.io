var request = require('request'); 
var _ = require('underscore');

var possibleMoves = ['up', 'down', 'left', 'right']
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
}

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
    }
}

var Snake = function (options) {
    var self = this;
    self.options = options;
    self.currentMove = null;
    self.origin = options.origin;
    self.name = options.name;
    self.uniqueId = options.id;
    self.grow = false;

    self.reset = function () {
        var start = {
            x: _.sample(_.range(options.size)), 
            y: _.sample(_.range(options.size))
        }
        self.body = [start];
    };

    self.reset();

    self.getHead = function () {
        return self.body[0];
    };

    self.handleResponse = function (error, response, move) {
        if (error || response.statusCode != 200) {
            console.log(error, response, move);
            return;
        }

        if(!_.contains(possibleMoves, move)){
            self.reset();
            return;
        }

        self.handleMove(move);
    };

    self.handleMove = function (move) {
        self.currentMove = move;
        //calculate new head
        var newHead = movePoint(self.getHead(), move);
        //Put new head if front of snake body
        self.body.unshift(newHead);

        if (!self.grow) {
            // if no apple eaten, remove last element
            self.body.pop();
        } else {
            // if apple eaten, leave last element
            self.grow = false;
        }
    };

    self.move = function (board, callWhenFinished) {
        var b = (_.map(board, function (row) {
            return row.join('');
        })).join('\n');

        var head = self.getHead();
        var index = (head.y * board.length) + head.x + head.y;
        b = b.substr(0, index) + "H" + b.substr(index+1);

        request.post(self.origin, {
            form: {board: b}
        }, function (error, response, move) {
            self.handleResponse(error, response, move);
            callWhenFinished(); // async thing
        });
    };
}

exports.Snake = Snake;