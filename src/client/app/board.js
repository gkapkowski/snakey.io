/* global module, require, requestAnimationFrame, document */
'use strict';
var _ = require('underscore'),
    Backbone = require('backbone');

var getRandomColor = function () {
    //http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript/1484514#1484514
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i+=1 ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
};


var Board = Backbone.View.extend({
    template: require('./templates/board.hbs'),
    isFree: true,
    colors: {
        players: _.map(_.range(100), function () {
            return getRandomColor();
        }),
        empty: '#ffffff'
    },

    initialize: function () {
        _(this).bindAll(
            'onConfig', 'onBoard', 'drawPlayer',
            'fillCanvas', 'updateScreen');
        this.listenTo(this.model, 'change:name', this.render);
    },

    onConfig: function (config) {
        // set size of one `building block` of board
        this.size = parseInt(this.canvas.width/config.size);
    },

    onBoard: function (board) {
        this.board = board;
        if (this.isFree){
            this.isFree = false;
            this.updateScreen();
        }
    },

    updateScreen: function () {
        this.fillCanvas();
        this.canvasContext.drawImage(this.background, 0, 0);
        requestAnimationFrame(this.updateScreen);
    },

    fillCanvas: function () {
        this.backgroundContext.fillStyle = this.colors.empty;
        this.backgroundContext.fillRect(
            0, 0,
            this.board.size * this.size,
            this.board.size * this.size
        );

        this.drawPlayers();
        this.drawOthers();
    },

    drawPlayers: function () {
        _.each(this.board.state.players, this.drawPlayer);
    },

    drawPlayer: function () {
        //Implement in subclass
        // params: player
    },

    drawOthers: function () {
        //Implement in subclass
    },

    render: function () {
        this.$el.html(this.template({name: this.model.get('name')}));
        this.canvas = this.$('canvas')[0];
        this.canvasContext = this.canvas.getContext('2d');

        this.background = document.createElement('canvas');
        this.background.width = this.canvas.width;
        this.background.height = this.canvas.height;
        this.backgroundContext = this.background.getContext('2d');
    }
});

module.exports = Board;