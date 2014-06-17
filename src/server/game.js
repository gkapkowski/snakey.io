/* global require, module, setTimeout */
'use strict';
var _ = require('underscore');
var async = require('async');


var SynchronousGame = function () {
    this.init.apply(this, arguments);
};


_.extend(SynchronousGame.prototype, {
    //Animation
    FPS: 30,
    lastFrame: new Date() * 1,
    
    started: false,

    init: function (options) {
        _(this).bindAll(
            'start',
            'addPlayer',
            'updateScore',
            'isAlive',
            'updateAllPlayers',
            'allPlayersUpdated');
        
        this.options = options;
        this.boardSize = options.size;
        //Clients
        this.clients = [];
        //Score Board
        this.scores = {};
        //Players
        this.players = [];
        this.newPlayers = [];
    },

    toJSON: function () {
        return {
            players: this.players,
            options: this.options,
            boardSize: this.boardSize,
        };
    },

    addNewPlayers: function () {
        this.players = _.union(this.players, this.newPlayers);
        this.newPlayers.length = 0;
    },

    addPlayer: function (details) {
        this.newPlayers.push(this.createPlayer(details));
    },

    createPlayer: function (details) {
        //NOTE: implement in subclass.
    },

    updateAllScores: function () {
        _.each(this.players, this.updateScore);
    },

    updateScore: function (player) {
        var maxScore = this.scores[player.name];
        var newScore = Math.max(player.score(), maxScore || 1);
        this.scores[player.name] = newScore;
    },

    isAlive: function (player) {
        if (!this.isOnBoard(player) || this.hasColided(player)) {
            player.reset();
        }
    },

    isOnBoard: function (player) {
        var head = player.getHead();
        return (head.x >= 0) &&
        (head.y >= 0) &&
        (head.x <= this.boardSize - 1) &&
        (head.y <= this.boardSize - 1);
    },

    hasColided: function (player) {
        var players = _.map(this.players, function (other) {
            if (other.uniqueId !== player.uniqueId) {
                //Other player
                return other.body;
            } else {
                //My own body, check if I hit myself
                return other.body.slice(1);
            }
        });
        var head = player.getHead();
        return _.any(players, function (otherBody) {
            return !!_.where(otherBody, head).length;
        });
    },

    //Call all players and update board state
    updateAllPlayers: function () {
        this.addNewPlayers();

        var board = this.createBoard();

        //move ALL players
        async.each(this.players, function (player, callWhenFinished) {
            player.move(board, callWhenFinished);
        }, this.allPlayersUpdated);
    },

    allPlayersUpdated: function (err) {
        //check if any snake dies or have eaten apple
        _.each(this.players, this.isAlive);
        this.onAllPlayersUpdated();

        this.updateAllScores();

        var now = new Date()*1;
        if (now - this.lastFrame > (1000/this.FPS)) {
            this.emitFrame();
            this.lastFrame = now;
        }

        setTimeout(this.updateAllPlayers, this.options.speed);
    },

    onAllPlayersUpdated: function () {
        //NOTE: implement in subclass
    },

    emitFrame: function () {
        var boardState = this.getBoardState();
        var boardSize = this.boardSize;
        var scores = this.scores;

        _.each(this.clients, function (socket) {
            socket.emit('board', {
                size: boardSize,
                state: boardState
            });
            socket.emit('scores', scores);
        });
    },

    getBoardState: function () {
        return {players: this.players};
    },

    getPlayerOrigin: function (details) {
        return details.url;
    },

    registerViewer: function (socket) {
        this.clients.push(socket);
        socket.emit('config', {
            size: this.options.size,
            type: this.name
        });
    },

    unregisterViewer: function (socket) {
        this.clients = _.filter(this.clients, function (item) {
            return item !== socket;
        });
    },

    start: function () {
        if (!this.started) {
            this.updateAllPlayers();
            this.started = true;
        }
    }
});

module.exports = SynchronousGame;