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

let global_colors = {
    white: {
        int: 0xFFFFFF,
        hex: "#FFFFFF"
    },
    black: {
        int: 0x000000,
        hex: "#000000"
    },
    violet: {
        light1: {
            int: 0xCEA6FF,
            hex: "#CEA6FF"
        },
        light2: {
            int: 0xB583F2,
            hex: "#B583F2"
        },
        int: 0xd972ff,
        hex: "#d972ff",
        dark1: {
            int: 0xAA70F3,
            hex: "#AA70F3"
        },
        dark2: {
            int: 0x8661b5,
            hex: "#8661b5"
        },
    },
    blue: {

        // light blues
        light1: {
            int: 0xA45BE7,
            hex: "#A45BE7"
        },
        light2: {
            int: 0x996FCC,
            hex: "#996FCC"
        },

        // blue
        int: 0x645eff,
        hex: "#645eff",
        
        // dark blues
        dark1: {
            int: 0x180D6E,
            hex: "#180D6E"
        },
        dark2: {
            int: 0x0B0630,
            hex: "#0B0630"
        }
    },
    green: {
      etherealMint: {
        int: 0x89FFD9,
        hex: "#89FFD9"
      },
      whimsicalGreen: {
        int: 0x7FEBBA,
        hex: "#7FEBBA"
      },
      enchantedEmerald: {
        int: 0x6DCCAD,
        hex: "#6DCCAD"
      }
    }
}