var static = require('node-static');
var http = require('http'); 
var snakesModule = require('./snake.js');
var gameModule = require('./game.js');
var socketio = require('socket.io');

var fileServer = new static.Server('./');

var gameOptions = {
    speed: 500,
    timeout: 1000,
    apples: 20,
    size: 60
};

var GameClass = process.env.DYNO ? gameModule.HerokuGame : gameModule.Game;
var game = new GameClass(gameOptions);
//Start Game
game.start();

//Http handler, it will server all static files
function handler (req, res) {
    req.addListener('end', function () {
        fileServer.serve(req, res, function (e, r) {
            if (e && (e.status == 404)) {
                fileServer.serveFile('client/client.html', 200, {}, req, res);
            }
        });
    }).resume();
}

var onSocketConnection = function (socket) {
    socket.emit('config', {
        size: game.options.size,
        type: game.name 
    });
    
    game.registerViewer(socket);
}

var port = process.env.PORT || 5000;
var app = http.createServer(handler);
app.listen(port);

io = socketio.listen(app);
io.set('log level', 1);
io.sockets.on('connection', onSocketConnection);