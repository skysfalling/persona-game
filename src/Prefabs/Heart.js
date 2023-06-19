class Heart extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, playerEcho) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(this.width/2, this.height/2)
        this.setOrigin(0);

        // Tether threshold
        this.tether_threshold = 50;

        // Create the overlap trigger
        this.overlapTrigger = scene.add.zone(x, y).setSize(this.width*2, this.height*2);
        scene.physics.add.existing(this.overlapTrigger);
        this.overlapTrigger.body.setAllowGravity(false);
        this.overlapTrigger.visible = false;
        this.overlapTrigger.setOrigin(0.25);

        // setup gizmos
        this.gizmos = new Gizmos(scene);
        this.gizmos.enabled = true;

        // Reference to players in the scene
        this.name = "heart obj";
        this.id_type = 0;
        this.connectedPlayers = [];
        this.prefix = "<3 HEART ->";

        // setup hidden object functionality
        this.playerEcho = playerEcho;
        if (playerEcho) { 
            this.hiddenObject = new HiddenObject(this.scene, this, playerEcho);
            this.id_type = this.playerEcho.playerID;
        }

        // - movement -----------------------------------------------
        this.speed = 100;

        //#region -- animations ---------------------------------------------

        //#region WHITE HEART -------
        this.scene.anims.create({
            key: 'white_loop',
            frames: this.anims.generateFrameNumbers('heart', { start: 0, end: 7 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'white_spin',
            frames: this.anims.generateFrameNumbers('heart', { start: 8, end: 13 }),
            frameRate: 12,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'white_break',
            frames: this.anims.generateFrameNumbers('heart', { start: 14, end: 29 }),
            frameRate: 12,
            repeat: 0
        });
        // #endregion

        //#region VIOLET HEART -------
        this.scene.anims.create({
            key: 'violet_loop',
            frames: this.anims.generateFrameNumbers('heart', { start: 30, end: 37 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'violet_spin',
            frames: this.anims.generateFrameNumbers('heart', { start: 38, end: 43 }),
            frameRate: 12,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'violet_break',
            frames: this.anims.generateFrameNumbers('heart', { start: 44, end: 59 }),
            frameRate: 12,
            repeat: 0
        });
        // #endregion

        //#region BLUE HEART -------
        this.scene.anims.create({
            key: 'blue_loop',
            frames: this.anims.generateFrameNumbers('heart', { start: 60, end: 67 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'blue_spin',
            frames: this.anims.generateFrameNumbers('heart', { start: 68, end: 73 }),
            frameRate: 12,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'blue_break',
            frames: this.anims.generateFrameNumbers('heart', { start: 74, end: 89 }),
            frameRate: 12,
            repeat: 0
        });
        // #endregion

        //#region BLUE HEART -------
        this.scene.anims.create({
            key: 'black_loop',
            frames: this.anims.generateFrameNumbers('heart', { start: 90, end: 97 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'black_spin',
            frames: this.anims.generateFrameNumbers('heart', { start: 98, end: 103 }),
            frameRate: 12,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'black_break',
            frames: this.anims.generateFrameNumbers('heart', { start: 104, end: 119 }),
            frameRate: 12,
            repeat: 0
        });
        // #endregion

        // #endregion
        this.playLoopAnim();
  
        // Add this sprite to the interactObjects group
        scene.objectiveObjects.add(this);
    }
    
    update() {
        this.pos = {x: this.x, y: this.y}; // update reference position for objects
        this.center_pos = { x: this.x + this.width/2, y: this.y + this.height/2 } //center position

        // update hidden object
        if (this.playerEcho) 
        { 
            this.hiddenObject.update();
        }

        // #region [[ UPDATE MOVEMENT ]--------------------------------]

        // disconnect from player if too far
        this.connectedPlayers.forEach(player => {
            const distance = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);

            if (distance > this.tether_threshold) { this.disconnectPlayer(player);}
        });

        this.overlapTrigger.setPosition(this.x, this.y);

        if (this.connectedPlayers.length >= 1) {
            let totalX = 0;
            let totalY = 0;
    
            // Calculate the total position of connected players
            for (const player of this.connectedPlayers) {
                totalX += player.x;
                totalY += player.y;
            }
    
            const averageX = totalX / this.connectedPlayers.length;
            const averageY = totalY / this.connectedPlayers.length;
    
            const distance = Phaser.Math.Distance.Between(averageX, averageY, this.x, this.y);
    
            const directionX = averageX - this.x;
            const directionY = averageY - this.y;
            const length = Math.sqrt(directionX * directionX + directionY * directionY);
            const normalizedDirectionX = directionX / length;
            const normalizedDirectionY = directionY / length;
    
            const lerpFactor = 1;
            this.setVelocityX( Phaser.Math.Linear(this.body.velocity.x, normalizedDirectionX * this.speed, lerpFactor));
            this.setVelocityY( Phaser.Math.Linear(this.body.velocity.y, normalizedDirectionY * this.speed, lerpFactor));

            if (this.connectedPlayers.length === 1 && distance <= 50)
            {
                this.setVelocityX( Phaser.Math.Linear(this.body.velocity.x, 0, 0.5));
                this.setVelocityY( Phaser.Math.Linear(this.body.velocity.y, 0, 0.5));

                if (distance < 25)
                {
                    this.setVelocity(0);
                }
            }
            else if (this.connectedPlayers.length > 1)
            {

                if (distance < 10)
                {
                    this.setVelocityX(0);
                    this.setVelocityY(0);
                }
                else if (distance < 25){
                    this.setVelocityX( Phaser.Math.Linear(this.body.velocity.x, 0, 0.8));
                    this.setVelocityY( Phaser.Math.Linear(this.body.velocity.y, 0, 0.8));
                }
            }
            
        }
        //#endregion

        // [[ UPDATE UI ]]

    }

    connectPlayer(player) {

        if (this.hiddenObject && this.hiddenObject.hidden) { return;}
        if (player.currAbilityState.name === "none") { return;}

        // Check if the player already exists in the array
        const playerExists = this.connectedPlayers.some(p => p === player);
      
        // If the player doesn't exist, add it to the array
        if (!playerExists) {

            this.connectedPlayers.push(player);
            player.newTetheredObject(this);

            if (this.connectedPlayers.length > 1){
                console.log(this.prefix + " connected to both players");
                this.id_type = 3;
            }
            else
            {
                console.log(this.prefix + " new connected player: " + player.name);
                this.id_type = player.playerID;
            }
            this.playLoopAnim();
            this.scene.soundManager.playSFX("tether_connect", {volume: 0.5});
        }


    }

    disconnectPlayer(player) {
        // Find the index of the player in the connectedPlayers array
        let playerIndex = -1;
        for (let i = 0; i < this.connectedPlayers.length; i++) {
            if (this.connectedPlayers[i] === player) {
            playerIndex = i;
            break;
            }
        }

        // If the player is found, remove it from the array
        if (playerIndex !== -1) {
            this.connectedPlayers.splice(playerIndex, 1);
            player.tetheredObject = null;

            console.log(this.prefix + " player removed: " + player.name);

            // change color to connected player color
            if (this.connectedPlayers.length > 0) 
            {
                this.id_type = this.connectedPlayers[0].playerID;
            }
            else 
            {
                this.id_type = 0;
            }
            this.playSpinAnim();
            this.scene.soundManager.playSFX("tether_break", {volume: 0.5});
        }
    }

    playLoopAnim()
    {
        let id = this.id_type;
        if (id === 1) {        
            this.anims.play('violet_loop');
        }
        else if (id === 2) {        
            this.anims.play('blue_loop');
        }
        else if (id === 3) {        
            this.anims.play('black_loop');
        }
        else
        {
            this.anims.play('white_loop');
        }
    }

    playSpinAnim()
    {
        let id = this.id_type;
        if (id === 1) {        
            this.anims.play('violet_spin');
        }
        else if (id === 2) {        
            this.anims.play('blue_spin');
        }
        else if (id === 3) {        
            this.anims.play('black_spin');
        }
        else {
            this.anims.play('white_spin');
        }

        this.on('animationcomplete', this.playLoopAnim);
    }

}