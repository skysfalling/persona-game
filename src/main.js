// ======================================================
//
// Persona 
// skysfalling - 2023
// 
// =====================================================

// debug with extreme prejudice
"use strict";

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.WEBGL,
    render: {
        pixelArt: true
    },
    backgroundColor: '#000000',
    width: 320,
    height: 320,
    zoom: 2,
    physics: {
        default: "arcade",
        arcade: {
            //debug: true,
            gravity: { y: 0 }
        }
    },
    scene: [ Play ]
};

const game = new Phaser.Game(config);

// globals
const centerX = game.config.width / 2;
const centerY = game.config.height / 2;
const w = game.config.width;
const h = game.config.height;
let cursors = null;