
class Level2 extends Phaser.Scene {
    constructor() {
        super("Level2");
    }

    preload() {
        console.log(">> Level 2 initialization");
        this.load.path = "./assets/";
        //this.scene.launch('UI');

        this.soundManager = new SoundManager(this);
        this.soundManager.load();
        this.gameManager = this.scene.get('GameManager');
        if (this.gameManager.gameProgression === 1){
            this.gameManager.gameProgression = 2;
        }

        // load assets
        this.load.image("tiles", "tilemap/whispering_pines_tileset.png");    // tile sheet
        this.load.image("persona", "tilemap/persona-tileset.png");    // tile sheet

        this.load.tilemapTiledJSON("level2_map", "tilemap/whispering_pines_02.json");    // Tiled JSON file
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


        this.objectiveCount = {};

    }

    create() {

        // Create a new instance of LevelRoutine with the JSON file
        this.levelRoutine = new LevelRoutine(this);
        this.levelRoutine.uiScene = this.scene.get('UI');
        this.levelRoutine.loadJSON('level2', 'level2_routine.json');

        this.lights.enable().setAmbientColor(0xaaaaaa);

        // get inputs
        this.cursors = this.input.keyboard.createCursorKeys();

        // #region [[ SETUP TILEMAP ]] --------------------------------------------------------------//>>
        // add a tile map
        this.map = this.add.tilemap("level2_map"); 
        const tileset = this.map.addTilesetImage("whispering_pines_tileset", "tiles");
        const persona = this.map.addTilesetImage("persona", "persona");

        // setup tilemap layers
        const env_foregroundLayer = this.map.createLayer("env_foreground", tileset, 0, 0).setPipeline('Light2D');
        env_foregroundLayer.setDepth(globalDepth.env_foreground);

        const env_backgroundLayer = this.map.createLayer("env_background", tileset, 0, 0).setPipeline('Light2D');
        env_backgroundLayer.setDepth(globalDepth.env_background);

        const collisionLayer = this.map.createLayer("collision", tileset, 0, 0).setPipeline('Light2D');
        collisionLayer.setDepth(globalDepth.env_background);

        const collision_foregroundLayer = this.map.createLayer("collision_foreground", tileset, 0, 0).setPipeline('Light2D');
        collision_foregroundLayer.setDepth(globalDepth.env_foreground);

        const unlitLayer = this.map.createLayer("unlit", tileset, 0, 0);
        collision_foregroundLayer.setDepth(globalDepth.ui);

        /*
        const debugGraphics = this.add.graphics().setAlpha(0.75).setDepth(globalDepth.debug);
        collisionLayer.renderDebug(debugGraphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
        */

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
        this.updatePlayerLeft();
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
        this.objectiveObjects = this.add.group();
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
                const new_cat = new Cat(this, cat.x, cat.y, 'cat_idle', cat.properties);
                new_cat.correspondingExit = correspondingExit;
                this.cats.add(new_cat);
            } else {
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
        this.collisionHandler.collideWithCollisionLayer(this.p1, collision_foregroundLayer);
        this.collisionHandler.collideWithCollisionLayer(this.p2, collision_foregroundLayer);
        this.collisionHandler.playerOverlap(this.p1, this.p2);
        this.collisionHandler.heartObjectCollision(this.playerObjs, this.hearts);
        this.collisionHandler.objectCollision(this.playerObjs, this.campfires);
        this.collisionHandler.objectCollision(this.playerObjs, this.cats);

        // - player object connections --------------------------------------------------------
        this.collisionHandler.playerOverlapConnection(this.p1, this.campfires);
        this.collisionHandler.playerOverlapConnection(this.p2, this.campfires);

        // - object collision --------------------------------------------------------
        this.collisionHandler.collideWithCollisionLayer(this.hearts, collisionLayer);
        this.collisionHandler.collideWithCollisionLayer(this.hearts, collision_foregroundLayer);
        this.collisionHandler.objectCollision(this.hearts, this.cats);
        this.collisionHandler.objectCollision(this.hearts, this.campfires);

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

        /*
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
        */
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
  
    // UPDATE OBJECTIVE COUNT
    updateObjectiveCount() {
        const objectiveCount = {};
        this.cats.children.iterate(cat => {
          const objectiveId = cat.objective_id;
      
          if (objectiveId >= 0) {
            if (objectiveCount.hasOwnProperty(objectiveId)) {
              objectiveCount[objectiveId]++;
            } else {
              objectiveCount[objectiveId] = 1;
            }
          }
        });
      
        this.objectiveCount = objectiveCount;

        //console.log("Objective Count:", this.objectiveCount);

        /*
        const objectiveCountElement = document.getElementById("objectiveCount");
        if (objectiveCountElement) {
          objectiveCountElement.textContent = "Objective Count : " + JSON.stringify(this.objectiveCount);
        }
        */
    };

    getObjectiveCount(objective_id) {
        if (this.objectiveCount.hasOwnProperty(objective_id)) {
          return this.objectiveCount[objective_id];
        }
        return 0;
    }

    updatePlayerLeft(){
        if (this.p1.x < this.p2.x){
            this.leftPlayer = this.p1;
            this.rightPlayer = this.p2;

            this.p1.ability_cursor = this.p1.cursors.z;
            this.p2.ability_cursor = this.p2.cursors.x;

        }
        else
        { 
            this.leftPlayer = this.p2;
            this.rightPlayer = this.p1;

            this.p1.ability_cursor = this.p1.cursors.x;
            this.p2.ability_cursor = this.p2.cursors.z;
        }
    }

    updateAudio() {


        // play walk loop if moving
        if (this.p1.currentMovementState.name != 'idle' || this.p2.currentMovementState.name != 'idle')
        {
            this.soundManager.playSFX("walkLoop", {
                loop : true, 
                volume : 0.1
            });
        }
        else if (this.p1.currentMovementState.name === 'idle' && this.p2.currentMovementState.name === 'idle')
        {
            this.soundManager.stopSFX("walkLoop");
        }
        //console.log("movementStates :: (p1) " + this.p1.currentMovementState.name + " :: (p2) " + this.p2.currentMovementState.name);

    }

    update (time, delta)
    {
        this.p1.update();
        this.p2.update();
        this.updatePlayerLeft();

        this.hearts.children.iterate(heart => {
            heart.update();
        });

        this.violet_echos.children.iterate(hiddenObject => {
            hiddenObject.update(this.p1);
        });

        this.gizmos.clear();
        this.gizmos.drawLine(this.p1.center_pos, this.p2.center_pos, 0xff00ff, 1);

        //this.gizmos.drawExistingRect(this.overlapTrigger, this.p1.x, this.p1.y, 0xff00ff, 1, 1);

        this.cameraMovement.update(this.gizmos);

        this.updateObjectiveCount();

        this.updateAudio();

        // END OF GAME
        if (this.levelRoutine.endOfRoutine)
        {
            this.time.delayedCall(1000, () => {
                this.gameManager.transitionToScene("RunCutscene");
            }, [], this);        
        }
    }
}

