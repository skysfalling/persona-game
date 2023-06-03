class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // load assets
        this.load.path = "./assets/";
        this.load.image("1bit_tiles", "tilemap/monochrome_packed.png");    // tile sheet

        this.load.tilemapTiledJSON("map", "tilemap/map1.json");    // Tiled JSON file

        this.load.spritesheet('tileAtlas', 'tilemap/monochrome_packed.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('character1', '/characters/character1.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        
        this.load.spritesheet('character2', '/characters/character2.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.physics.add.existing(this);
        this.gizmos = new Gizmos(this);
        this.gizmos.graphics.setDepth(1);
        this.gizmos.visible = false;

    }

    create() {

        // add a tile map
        this.map = this.add.tilemap("map"); 
        const tileset = this.map.addTilesetImage("monochrome_packed", "1bit_tiles");

        // setup tilemap layers
        const backgroundLayer = this.map.createLayer("background", tileset, 0, 0).setPipeline('Light2D');
        const collisionLayer = this.map.createLayer("collision", tileset, 0, 0).setPipeline('Light2D');
        collisionLayer.setCollisionByProperty({ collides: true });

        // 
        this.lights.enable().setAmbientColor(0x555555);

        // get inputs
        this.cursors = this.input.keyboard.createCursorKeys();

        // create players
        const p1Spawn = this.map.findObject("player_spawn", obj => obj.name === "p1spawn");
        this.p1 = new Player(this, p1Spawn.x, p1Spawn.y, 'character1', false);
        this.startP1 = this.p1;

        const p2Spawn = this.map.findObject("player_spawn", obj => obj.name === "p2spawn");
        this.p2 = new Player(this, p2Spawn.x, p2Spawn.y, 'character2', true);
        this.startP2 = this.p2;

        this.playerObjs = [this.p1, this.p2];

        // create objects
        this.interactObjects = this.add.group();

        // Create the custom sprite using the specified settings
        const objSpawn = this.map.findObject("interaction", obj => obj.name === "moveable_obj");
        this.heart = new Heart(this, objSpawn.x, objSpawn.y, 'tileAtlas', 529);

        // << COLLISIONS >>
        this.physics.world.TILE_BIAS = 1000;  // increase to prevent sprite tunneling through tiles

        // add a collision handler
        this.collisionHandler = new CollisionHandler(this);
        this.collisionHandler.collideWithCollisionLayer(this.p1, collisionLayer);
        this.collisionHandler.collideWithCollisionLayer(this.p2, collisionLayer);
        this.collisionHandler.playerOverlap(this.p1, this.p2);
        this.collisionHandler.mainObjectCollision(this.playerObjs, this.interactObjects);
        this.collisionHandler.overlapWithTrigger(this.interactObjects, this.startP1.overlapTrigger, this.startP1);
        this.collisionHandler.overlapWithTrigger(this.interactObjects, this.startP2.overlapTrigger, this.startP2);

        // << CAMERA MOVEMENT >>
        this.cameraMovement = new CameraMovement(this);
        this.cameraMovement.setup();

        // Define a key to toggle editor mode
        this.input.keyboard.on('keydown-SPACE', () => {
            this.cameraMovement.toggleEditorMode();
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        //#region << HTML REFERENCES >>
        // toggle gizmos
        const enableGizmosButton = document.querySelector("#enable-gamegizmos");
        enableGizmosButton.innerHTML = "Game Gizmos: " + this.gizmos.visible;
        enableGizmosButton.addEventListener("click", () => { 
            this.gizmos.visible = !this.gizmos.visible;
            enableGizmosButton.innerHTML = "Game Gizmos: " + this.gizmos.visible;
        }); 
        const enablePlayerGizmosButton = document.querySelector("#enable-playergizmos");
        enablePlayerGizmosButton.innerHTML = "Player Gizmos: " + this.p1.gizmos.visible;
        enablePlayerGizmosButton.addEventListener("click", () => { 
            this.p1.gizmos.visible = !this.p1.gizmos.visible;
            this.p2.gizmos.visible = !this.p2.gizmos.visible;
            enablePlayerGizmosButton.innerHTML = "Player Gizmos: " + this.p1.gizmos.visible;
        }); 
        //#endregion
    
    }

    update (time, delta)
    {
        //adjust references based on horz pos
        if (this.p1.x > this.p2.x) { 
            let temp = this.p1;
            this.p1 = this.p2;
            this.p2 = temp;
        }

        this.p1.update();
        this.p2.update();
        this.heart.update();

        this.gizmos.clear();
        this.gizmos.drawLine({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y}, 0xff00ff, 1);

        //this.gizmos.drawExistingRect(this.overlapTrigger, this.p1.x, this.p1.y, 0xff00ff, 1, 1);

        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z))) {
            this.p1.inverted  = !this.p1.inverted;
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X))) {
            this.p2.inverted  = !this.p2.inverted;
        }

        this.cameraMovement.update(this.gizmos);

    }


}