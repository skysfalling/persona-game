class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // load assets
        this.load.path = "./assets/";
        this.load.image("tiles", "tilemap/whispering_pines_tileset.png");    // tile sheet
        this.load.image("persona", "tilemap/persona-tileset.png");    // tile sheet

        this.load.tilemapTiledJSON("map", "tilemap/whispering_pines_01.json");    // Tiled JSON file

        this.load.spritesheet('tileAtlas', 'tilemap/persona-tileset.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('game_characters', '/characters/game_characters.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        // Load Spritesheets
        this.load.spritesheet('campfire', 'sprites/campfire.png', {frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('cat_idle', 'sprites/cat_idle.png', {frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('cat_walk', 'sprites/cat_walk.png', {frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('heart', 'sprites/heart.png', {frameWidth: 16, frameHeight: 16 });

        this.physics.add.existing(this);
        this.gizmos = new Gizmos(this);
        this.gizmos.graphics.setDepth(2);
        this.gizmos.enabled = false;

    }

    create() {

        this.lights.enable().setAmbientColor(0xaaaaaa);

        // get inputs
        this.cursors = this.input.keyboard.createCursorKeys();

        // #region [[ SETUP TILEMAP ]] --------------------------------------------------------------//>>
        // add a tile map
        this.map = this.add.tilemap("map"); 
        const tileset = this.map.addTilesetImage("whispering_pines_tileset", "tiles");
        const persona = this.map.addTilesetImage("persona", "persona");

        // setup tilemap layers
        const backgroundLayer = this.map.createLayer("background", tileset, 0, 0).setPipeline('Light2D');
        backgroundLayer.setDepth(globalDepth.background);

        const backgroundEnvLayer = this.map.createLayer("background_env", persona, 0, 0).setPipeline('Light2D');
        backgroundEnvLayer.setDepth(globalDepth.env_background);

        const backgroundEnvLayer2 = this.map.createLayer("background_env2", tileset, 0, 0).setPipeline('Light2D');
        backgroundEnvLayer2.setDepth(globalDepth.env_background);

        const collisionLayer = this.map.createLayer("collision", tileset, 0, 0).setPipeline('Light2D');
        backgroundLayer.setDepth(globalDepth.env_background);
        collisionLayer.setCollisionByProperty({ collides: true });

        // create Room Handler from "rooms" object layer
        this.roomHandler = new RoomHandler(this, 'rooms');
        this.roomHandler.loadRooms();

        // #endregion

        // #region [[ CREATE PLAYERS ]] --------------------------------------------------------------//>>
        const p1Spawn = this.map.findObject("player_spawn", obj => obj.name === "p1spawn");
        this.p1 = new Player(this, p1Spawn.x, p1Spawn.y, 'violet', 1, false);

        const p2Spawn = this.map.findObject("player_spawn", obj => obj.name === "p2spawn");
        this.p2 = new Player(this, p2Spawn.x, p2Spawn.y, 'blue', 2, true);
        //this.p2.enableMove = false;
        //this.p2.setVisible(false);
        //this.p2.setAlpha(0.5);

        this.playerObjs = [this.p1, this.p2];
        // #endregion

        // #region [[ SETUP CAMERA MOVEMENT]] --------------------------------------------------------------//>>
        this.cameraMovement = new CameraMovement(this, this.p1, this.p2);
        this.cameraMovement.setup();        

        // Define a key to toggle editor mode
        /*
        this.input.keyboard.on('keydown-SPACE', () => {
            //this.cameraMovement.toggleEditorMode();
        });
        */
        // #endregion

        // #region [[ CREATE OBJECTS ]] --------------------------------------------------------------//>>
        this.interactObjects = this.add.group();

        // (( HEARTS ))
        this.hearts = this.add.group();
        const heart_positions = this.map.filterObjects("interaction", obj => obj.name === "heart");
        heart_positions.forEach(heart => {
            const new_heart = new Heart(this, heart.x, heart.y, 'heart', null);
            this.hearts.add(new_heart);
        });

        // (( CAMPFIRES ))
        this.campfires = this.add.group();
        const campfire_positions = this.map.filterObjects("interaction", obj => obj.name === "campfire");
        campfire_positions.forEach(campfire => {
            const new_campfire = new Campfire(this, campfire.x, campfire.y); 
            this.campfires.add(new_campfire);
        });

        // (( CREATE CATS ))
        this.cats = this.add.group();
        const cat_positions = this.map.filterObjects("interaction", obj => obj.name === "cat");
        const cat_exits = this.map.filterObjects("interaction", obj => obj.name === "cat_exit");
        
        cat_positions.forEach(cat => {
          const exitId = cat.properties.exit_id;
          const correspondingExit = cat_exits.find(exit => exit.properties.exit_id === exitId);
        
          if (correspondingExit) {
            const new_cat = new Cat(this, cat.x, cat.y, 'cat_idle', cat.properties.id_type);
            new_cat.correspondingExit = correspondingExit;
            this.cats.add(new_cat);

            console.log('cat properties ' + JSON.stringify(cat.properties));
          } 
          else {
            console.warn(`No corresponding cat_exit object found for cat with exit_id: ${exitId}`);
          }
        });

        // (( CREATE HIDDEN OBJECTS ))
        const hiddenObjectPositions = this.map.filterObjects("violet_echos", obj => obj.name === "heart");

        this.violet_echos = this.add.group();

        // #endregion

        // #region [[ CREATE COLLISIONS ]] --------------------------------------------------------------//>>
        this.physics.world.TILE_BIAS = 1000;  // increase to prevent sprite tunneling through tiles

        // add a collision handler
        this.collisionHandler = new CollisionHandler(this);

        // - player collision --------------------------------------------------------
        this.collisionHandler.collideWithCollisionLayer(this.p1, collisionLayer);
        this.collisionHandler.collideWithCollisionLayer(this.p2, collisionLayer);
        this.collisionHandler.playerOverlap(this.p1, this.p2);
        // - player object connections --------------------------------------------------------

        this.collisionHandler.playerOverlapConnection(this.p1, this.campfires);
        this.collisionHandler.playerOverlapConnection(this.p2, this.campfires);
        // - object collision --------------------------------------------------------
        
        this.collisionHandler.collideWithCollisionLayer(this.hearts, collisionLayer);
        this.collisionHandler.heartObjectCollision(this.playerObjs, this.hearts);
        this.collisionHandler.objectCollision(this.playerObjs, this.campfires);
        this.collisionHandler.objectCollision(this.playerObjs, this.cats);
        // - object overlap --------------------------------------------------------
        this.hearts.children.iterate(heartObj => {
            this.collisionHandler.playerOverlapConnection(this.p1, heartObj);
            this.collisionHandler.playerOverlapConnection(this.p2, heartObj);

            // interact with cats
            this.collisionHandler.objectOverlapTrigger(heartObj , this.cats, (heart, cat) => {
                cat.submit(heartObj.id_type);
            });
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

        this.hearts.children.iterate(heart => {
            heart.update();
        });

        this.violet_echos.children.iterate(hiddenObject => {
            hiddenObject.update(this.p1);
        });

        this.gizmos.clear();
        this.gizmos.drawLine({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y}, 0xff00ff, 1);

        //this.gizmos.drawExistingRect(this.overlapTrigger, this.p1.x, this.p1.y, 0xff00ff, 1, 1);

        this.cameraMovement.update(this.gizmos);

    }
}

class PlayUI extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'UIScene', active: true });

    }

    preload(){
        
        this.load.bitmapFont('awasete', 'assets/fonts/awasete.png', 'assets/fonts/awasete.xml');

        this.load.spritesheet('character_profiles', 'assets/characters/character_profiles.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    create () {

        // << LEVEL SETUP >>
        // Create a new instance of LevelRoutine with the JSON file
        const levelRoutine = new LevelRoutine(this, '/assets/level_routine.json');

        // Start the routine
        levelRoutine.start();
    }
}