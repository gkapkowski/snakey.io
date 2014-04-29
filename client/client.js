function getRandomColor() {
    //http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript/1484514#1484514
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

// MODELS
var ClientState = Backbone.Model.extend();


var Scores = Backbone.View.extend({
    template: _.template($('#scores').html()),

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
            };
        });
        
        scores = _.sortBy(scores, function (item) {
            return -item.length;
        });

        this.$el.html(this.template({scores: scores}));
    }

});

var Board = Backbone.View.extend({
    template: _.template($('#board').html()),
    isFree: true,
    colors: {
        players: _.map(_.range(100), function () {
            return getRandomColor();
        }),
        empty: '#ffffff'
    },

    initialize: function (options) {
        _(this).bindAll(
            'onConfig', 'onBoard', 'drawPlayer',
            'fillCanvas', 'updateScreen');
        this.listenTo(this.model, 'change:name', this.render);
    },

    onConfig: function (config) {
        this.size = parseInt(this.canvas.width/config.size);  // set size of one `building block` of board
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
        this.backgroundContext.fillRect(0, 0, this.board.size * this.size, this.board.size * this.size);

        this.drawPlayers();
        this.drawOthers();
    },

    drawPlayers: function () {
        _.each(this.board.state.players, this.drawPlayer);
    },

    drawPlayer: function (player) {
        //Implement in subclass
    },

    drawOthers: function () {
        //Implement in subclass
    },

    render: function () {
        this.$el.html(this.template({name: this.model.get('name')}));
        this.canvas = this.$('canvas')[0];
        this.canvasContext = this.canvas.getContext("2d");

        this.background = document.createElement('canvas');
        this.background.width = this.canvas.width;
        this.background.height = this.canvas.height;
        this.backgroundContext = this.background.getContext('2d');
    }
});

var SnakeBoard = Board.extend({

    initialize: function () {
        Board.prototype.initialize.apply(this, arguments);
        _(this).bindAll('drawApple');
        this.colors.apple = '#ff0000';
    },

    drawOthers : function () {
        this.drawApples();
    },

    drawApples: function () {
        this.backgroundContext.fillStyle = this.colors.apple;
        _.each(this.board.state.apples, this.drawApple);
    },  

    drawApple: function (coords) {
        this.backgroundContext.beginPath();
        this.backgroundContext.arc(
            coords.x * this.size + parseInt(this.size/2), 
            coords.y * this.size + parseInt(this.size/2), 
            parseInt(this.size/2), 0, 2*Math.PI);
        this.backgroundContext.fill();
        this.backgroundContext.stroke();
    },

    drawPlayer: function (snake) {
        var self = this;
        self.backgroundContext.fillStyle = self.colors.players[snake.uniqueId];
        _.each(snake.body, function (coords, index) {
            self.backgroundContext.beginPath();
            self.backgroundContext.arc(
                coords.x * self.size + parseInt(self.size/2), 
                coords.y * self.size + parseInt(self.size/2), 
                parseInt(self.size/2), 0, 2*Math.PI);
            self.backgroundContext.fill();
            self.backgroundContext.stroke();
            if (index === 0) {
                self.backgroundContext.fillText(
                    snake.options.name, 
                    coords.x * self.size - 2, 
                    coords.y * self.size - 2);
            }
        });
    }
});

TankBoard = Board.extend({

    drawPlayer: function (tank) {
        var self = this;
        var border = parseInt(1 * self.size/2 / 5);
        var playerSize = parseInt(4 * self.size/2 / 5);
        var coords = tank.body[0];
        var rotations = {
            right: 0,
            down: 90 * Math.PI/180,
            left: 180 * Math.PI/180,
            up: 270 * Math.PI/180,
        };

        self.backgroundContext.save();
        self.backgroundContext.fillStyle = self.colors.players[tank.uniqueId];
        //Set 0,0 of canvas to current player position
        self.backgroundContext.translate(
            coords.x * self.size + parseInt(self.size/2),
            coords.y * self.size + parseInt(self.size/2)
        );

        self.backgroundContext.fillRect(
            -playerSize,
            -playerSize,
            2*playerSize,
            2*playerSize
        );

        self.backgroundContext.fillText(
            tank.options.name, 
            - (playerSize + border), 
            - (playerSize + border)
        );

        self.backgroundContext.rotate(rotations[tank.facing]);

        //Canon
        self.backgroundContext.beginPath();
        self.backgroundContext.lineWidth = parseInt(self.size / 5);
        self.backgroundContext.moveTo(-border, 0);
        self.backgroundContext.lineTo(
            playerSize + border,
            0
        );
        self.backgroundContext.strokeStyle="green";
        self.backgroundContext.stroke(); 

        //Tracks
        self.backgroundContext.beginPath();
        self.backgroundContext.lineWidth = parseInt(self.size / 5);

        self.backgroundContext.moveTo(
            - (playerSize + border), 
            - (playerSize)
        );
        self.backgroundContext.lineTo(
            + (playerSize + border),
            - (playerSize)
        );
        
        self.backgroundContext.moveTo(
            - (playerSize + border), 
            + (playerSize)
        );
        self.backgroundContext.lineTo(
            + (playerSize + border),
            + (playerSize)
        );
        
        self.backgroundContext.strokeStyle="black";
        self.backgroundContext.stroke(); 

        self.backgroundContext.restore();
    }

});

var Management = Backbone.View.extend({
    templates: {
        SnakeGame: _.template($('#game-management').html()),
        HerokuSnakeGame: _.template($('#game-management-heroku').html()),
        TankGame: _.template($('#game-management').html()),
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

var Games = Backbone.View.extend({
    template: _.template($('#games').html()),

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
        this.$el.html(this.template({games: this.games, current: this.model.get('name')}));
    }
});

var Client = Backbone.View.extend({

    initialize: function (options) {
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