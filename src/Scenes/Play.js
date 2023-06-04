class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // load assets
        this.load.path = "./assets/";
        this.load.image("1bit_tiles", "tilemap/monochrome_packed.png");    // tile sheet

        this.load.tilemapTiledJSON("map", "tilemap/map2.json");    // Tiled JSON file

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
        this.gizmos.graphics.setDepth(2);
        this.gizmos.enabled = false;

    }

    create() {

        this.lights.enable().setAmbientColor(0x555555);

        // get inputs
        this.cursors = this.input.keyboard.createCursorKeys();

        // #region [[ SETUP TILEMAP ]]
        // add a tile map
        this.map = this.add.tilemap("map"); 
        const tileset = this.map.addTilesetImage("monochrome_packed", "1bit_tiles");

        // setup tilemap layers
        const backgroundLayer = this.map.createLayer("background", tileset, 0, 0).setPipeline('Light2D');
        backgroundLayer.setDepth(globalDepth.background);

        const collisionLayer = this.map.createLayer("collision", tileset, 0, 0).setPipeline('Light2D');
        backgroundLayer.setDepth(globalDepth.env_background);
        collisionLayer.setCollisionByProperty({ collides: true });

        // create Room Handler from "rooms" object layer
        this.roomHandler = new RoomHandler(this, 'rooms');
        this.roomHandler.loadRooms();

        // #endregion

        // #region [[ CREATE PLAYERS ]]
        const p1Spawn = this.map.findObject("player_spawn", obj => obj.name === "p1spawn");
        this.p1 = new Player(this, p1Spawn.x, p1Spawn.y, 'character1', false);

        const p2Spawn = this.map.findObject("player_spawn", obj => obj.name === "p2spawn");
        this.p2 = new Player(this, p2Spawn.x, p2Spawn.y, 'character2', true);

        this.playerObjs = [this.p1, this.p2];
        // #endregion

        // #region [[ CREATE OBJECTS ]]
        this.interactObjects = this.add.group();

        // Create the custom sprite using the specified settings
        const objSpawn = this.map.findObject("interaction", obj => obj.name === "moveable_obj");
        this.heart = new Heart(this, objSpawn.x, objSpawn.y, 'tileAtlas', 529);
        // #endregion

        // #region [[ CREATE COLLISIONS ]]
        this.physics.world.TILE_BIAS = 1000;  // increase to prevent sprite tunneling through tiles

        // add a collision handler
        this.collisionHandler = new CollisionHandler(this);
        this.collisionHandler.collideWithCollisionLayer(this.p1, collisionLayer);
        this.collisionHandler.collideWithCollisionLayer(this.p2, collisionLayer);

        this.collisionHandler.playerOverlap(this.p1, this.p2);

        // - object collision --------------------------------------------------------
        this.collisionHandler.collideWithCollisionLayer(this.heart, collisionLayer);
        this.collisionHandler.mainObjectCollision(this.playerObjs, this.interactObjects);

        // - player overlap --------------------------------------------------------
        this.collisionHandler.overlapWithTrigger(this.p1.overlapTrigger, this.interactObjects, (player, object) => {
            this.p1.newTetheredObject(object);
            object.connectPlayer(this.p1);
        });

        this.collisionHandler.overlapWithTrigger(this.p2.overlapTrigger, this.interactObjects, (player, object) => {
            this.p2.newTetheredObject(object);
            object.connectPlayer(this.p2);
        });

        // #endregion

        // #region [[ SETUP CAMERA MOVEMENT]]
        this.cameraMovement = new CameraMovement(this);
        this.cameraMovement.setup();

        // Define a key to toggle editor mode
        this.input.keyboard.on('keydown-SPACE', () => {
            this.cameraMovement.toggleEditorMode();
        });
        // #endregion

        //#region [[ HTML REFERENCES ]]
        this.physics.world.drawDebug = false;

        // toggle gizmos
        const enableGizmosButton = document.querySelector("#enable-gamegizmos");
        enableGizmosButton.innerHTML = "Game Gizmos: " + this.gizmos.enabled;
        enableGizmosButton.addEventListener("click", () => { 
            this.gizmos.enabled = !this.gizmos.enabled;
            enableGizmosButton.innerHTML = "Game Gizmos: " + this.gizmos.enabled;

            this.toggleDebug();
            game.config.debug = !game.config.debug;

        }); 
        const enablePlayerGizmosButton = document.querySelector("#enable-playergizmos");
        enablePlayerGizmosButton.addEventListener("click", () => { 
            this.p1.toggleDebug();
            this.p2.toggleDebug();
        }); 
        //#endregion

    }

    toggleDebug(){
        if (this.physics.world.drawDebug) {
            this.physics.world.drawDebug = false;
            this.physics.world.debugGraphic.clear();
        }
        else 
        {
            this.physics.world.drawDebug = true;
        }
    }

    update (time, delta)
    {
        this.p1.update();
        this.p2.update();
        this.heart.update();

        this.gizmos.clear();
        this.gizmos.drawLine({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y}, 0xff00ff, 1);

        //this.gizmos.drawExistingRect(this.overlapTrigger, this.p1.x, this.p1.y, 0xff00ff, 1, 1);

        this.cameraMovement.update(this.gizmos);

    }
}