function getRandomColor() {
    //http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript/1484514#1484514
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

var Scores = Backbone.View.extend({
    

    initialize: function (options) {
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
            }
        });
        
        scores = _.sortBy(scores, function (item) {
            return -item.length;
        });

        self.$el.html('<ul></ul>');
        _.each(scores, function (item) {
            self.$('ul').append('<li>' + item.length + ' ' + item.name + '</li>');
        });
    }

});

var Board = Backbone.View.extend({
    isFree: true,
    colors: {
        snakes: _.map(_.range(100), function () {
            return getRandomColor();
        }),
        apple: '#ff0000',
        empty: '#ffffff'
    },

    initialize: function (options) {
        _(this).bindAll(
            'onConfig', 'onBoard',
            'drawApple', 'drawSnake',
            'render', 'updateScreen');
        this.size = options.size;

        this.canvas = this.$('canvas')[0];
        this.canvasContext = this.canvas.getContext("2d");
    },

    onConfig: function (config) {
        var width = config.size * this.size;
        var height = config.size * this.size;

        this.$el.css('width', width + 20);
        this.$el.css('height', width + 20);
        this.canvas.width = width;
        this.canvas.height = height;
    },

    onBoard: function (board) {
        this.board = board;
        if (this.isFree){
            this.isFree = false;
            this.updateScreen();
        }
    },

    updateScreen: function () {
        this.render();
        requestAnimationFrame(this.updateScreen);
    },

    render: function () {
        this.canvasContext.fillStyle = this.colors.empty;
        this.canvasContext.fillRect(0, 0, this.board.size * this.size, this.board.size * this.size);

        var snakes = this.board.state.snakes;
        var apples = this.board.state.apples;

        this.drawApples(apples);
        this.drawSnakes(snakes);
    },

    drawApples: function (apples) {
        this.canvasContext.fillStyle = this.colors.apple;
        _.each(apples, this.drawApple);
    },  

    drawApple: function (coords) {
        this.canvasContext.beginPath();
        this.canvasContext.arc(
            coords.x * this.size + (this.size/2), 
            coords.y * this.size + (this.size/2), 
            this.size/2, 0, 2*Math.PI);
        this.canvasContext.fill();
        this.canvasContext.stroke();
    },

    drawSnakes: function (snakes) {
        _.each(snakes, this.drawSnake);
    },

    drawSnake: function (snake) {
        var self = this;
        self.canvasContext.fillStyle = self.colors.snakes[snake.uniqueId];;
        _.each(snake.body, function (coords, index) {
            self.canvasContext.beginPath();
            self.canvasContext.arc(
                coords.x * self.size + (self.size/2), 
                coords.y * self.size + (self.size/2), 
                self.size/2, 0, 2*Math.PI);
            self.canvasContext.fill();
            self.canvasContext.stroke();
            if (index == 0) {
                self.canvasContext.fillText(
                    snake.options.name, 
                    coords.x * self.size - 2, 
                    coords.y * self.size - 2);
            }
        });
    }
});

var Management = Backbone.View.extend({

    events: {
        'submit form': 'addSnake'
    },

    initialize: function (options) {
        this.socket = options.socket;
    },

    addSnake: function (e) {
        e.preventDefault();
        var name = this.$('input[name="name"]').val();
        var url = this.$('input[name="url"]').val();
        this.socket.emit('add-snake', {
            name: name,
            url: url
        });
    }
});

var Client = Backbone.View.extend({

    initialize: function (options) {
        this.socket = io.connect(); //connect to source domain
        
        //Board
        this.board = new Board({
            el: this.$('.board'),
            size: options.size
        });
        this.socket.on('config', this.board.onConfig);
        this.socket.on('board', this.board.onBoard);
        
        //Scores
        this.scores = new Scores({
            el: this.$('.scores'),
        });
        this.socket.on('scores', this.scores.onScores);

        //Management
        this.management = new Management({
            el: this.$('.management'),
            socket: this.socket
        });
    }
});