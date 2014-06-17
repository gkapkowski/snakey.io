/* global module, require */
'use strict';
var $ = require('jquery'),
    Backbone = require('backbone'),
    io = require('socket.io-client'),
    Scores = require('./scores.js'),
    Games = require('./games.js'),
    Management = require('./management.js'),
    SnakeBoard = require('./board.snakes.js'),
    State = require('./state.js');
Backbone.$ = $;

var Client = Backbone.View.extend({

    initialize: function () {
        
    },

    start: function () {
        this.socket = io.connect(); //connect to source domain
        //Games
        this.games = new Games({
            el: this.$('.games'),
            socket: this.socket,
            model: this.model
        });
        this.socket.on('games', this.games.setGames);

        //Board
        this.board = new SnakeBoard({
            el: this.$('.board'),
            model: this.model
        });
        this.socket.on('config', this.board.onConfig);
        this.socket.on('board', this.board.onBoard);
        
        //Scores
        this.scores = new Scores({
            el: this.$('.scores'),
            model: this.model
        });
        this.socket.on('scores', this.scores.onScores);

        //Management
        this.management = new Management({
            el: this.$('.management'),
            socket: this.socket,
            model: this.model
        });
        this.socket.on('config', this.management.onConfig);
    }
});

var client = new Client({
    el: $('.main'),
    model: new State()
});
client.start();

module.exports = Client;