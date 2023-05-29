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
        this.lights.enable().setAmbientColor(0x222222);

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


        // #region << COLLISIONS >>

        this.physics.world.TILE_BIAS = 1000;  // increase to prevent sprite tunneling through tiles

        // collide with collision layer, using sprite index
        collisionLayer.setCollisionBetween(52, 54);
        this.physics.add.collider(this.p1, collisionLayer);
        this.physics.add.collider(this.p2, collisionLayer);

        this.physics.add.overlap(this.p1, this.p2, () => {
            //console.log('hello from the edge of the world', body);
            this.p1.x = Math.floor(this.p1.x);
            this.p1.y = Math.floor(this.p1.y);

            // calculate the angle between the current position and the center of the world
            const angle = Phaser.Math.Angle.Between(this.p1.x, this.p1.y, this.p2.x, this.p2.y);

            // set the velocity of the object towards the center at a slower pace
            this.physics.velocityFromRotation(-angle, 500, this.p1.velocity);
        });

        // >>  MAIN OBJECT COLLISION
        this.physics.add.collider(this.playerObjs, this.interactObjects, (player, obj) =>{
            player.disableUntilIdle = true;

            const interaction_direction = player.getDirectionOfObj(obj);
            console.log(player.name + " " + interaction_direction);

            if (interaction_direction == "left") {
                player.setPosition(obj.x + (obj.width), player.y);
                player.setVelocity(10, 0);
                obj.setVelocity(-50, 0);
            }
            if (interaction_direction == "right") {
                player.setPosition(obj.x - (obj.width), player.y);
                player.setVelocity(-10, 0);
                obj.setVelocity(50, 0);

            }
            if (interaction_direction == "up") {
                player.setPosition(player.x, obj.y + (obj.height));
                player.setVelocity(0, 10);
                obj.setVelocity(0, -50);
            }
            if (interaction_direction == "down") {
                player.setPosition(player.x, obj.y - (obj.height));
                player.setVelocity(0, -10);
                obj.setVelocity(0, 50);
            }
        });

        //this.physics.add.collider(this.interactObjects, collisionLayer);        

        this.physics.add.overlap(this.interactObjects, this.startP1.overlapTrigger, (obj) => {
            //console.log("overlap trigger " + obj)
            this.startP1.currOverlapObject = obj;
        })

        this.physics.add.overlap(this.interactObjects, this.startP2.overlapTrigger, (obj) => {
            //console.log("overlap trigger " + obj)
            this.startP2.currOverlapObject = obj;
        })

        // #endregion

        //#region << CAMERA SETUP >>
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameraTarget = this.add.sprite(this.p1.x, this.p1.y, null).setAlpha(0);
        this.cameras.main.startFollow(this.cameraTarget);
        this.cameras.main.setZoom(1);

        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        // Create camera for player 1
        this.camera1 = this.cameras.add(0, 0, screenWidth / 2, screenHeight);
        this.camera1.startFollow(this.p1);
        this.camera1.setZoom(1);
        this.camera1.setAlpha(0);
        this.camera1.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Create camera for player 2
        this.camera2 = this.cameras.add(screenWidth / 2, 0, screenWidth / 2, screenHeight);
        this.camera2.startFollow(this.p2);
        this.camera2.setZoom(1);
        this.camera2.setAlpha(0);
        this.camera2.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        //#endregion

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

            this.camera1.startFollow(this.p1);
            this.camera2.startFollow(this.p2);
        }



        this.p1.update();
        this.p2.update();
        this.heart.update();

        this.gizmos.clear();
        this.gizmos.drawLine({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y}, 0xff00ff, 1);

        this.gizmos.drawExistingRect(this.overlapTrigger, this.p1.x, this.p1.y, 0xff00ff, 1);


        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z))) {
            this.p1.inverted  = !this.p1.inverted;
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X))) {
            this.p2.inverted  = !this.p2.inverted;
        }

        //#region << UPDATE CAMERA >>
        const distance = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
        const thresholdDistance = 300;

        // ( SPLIT SCREEN TRANSITION ) 
        const targetAlpha = distance > thresholdDistance ? 1 : 0;
        const lerpAmount = 0.1; // Adjust this value to control the speed of the lerp
        
        // Lerp the alpha values of camera1 and camera2
        this.camera1.alpha = Phaser.Math.Linear(this.camera1.alpha, targetAlpha, lerpAmount);
        this.camera2.alpha = Phaser.Math.Linear(this.camera2.alpha, targetAlpha, lerpAmount);

        // Determine the relative position of p1 and p2
        const isP1OnLeft = this.p1.x < this.p2.x;
    
        // Position the cameras accordingly
        if (isP1OnLeft) {
            this.camera1.setPosition(0, 0);
            this.camera2.setPosition(this.cameras.main.width / 2, 0);
        } else {
            this.camera1.setPosition(this.cameras.main.width / 2, 0);
            this.camera2.setPosition(0, 0);
        }

        this.playerMidpoint = this.gizmos.calculateMidpoint({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y});
        this.cameraTarget.setPosition(this.playerMidpoint.x, this.playerMidpoint.y);
        this.gizmos.drawCircle(this.cameraTarget.x, this.cameraTarget.y, thresholdDistance/2, 0xffffff, 0, 0.5);
        // #endregion

    }


}