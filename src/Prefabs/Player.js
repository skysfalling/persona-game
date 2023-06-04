class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, characterSprite, invertedMove) {
        super(scene, x, y, characterSprite, invertedMove);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // input references
        this.cursors = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            z: Phaser.Input.Keyboard.KeyCodes.Z,
            x: Phaser.Input.Keyboard.KeyCodes.X
        });

        // -- positions ----------------------------------------------------------------//>>
        this.x = x;
        this.y = y;
        this.setOrigin(0.5, 0.5);
        this.body.setSize(this.width/2, this.height/2);
        this.setDepth(2);

        
        // -- description -------------------------------------------------------------------//>>
        this.name = characterSprite;
        this.playerID = 1;
        this.color = 0xffffff;
        
        if (characterSprite == "character1")
        {
            this.name = "violet";
            this.playerID = 1;
            this.color = 0xBF8BFF;
            this.prefix = ">> [[ P1 ]] ";
        }
        else if (characterSprite == "character2")
        {
            this.name = "blue";
            this.playerID = 2;
            this.color = 0x579C9A;
            this.prefix = ">> (( P2 )) ";
        }

        // -- lighting ----------------------------------------------------------------//>>
        this.setPipeline('Light2D');
        this.light = this.scene.lights.addLight(this.x, this.y, 50, 0x777777).setIntensity(1);


        // -- ui & gizmos --------------------------------------------------------------//>>
        this.gizmos_debug = new Gizmos(scene);
        this.gizmos_debug.enabled = false;
        this.gizmos_debug.graphics.setDepth(globalDepth.ui);

        this.gizmo_effects = new Gizmos(scene);
        this.gizmo_effects.enabled = true;
        this.gizmo_effects.graphics.setDepth(globalDepth.player);

        this.ui_offset = this.width;

        // - movement -------------------------------------------------------//>>
        this.disable = false;
        this.moveSpeed = 100;
        this.currMoveSpeed = this.moveSpeed;
        
        this.characterSprite = characterSprite
        this.inverted = invertedMove;

        this.currRoom = null;
        this.facingDirection = new Phaser.Math.Vector2();

        // - tether bubble ----------------------------------------------------//>>
        this.tetherBubble = {
            currSize: 0,
            maxSize: 80
        }

        // - trigger ----------------------------------------------------//>>
        this.overlapTrigger = this.scene.add.circle(this.x, this.y, this.tetherBubble.maxSize);
        this.scene.physics.add.existing(this.overlapTrigger);
        this.overlapTrigger.setVisible(false);
        this.overlapTrigger.setOrigin(0.5);
        this.overlapTrigger.body.isCircle = true;
        this.overlapTrigger.body.width = 0;

        //#region [[ ANIMATIONS ]--------------------------------] ////
        //#region DOWN ANIMATIONS
        this.scene.anims.create({
            key: 'down-idle1',
            frames: this.scene.anims.generateFrameNumbers("character1", { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'down-idle2',
            frames: this.scene.anims.generateFrameNumbers("character2", { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'down-move1',
            frames: this.scene.anims.generateFrameNumbers("character1", { start: 2, end: 3 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'down-move2',
            frames: this.scene.anims.generateFrameNumbers("character2", { start: 2, end: 3 }),
            frameRate: 4,
            repeat: -1
        });
        //#endregion

        //#region HORZ ANIMATIONS
        this.scene.anims.create({
            key: 'horz-idle1',
            frames: this.scene.anims.generateFrameNumbers("character1", { start: 4, end: 5 }),
            frameRate: 2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'horz-idle2',
            frames: this.scene.anims.generateFrameNumbers("character2", { start: 4, end: 5 }),
            frameRate: 2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'horz-move1',
            frames: this.scene.anims.generateFrameNumbers("character1", { start: 6, end: 7 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'horz-move2',
            frames: this.scene.anims.generateFrameNumbers("character2", { start: 6, end: 7 }),
            frameRate: 4,
            repeat: -1
        });
        //#endregion
        
        //#region UP ANIMATIONS
        this.scene.anims.create({
            key: 'up-idle1',
            frames: this.scene.anims.generateFrameNumbers("character1", { start: 8, end: 9 }),
            frameRate: 2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'up-idle2',
            frames: this.scene.anims.generateFrameNumbers("character2", { start: 8, end: 9 }),
            frameRate: 2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'up-move1',
            frames: this.scene.anims.generateFrameNumbers("character1", { start: 10, end: 11 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'up-move2',
            frames: this.scene.anims.generateFrameNumbers("character2", { start: 10, end: 11 }),
            frameRate: 4,
            repeat: -1
        });
        //#endregion
        //#endregion

        // #region [[ MOVEMENT STATE ]] ====================================== /// 
        // Define the movement states
        this.movementStates = {
            IDLE: {
                name: "idle",
                enter: () => {
                    this.body.setVelocity(0);

                    // set move animation
                    if (this.currentFacing == "up" || this.currentFacing == "down")
                    {
                        if (!this.inverted)
                        {
                            this.anims.play(this.currentFacing + '-idle1');
                        }
                        else{
                            this.anims.play(this.currentFacing + '-idle2');
                        }
                    }
                    else {
                        // set move animation
                        if (!this.inverted)
                        {
                            this.anims.play('horz-idle1');
                        }
                        else{
                            this.anims.play('horz-idle2');
                        }
                    }

                    if (this.currentMovementState == this.movementStates.IDLE) {return;}
                    this.currentMovementState = this.movementStates.IDLE;
                }
            },
            LEFT: {
                name: "left",
                enter: () => {

                    this.body.setVelocityX(-this.currMoveSpeed);
                    this.body.setVelocityY(0);
                    this.currentFacing = "left";

                    // dont reset animations if in same state
                    if (this.currentMovementState == this.movementStates.LEFT) {return;} 

                    // update state
                    this.currentMovementState = this.movementStates.LEFT;
                    this.setFlipX(false);

                    // set move animation
                    if (!this.inverted)
                    {
                        this.anims.play('horz-move1');
                    }
                    else{
                        this.anims.play('horz-move2');
                    }
                },
            },
            RIGHT: {
                name: "right",
                enter: () => {

                    this.body.setVelocityX(this.currMoveSpeed); // update velocity
                    this.body.setVelocityY(0);
                    this.currentFacing = "right";

                    // dont reset animations if in same state
                    if (this.currentMovementState == this.movementStates.RIGHT) {return;} 

                    // update state
                    this.currentMovementState = this.movementStates.RIGHT;
                    this.setFlipX(true);

                    // set move animation
                    if (!this.inverted)
                    {
                        this.anims.play('horz-move1');
                    }
                    else{
                        this.anims.play('horz-move2');
                    }
                },
            },
            UP: {
                name: "up",
                enter: () => {
                    this.body.setVelocityX(0);
                    this.body.setVelocityY(-this.currMoveSpeed);
                    this.currentFacing = "up";

                    // dont reset animations if in same state
                    if (this.currentMovementState == this.movementStates.UP) {return;} 

                    // update state
                    this.currentMovementState = this.movementStates.UP;
                    this.setFlipX(false);

                    // set move animation
                    if (!this.inverted)
                    {
                        this.anims.play('up-move1');
                    }
                    else{
                        this.anims.play('up-move2');
                    }
                },
            },
            DOWN: {
                name: "down",
                enter: () => {
                    this.body.setVelocityX(0);
                    this.body.setVelocityY(this.currMoveSpeed);
                    this.currentFacing = "down";

                    // dont reset animations if in same state
                    if (this.currentMovementState == this.movementStates.DOWN) {return;} 

                    // update state
                    this.currentMovementState = this.movementStates.DOWN;
                    this.setFlipX(false);

                    // set move animation
                    if (!this.inverted)
                    {
                        this.anims.play('down-move1');
                    }
                    else{
                        this.anims.play('down-move2');
                    }
                },
            },
        };

        // Set the initial state
        this.currentMovementState = this.movementStates.DOWN;
        this.currentFacing = "down";
        // #endregion

        // #endregion [[ ABILITY STATE ]] ==================================== /// 
        if (this.playerID === 1) { this.ability_cursor = this.cursors.z;}
        else if (this.playerID === 2) { this.ability_cursor = this.cursors.x;}

        this.currAbilityState;
        this.abilityStates = {
            NONE: {
                name: 'none',
                enter: () => {
                    this.currAbilityState = this.abilityStates.NONE;
                    console.log("[[ P" + this.playerID + " ]] ability -> " + this.currAbilityState.name);
                },
                update: () => {
                    this.tetherBubble.currSize = 0;

                    if (Phaser.Input.Keyboard.JustDown(this.ability_cursor)) {
                        this.abilityStates.TETHER_BUBBLE.enter();
                    }
                }
            },
            TETHER_BUBBLE: {
                name: 'tether-bubble',
                enter: () => {
                    this.currAbilityState = this.abilityStates.TETHER_BUBBLE;
                    console.log("[[ P" + this.playerID + " ]] ability -> " + this.currAbilityState.name);

                    if (this.tetheredObject) {
                        this.abilityStates.TETHER_DISCONNECT.enter();
                    }
                },
                update: () => {
                    this.tetherBubble.currSize = this.tetherBubble.maxSize;

                    if (Phaser.Input.Keyboard.JustUp(this.ability_cursor)) {
                        this.abilityStates.NONE.enter();
                    }
                }
            },
            TETHER_DISCONNECT:{
                name: 'tether-disconnect',
                enter: () => {
                    this.currAbilityState = this.abilityStates.TETHER_DISCONNECT;
                    console.log("[[ P" + this.playerID + " ]] ability -> " + this.currAbilityState.name);

                    if (this.tetheredObject) {this.tetheredObject.disconnectPlayer(this);}

                    this.abilityStates.NONE.enter();
                },
                update: () => {
                }
            }
        }
        this.abilityStates.NONE.enter();
        //#endregion
    }

    update() {
        this.pos = {x: this.x, y: this.y}; // update reference position for objects
        this.handleMovement();
        this.setFacingDirection();

        this.currAbilityState.update();

        // [[ UPDATE POSITIONS ]------------------------------------------------]
        this.overlapTrigger.setPosition(this.x, this.y);
        this.light.setPosition(this.x, this.y);
        
        // [[ UPDATE GIZMOS ]------------------------------------------------]
        this.gizmos_debug.clear();
        this.gizmos_debug.updateText(this.stateText, this.x + this.ui_offset, this.y + this.ui_offset, this.currentMovementState.name, '#ffffff', 10);
        // ==== )))
        this.gizmo_effects.clear();
        this.gizmo_effects.drawCircleNoLine(this.overlapTrigger.x, this.overlapTrigger.y, this.overlapTrigger.body.width/2, this.color);
        this.gizmo_effects.drawCircleFill(this.overlapTrigger.x, this.overlapTrigger.y, this.overlapTrigger.body.width/2, this.color, 0.1);

        // [[ UPDATE TETHER BUBBLE ]]------------------------------------------------]        
        const lerpFactor = 0.1; // Adjust the lerp factor as needed
        const targetWidth = this.currAbilityState === this.abilityStates.TETHER_BUBBLE ? this.tetherBubble.currSize : 0;
        const currentWidth = this.overlapTrigger.body.width;
        const lerpedWidth = Phaser.Math.Linear(currentWidth, targetWidth, lerpFactor);
        
        // update trigger width
        this.overlapTrigger.displayWidth = lerpedWidth;
        this.overlapTrigger.displayHeight = lerpedWidth;

        if (this.tetheredObject){
            this.gizmos_debug.drawCircle(this.tetheredObject.x, this.tetheredObject.y, 10, 0xffffff, 0, 1);


            // draw tether
            let tetheredObjPos = {x: this.tetheredObject.x, y: this.tetheredObject.y};
            this.gizmo_effects.drawLine(this.pos, tetheredObjPos, this.color, 1, 1);
        }

        this.currRoom = this.scene.roomHandler.getCurrentRoom(this);
        if (this.currRoom)
        {
            //console.log(this.name + " " + this.currRoom.name);
        }
    }

    handleMovement() {

        // disable movement until idle again
        if (this.disable)
        {
            this.currMoveSpeed = 0;
            return;
        }
        else {
            this.currMoveSpeed = this.moveSpeed;
        }

        if (this.cursors.left.isDown) {

            if (this.inverted) {
                this.movementStates.RIGHT.enter();
            }
            else {
                this.movementStates.LEFT.enter();
            }
        }
        else if (this.cursors.right.isDown) {
            if (this.inverted) {
                this.movementStates.LEFT.enter();
            }
            else {
                this.movementStates.RIGHT.enter();
            }        
        } 
        else if (this.cursors.up.isDown) {
            if (this.inverted) {
                this.movementStates.DOWN.enter();
            }
            else {
                this.movementStates.UP.enter();
            }
        } 
        else if (this.cursors.down.isDown) {
            if (this.inverted) {
                this.movementStates.UP.enter();
            }
            else {
                this.movementStates.DOWN.enter();
            }
        }
        else{
            this.movementStates.IDLE.enter();
        }



    }

    newTetheredObject(object){
        console.log(this.prefix + " - trigger overlap : " + object.name);
        this.tetheredObject = object;
    }

    getDirectionOfObj(object) {
        const dx = object.x - this.x;
        const dy = object.y - this.y;
      
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
                return "left";
            } else {
                return "right";
            }
        } else {
            if (dy < 0) {
                return "up";
            } else {
                return "down";
            }
        }
    }

    setFacingDirection() {
      
        if (this.currentMovementState == this.movementStates.LEFT) 
        {
            this.facingDirection.x = -1;
            this.facingDirection.y = 0;
        } 
        else if (this.currentMovementState == this.movementStates.RIGHT)
        {
            this.facingDirection.x = 1;
            this.facingDirection.y = 0;
        }
        else if (this.currentMovementState == this.movementStates.DOWN) 
        {
            this.facingDirection.x = 0;
            this.facingDirection.y = -1;
        } 
        else if (this.currentMovementState == this.movementStates.UP)
        {
            this.facingDirection.x = 0;
            this.facingDirection.y = 1;
        }

    }

    toggleDebug() {
        this.gizmos_debug.enabled = !this.gizmos_debug.enabled;

        if (this.gizmos_debug.enabled)
        {
            this.stateText = this.gizmos_debug.createText(this.x, this.y, this.currentMovementState.name, '#ffffff', 5);
        }
    }
}
