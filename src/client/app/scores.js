/* global module, require */
'use strict';
var _ = require('underscore'),
    Backbone = require('backbone');

var Scores = Backbone.View.extend({
    template: require('./templates/scores.hbs'),

    initialize: function () {
        _(this).bindAll('onScores');
    },

    onScores: function (scores) {
        this.scores = scores;
        this.render();
    },

    render: function () {
        var self = this;
        var scores = _.map(self.scores, function (value, key) {
            return {
                name: key,
                length: value
            };
        });
        
        scores = _.sortBy(scores, function (item) {
            return -item.length;
        });

        this.$el.html(this.template({scores: scores}));
    }

});

module.exports = Scores;