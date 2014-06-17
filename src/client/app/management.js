/* global module, require */
'use strict';
var _ = require('underscore'),
    Backbone = require('backbone');

var Management = Backbone.View.extend({
    templates: {
        SnakeGame: require('./templates/management.hbs'),
        HerokuSnakeGame: require('./templates/management-heroku.hbs'),
        TankGame: require('./templates/management.hbs')
    },

    handlers: {
        SnakeGame: 'addPlayer',
        HerokuSnakeGame: 'addHerokuPlayer',
        TankGame: 'addPlayer',
    },

    events: {
        'submit form': 'submit'
    },

    initialize: function (options) {
        this.socket = options.socket;
        _(this).bindAll('onConfig');
    },

    submit: function (e) {
        e.preventDefault();
        var handlerName = this.handlers[this.model.get('type')];
        var data = this[handlerName]();
        this.socket.emit('add-player', data);
    },

    addPlayer: function () {
        var name = this.$('input[name="name"]').val();
        var url = this.$('input[name="url"]').val();
        return {
            game: this.model.get('name'),
            name: name,
            url: url
        };
    },

    addHerokuPlayer: function () {
        var name = this.$('input[name="name"]').val();
        return {
            game: this.model.get('name'),
            name: name
        };
    },

    onConfig: function (config) {
        this.model.set({
            type: config.type
        });
        this.render();
    },

    getTemplete: function () {
        return this.templates[this.model.get('type')];
    },

    render: function () {
        var template = this.getTemplete();
        this.$el.html(template());
    }
});

module.exports = Management;