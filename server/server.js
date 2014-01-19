var static = require('node-static');
var http = require('http'); 
var gameModule = require('./games.js');
var socketio = require('socket.io');
var _ = require('underscore');


var isHeroku = !!process.env.DYNO;

var Server = function (options) {
    this.init.apply(this, arguments);
};

_.extend(Server.prototype, {
    gameObjects: {
        snakes: isHeroku ? gameModule.HerokuSnakeGame : gameModule.SnakeGame,
        tanks: isHeroku ? gameModule.HerokuTankGame : gameModule.TankGame
    },

    gameOptions: {
        snakes: {
            speed: 500,
            timeout: 1000,
            apples: 20,
            size: 50
        },
        tanks: {
            speed: 500,
            timeout: 1000,
            size: 20
        },
    },

    games: [],

    defaultPort: 5000,

    fileServer: new static.Server('./'),

    init: function (options) {
        _(this).bindAll('onSocketConnection', 'handler');
        this.game = new this.gameObjects[options.name](this.gameOptions[options.name]);
        this.game.start();

        var port = process.env.PORT || this.defaultPort;
        var app = http.createServer(this.handler);
        app.listen(port);

        io = socketio.listen(app);
        io.set('log level', 1);
        io.sockets.on('connection', this.onSocketConnection);
    },

    //Http handler, it will server all static files
    handler: function (req, res) {
        var self = this;
        req.addListener('end', function () {
            self.fileServer.serve(req, res, function (e, r) {
                if (e && (e.status == 404)) {
                    self.fileServer.serveFile('client/client.html', 200, {}, req, res);
                }
            });
        }).resume();
    },

    onSocketConnection: function (socket) {
        socket.emit('config', {
            size: this.game.options.size,
            type: this.game.name 
        });
        
        this.game.registerViewer(socket);
    }
});


//Run server
new Server({
    name: process.argv[2]
});