class Play extends Phaser.Scene {
    constructor() {
        super("tiledSimpleScene");
    }

    preload() {
        // load assets
        this.load.path = "./assets/";
        this.load.image("1bit_tiles", "tilemap/monochrome_packed.png");    // tile sheet
        this.load.tilemapTiledJSON("map", "tilemap/map1.json");    // Tiled JSON file
    }

    create() {
        // add a tile map
        // https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObjectFactory.html#tilemap__anchor
        const map = this.add.tilemap("map");    // this is referencing the key to our Tiled JSON file
        // add a tile set to the map
        // first parameter: the name we gave the tileset when we added it to Tiled
        // second parameter: the key for the tile sheet we loaded above, in preload
        // https://photonstorm.github.io/phaser3-docs/Phaser.Tilemaps.Tilemap.html#addTilesetImage__anchor
        const tileset = map.addTilesetImage("monochrome_packed", "1bit_tiles");
        // create a new tilemap layer
        // https://newdocs.phaser.io/docs/3.54.0/Phaser.Tilemaps.Tilemap#createLayer
        const backgroundLayer = map.createLayer("background", tileset, 0, 0);
        const collisionLayer = map.createLayer("collision", tileset, 0, 0);


        // define keyboard cursor input
        cursors = this.input.keyboard.createCursorKeys();

        // create camera control configuration object to pass to Camera Controller (see below)
        // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Cameras.Controls.html#.SmoothedKeyControlConfig__anchor
        let controlConfig = {
            camera: this.cameras.main,      // which camera?
            left: cursors.left,             // define keys...
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            zoomSpeed: 0.02,
            acceleration: 0.06,             // physics values (keep these low)
            drag: 0.0005,
            maxSpeed: 0.5
        }
        // create smoothed key camera control
        // i.e., we control the cam w/ the defined keys w/ physics controls
        // note: you *must* call the update method of this controller each frame (see below)
        // https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Controls.SmoothedKeyControl.html
        this.camControl = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        // set camera bounds
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // enable scene switcher / reload keys
        this.swap = this.input.keyboard.addKey('S');
        this.reload = this.input.keyboard.addKey('R');

        // update instruction text
        document.getElementById('description').innerHTML = '<h2>TiledSimple.js</h2><br>Arrow keys: Move Camera<br>Q/E: Zoom out/in<br>S: Next Scene<br>R: Restart Scene';

        // debug
        //this.scene.start("tiledPlatformScene");
    }

    update(time, delta) {
        // update our camera controller (delta: Δ time in ms since last frame)
        this.camControl.update(delta);

        // scene switching / restart
        if(Phaser.Input.Keyboard.JustDown(this.reload)) {
            this.scene.restart();
        }
        if(Phaser.Input.Keyboard.JustDown(this.swap)) {
            this.scene.start("tiledPlatformScene");
        }
    }
}