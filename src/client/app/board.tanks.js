/* global module, require */
'use strict';
var Board = require('./board.js');

var TankBoard = Board.extend({

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
        self.backgroundContext.strokeStyle = 'green';
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
        
        self.backgroundContext.strokeStyle = 'black';
        self.backgroundContext.stroke();

        self.backgroundContext.restore();
    }

});

module.exports = TankBoard;