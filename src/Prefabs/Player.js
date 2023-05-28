class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, characterSprite, invertedMove) {
        super(scene, x, y, characterSprite, invertedMove);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(this.width / 2, this.height/2);
        this.body.setCollideWorldBounds(true);

        this.gizmos = new Gizmos(this.scene);

        this.moveSpeed = 100;
        this.characterSprite = characterSprite
        this.inverted = invertedMove;

        this.disableMovement = false;

        this.cursors = scene.input.keyboard.createCursorKeys();



        this.create();
    }

    create(){

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
                    this.body.setVelocityX(0);

                    if (this.currentState == this.state.IDLE) {return;}

                    // set idle animation
                    if (this.currentState == this.state.DOWN)
                    {
                        // set move animation
                        if (this.characterSprite == 'character1')
                        {
                            this.anims.play('down-idle1');
                        }
                        else{
                            this.anims.play('down-idle2');
                        }
                    }
                    if (this.currentState == this.state.UP)
                    {
                        // set move animation
                        if (this.characterSprite == 'character1')
                        {
                            this.anims.play('up-idle1');
                        }
                        else{
                            this.anims.play('up-idle2');
                        }
                    }
                    if (this.currentState == this.state.LEFT || this.currentState == this.state.RIGHT)
                    {
                        // set move animation
                        if (this.characterSprite == 'character1')
                        {
                            this.anims.play('horz-idle1');
                        }
                        else{
                            this.anims.play('horz-idle2');
                        }
                    }
                    this.currentState = this.state.IDLE;
                }
            },
            LEFT: {
                name: "left",
                enter: () => {

                    this.body.setVelocityX(-this.moveSpeed);

                    // dont reset animations if in same state
                    if (this.currentState == this.state.LEFT) {return;} 

                    // update state
                    this.currentState = this.state.LEFT;
                    this.setFlipX(false);

                    // set move animation
                    if (this.characterSprite == 'character1')
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

                    this.body.setVelocityX(this.moveSpeed); // update velocity

                    // dont reset animations if in same state
                    if (this.currentState == this.state.RIGHT) {return;} 

                    // update state
                    this.currentState = this.state.RIGHT;
                    this.setFlipX(true);

                    // set move animation
                    if (this.characterSprite == 'character1')
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
                    this.body.setVelocityY(-this.moveSpeed);

                    // dont reset animations if in same state
                    if (this.currentState == this.state.UP) {return;} 

                    // update state
                    this.currentState = this.state.UP;
                    this.setFlipX(false);

                    // set move animation
                    if (this.characterSprite == 'character1')
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
                    this.body.setVelocityY(this.moveSpeed);

                    // dont reset animations if in same state
                    if (this.currentState == this.state.DOWN) {return;} 

                    // update state
                    this.currentState = this.state.DOWN;
                    this.setFlipX(false);

                    // set move animation
                    if (this.characterSprite == 'character1')
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
        
        this.stateText = this.gizmos.createText(this.x, this.y, this.currentState.name, '#ffffff', 5);
    }

    update() {
        this.handleMovement();

        this.gizmos.updateText(this.stateText, this.x, this.y + this.height, this.currentState.name, '#ffffff', 10);

    }

    handleMovement() {
        this.body.setVelocity(0); // stops movement if no input

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
    }
}
