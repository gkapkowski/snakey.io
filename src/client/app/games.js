/* global module, require */
'use strict';
var _ = require('underscore'),
    Backbone = require('backbone'),
    $ = require('jquery');

var Games = Backbone.View.extend({
    template: require('./templates/games.hbs'),

    events: {
        'click a.new-game': 'newGame',
        'click a.join-game': 'joinGame'
    },

    initialize: function (options) {
        _(this).bindAll('setGames');
        this.socket = options.socket;
    },

    newGame: function (e) {
        e.preventDefault();
        this.goToGame(this.$('input[name="name"]').val());
    },

    joinGame: function (e) {
        e.preventDefault();
        this.goToGame($(e.currentTarget).data('name'));
    },

    goToGame: function (name) {
        this.model.set({name: name});
        this.socket.emit('go-to-game', {
            name: name,
            type: 'snakes'
        });
    },

    setGames: function (games) {
        this.games = games;
        this.render();
    },

    render: function () {
        var content = this.template({
            games: this.games,
            current: this.model.get('name')
        });
        this.$el.html(content);
    }
});

module.exports = Games;