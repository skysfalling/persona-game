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
    width: 320, // Set the desired width of the scaled window
    height: 320, // Set the desired height of the scaled window
    zoom: 2, // Set the desired zoom level
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
            gravity: { y: 0 }
        }
    },
    scene: [Play, PlayUI]
};

const game = new Phaser.Game(config);

// globals
const centerX = game.config.width / 2;
const centerY = game.config.height / 2;
const w = game.config.width;
const h = game.config.height;
let cursors = null;

let globalDepth = {
    background: -3,
    env_background: -2,
    playerEffects: -1,
    playArea: 0,
    env_foreground: 1,
    ui: 2
}

let screen = {
    center: { 
      x: game.config.width/2, 
      y: game.config.height/2 
    },
    width: game.config.width,
    height: game.config.height,
    topLeft: {
      x: 0,
      y: 0
    },
    topMid: {
      x: game.config.width / 2,
      y: 0
    },
    topRight: {
      x: game.config.width,
      y: 0
    },
    rightMid: {
      x: game.config.width,
      y: game.config.height/2
    },
    botRight: { 
      x: game.config.width, 
      y: game.config.height 
    },
    botMid: {
      x: game.config.width/2,
      y: game.config.height
    },
    botLeft: { 
      x: 0, 
      y: game.config.height 
    },
    leftMid: {
      x: 0,
      y: game.config.height/2
    },
  }