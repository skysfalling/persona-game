class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, characterSprite, invertedMove) {
        super(scene, x, y, characterSprite, invertedMove);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        this.body.setSize(this.width/2, this.height/2);
        this.setDepth(2);

        this.name = characterSprite;

        this.x = x;
        this.y = y;
        
        this.gizmos = new Gizmos(scene);
        this.gizmos.visible = false;

        this.overrideGizmos = new Gizmos(scene);
        this.overrideGizmos.visible = true;
        this.overrideGizmos.graphics.setDepth(3);

        this.moveSpeed = 100;
        this.currMoveSpeed = this.moveSpeed;
        
        this.characterSprite = characterSprite
        this.inverted = invertedMove;

        this.disableUntilIdle = false;

        this.cursors = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            z: Phaser.Input.Keyboard.KeyCodes.Z,
            x: Phaser.Input.Keyboard.KeyCodes.X
        });

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
        
        // Define the movement states
        this.state = {
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

                    if (this.currentState == this.state.IDLE) {return;}
                    this.disableUntilIdle = false;


                    this.currentState = this.state.IDLE;
                }
            },
            LEFT: {
                name: "left",
                enter: () => {

                    this.body.setVelocityX(-this.currMoveSpeed);
                    this.body.setVelocityY(0);
                    this.currentFacing = "left";

                    // dont reset animations if in same state
                    if (this.currentState == this.state.LEFT) {return;} 

                    // update state
                    this.currentState = this.state.LEFT;
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
                    if (this.currentState == this.state.RIGHT) {return;} 

                    // update state
                    this.currentState = this.state.RIGHT;
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
                    if (this.currentState == this.state.UP) {return;} 

                    // update state
                    this.currentState = this.state.UP;
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
                    if (this.currentState == this.state.DOWN) {return;} 

                    // update state
                    this.currentState = this.state.DOWN;
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
        this.currentState = this.state.DOWN;
        this.currentFacing = "down";

        this.overlapTrigger = this.scene.add.sprite(this.x, this.y, null);
        this.scene.physics.add.existing(this.overlapTrigger);
        this.overlapTrigger.setVisible(false);
        this.overlapTrigger.setOrigin(0.5)
        this.overlapTrigger.setSize(this.width*2, this.height*2);

        this.currOverlapObject;
        this.currGrabbedObject;

        this.stateText = this.gizmos.createText(this.x, this.y, this.currentState.name, '#ffffff', 5);
        this.colliderGizmo = this.gizmos.createRect(this.x, this.y, this.body.width, this.body.height);

        // Create a point light
        this.light = this.scene.lights.addLight(this.x, this.y, 50, 0x555555).setIntensity(1);
    }

    update() {
        this.handleMovement();

        // ============================================// >> *
        this.light.setPosition(this.x, this.y);

        this.gizmos.clear();
        this.overrideGizmos.clear();

        this.gizmos.updateText(this.stateText, this.x, this.y + this.height, this.currentState.name, '#ffffff', 7);

        this.gizmos.drawExistingRect(this.colliderGizmo, this.x, this.y, 0xffffff, 1, 0.5);


        // ============================================// >> *

        if (this.currOverlapObject)
        {
            if (this.grabbedObject == null) {
                this.grabbedObject = this.currOverlapObject;
            }
            else if (this.grabbedObject.name != this.currOverlapObject.name)
            {
                // ( GIZMOS )
                this.gizmos.drawExistingRect(this.overlapTrigger, this.x, this.y, 0xff00ff, 1, 1);

                let playerPos = {x: this.x, y: this.y};
                let overlapObjPos = {x: this.currOverlapObject.x, y: this.currOverlapObject.y};
                this.overrideGizmos.drawLine(playerPos, overlapObjPos, 0xff00ff, 1, 1);

                console.log("overlap" + this.currOverlapObject.name);

            }

            this.currOverlapObject = null;
        }
        else {
            this.gizmos.drawExistingRect(this.overlapTrigger, this.x, this.y, 0xff00ff, 1, 0.3);
        }

        
        // Update the position of the grabbed object relative to the player
        if (this.grabbedObject)
        {
            this.grabbedObject.connectPlayer(this);

            this.gizmos.drawCircle(this.grabbedObject.x, this.grabbedObject.y, 10, 0xffffff, 0, 1);
            let playerPos = {x: this.x, y: this.y};
            let grabbedObjPos = {x: this.grabbedObject.x, y: this.grabbedObject.y};
            this.overrideGizmos.drawLine(playerPos, grabbedObjPos, 0xffffff, 1, 1);
        }
    }

    handleMovement() {

        this.overlapTrigger.setPosition(this.x, this.y);

        if (this.cursors.left.isDown) {

            if (this.inverted) {
                this.state.RIGHT.enter();
            }
            else {
                this.state.LEFT.enter();
            }
        }
        else if (this.cursors.right.isDown) {
            if (this.inverted) {
                this.state.LEFT.enter();
            }
            else {
                this.state.RIGHT.enter();
            }        
        } 
        else if (this.cursors.up.isDown) {
            if (this.inverted) {
                this.state.DOWN.enter();
            }
            else {
                this.state.UP.enter();
            }
        } 
        else if (this.cursors.down.isDown) {
            if (this.inverted) {
                this.state.UP.enter();
            }
            else {
                this.state.DOWN.enter();
            }
        }
        else{
            this.state.IDLE.enter();
        }

        // disable movement until idle again
        if (this.disableUntilIdle)
        {
            this.currMoveSpeed = 0;
        }
        else {
            this.currMoveSpeed = this.moveSpeed;
        }

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

    getFacingDirection() {
        const direction = new Phaser.Math.Vector2();
      
        if (this.currentState == this.state.LEFT) 
        {
          direction.x = -1;
        } 
        else if (this.currentState == this.state.RIGHT)
        {
          direction.x = 1;
        }
        else if (this.currentState == this.state.DOWN) 
        {
            direction.y = -1;
        } 
        else if (this.currentState == this.state.UP)
        {
            direction.y = 1;
        }

      
        direction.normalize();
      
        return direction;
    }

}
