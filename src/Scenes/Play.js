class Play extends Phaser.Scene {
    constructor() {
        super("tiledSimpleScene");
    }

    
    preload() {
        // load assets
        this.load.path = "./assets/";
        this.load.image("1bit_tiles", "tilemap/monochrome_packed.png");    // tile sheet
        this.load.tilemapTiledJSON("map", "tilemap/map1.json");    // Tiled JSON file

        this.load.spritesheet('character1', '/characters/character1.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        
        this.load.spritesheet('character2', '/characters/character2.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.physics.add.existing(this);
    }

    create() {
        // add a tile map
        this.map = this.add.tilemap("map"); 
        const tileset = this.map.addTilesetImage("monochrome_packed", "1bit_tiles");

        // setup tilemap layers
        const backgroundLayer = this.map.createLayer("background", tileset, 0, 0);
        const collisionLayer = this.map.createLayer("collision", tileset, 0, 0);
        collisionLayer.setCollisionByProperty({ collides: true });

        // get inputs
        this.cursors = this.input.keyboard.createCursorKeys();

        // create players
        const p1Spawn = this.map.findObject("player_spawn", obj => obj.name === "p1spawn");
        this.p1 = new Player(this, p1Spawn.x, p1Spawn.y, 'character1', false);
        const p2Spawn = this.map.findObject("player_spawn", obj => obj.name === "p2spawn");
        this.p2 = new Player(this, p2Spawn.x, p2Spawn.y, 'character2', true);

        // #region << COLLISIONS >>
        // collide with collision layer, using sprite index
        collisionLayer.setCollisionBetween(52, 54);
        this.physics.add.collider(this.p1, collisionLayer);
        this.physics.add.collider(this.p2, collisionLayer);
        // #endregion

        //#region << CAMERA SETUP >>
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.p1);
        //this.cameras.main.setZoom(2);
        //#endregion

        this.cursors = this.input.keyboard.createCursorKeys();

    }

    update (time, delta)
    {
        this.p1.update();
        this.p2.update();
    }
}