var http = require('http');
var _ = require('underscore');
var querystring = require('querystring');

var Snake = function () {
    this.init.apply(this, arguments);
};

_.extend(Snake.prototype, {

    init: function () {
        _(this).bindAll('onData', 'onEnd', 'handleRequest');
    },

    handleRequest: function (request, response) {
        this.content = '';
        this.response = response;
        request.on('data', this.onData);
        request.on('end', this.onEnd);
    },

    onData: function (data) {
        this.content += data;
    },

    onEnd: function () {
        var board = this.getBoard(this.content);
        var move = this.getMove(board);

        this.response.writeHeader(200, {"Content-Type": "text/plain"});
        this.response.write(move);
        this.response.end()
    },

    getBoard: function (content) {
        return querystring.parse(this.content).board.split('\n');
    },

    getRandomMove: function () {
        return _.sample(['up', 'down', 'right', 'left']);
    },

    getMove: function (board) {
        // Write your snake login here //
        return this.getRandomMove();
    }
});


var snake = new Snake();


http.createServer(snake.handleRequest).listen(process.env.PORT || 8001);