/* global require, process, __dirname */
'use strict';
var nstatic = require('node-static');
var http = require('http');
var SnakeGame = require('./snakes/game.js');
var TankGame = require('./tanks/game.js');
var socketio = require('socket.io');
var _ = require('underscore');


//var isHeroku = !!process.env.DYNO;

var Server = function () {
    this.init.apply(this, arguments);
};

_.extend(Server.prototype, {
    gameObjects: {
        snakes: SnakeGame,
        tanks: TankGame
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

    games: {},

    defaultPort: 5000,

    fileServer: new nstatic.Server(__dirname + '/../client/'),

    init: function () {
        _(this).bindAll('onSocketConnection', 'addPlayer', 'handler');
    },

    start: function () {
        var port = process.env.PORT || this.defaultPort;
        var app = http.createServer(this.handler);
        app.listen(port);

        var io;
        io = socketio.listen(app);
        io.set('log level', 3);
        io.sockets.on('connection', this.onSocketConnection);
    },

    //Http handler, it will server all static files
    handler: function (req, res) {
        var self = this;
        req.addListener('end', function () {
            self.fileServer.serve(req, res, function (e) {
                if (e && (e.status === 404)) {
                    self.fileServer.serveFile('/../client/index.html', 200, {}, req, res);
                }
            });
        }).resume();
    },

    onSocketConnection: function (socket) {
        var self = this;
        socket.on('add-player', function (data) {
            self.addPlayer(socket, data);
        });
        socket.on('go-to-game', function (data) {
            self.goToGame(socket, data);
        });
        socket.emit('games', this.games);
    },

    addPlayer: function (socket, data) {
        this.games[data.game].addPlayer(data);
        //Update UI games list
        socket.emit('games', this.games);
    },

    goToGame: function (socket, data) {
        //Get or Create Game
        var game = this.games[data.name] || new this.gameObjects[data.type](this.gameOptions[data.type]);
        
        //Start Game
        game.start();

        //Add game to games list
        this.games[data.name] = game;

        //Remove socket from viewers, one socket can view only one game at a time.
        _.invoke(this.games, 'unregisterViewer', socket);

        //Register socket as viewer
        game.registerViewer(socket);

        //Update UI games list
        socket.emit('games', this.games);
    }
});

//Run server
var server = new Server();
server.start();