class Heart extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(this.width, this.height)

        // Create the overlap trigger
        this.overlapTrigger = scene.add.zone(x, y).setSize(this.width*3, this.height*3);
        scene.physics.add.existing(this.overlapTrigger);
        this.overlapTrigger.body.setAllowGravity(false);
        this.overlapTrigger.visible = false;

        this.gizmos = new Gizmos(scene);
        this.gizmos.enabled = true;


        // Reference to players in the scene
        this.name = "heart obj";
        this.id_type = 0;
        this.connectedPlayers = [];

        // - movement -----------------------------------------------
        this.speed = 100;

        //#region -- animations ---------------------------------------------
        this.scene.anims.create({
            key: 'default_loop',
            frames: this.anims.generateFrameNumbers('heart', { start: 0, end: 5 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'default_spin',
            frames: this.anims.generateFrameNumbers('heart', { start: 7, end: 12 }),
            frameRate: 12,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'violet_loop',
            frames: this.anims.generateFrameNumbers('heart', { start: 14, end: 18 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'violet_spin',
            frames: this.anims.generateFrameNumbers('heart', { start: 21, end: 26 }),
            frameRate: 12,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'blue_loop',
            frames: this.anims.generateFrameNumbers('heart', { start: 28, end: 32 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'blue_spin',
            frames: this.anims.generateFrameNumbers('heart', { start: 35, end: 40 }),
            frameRate: 12,
            repeat: 0
        });
        // #endregion


        this.playLoopAnim();
  
      // Add this sprite to the interactObjects group
      scene.interactObjects.add(this);
    }
    update() {

        // disconnect from player if too far
        this.connectedPlayers.forEach(player => {
            const distance = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);

            if (distance > 50) { this.disconnectPlayer(player);}
        });


        // [[ UPDATE MOVEMENT ]--------------------------------]

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
            else if (this.connectedPlayers.length > 1 && distance <= 10)
            {
                this.setVelocityX( Phaser.Math.Linear(this.body.velocity.x, 0, 0.8));
                this.setVelocityY( Phaser.Math.Linear(this.body.velocity.y, 0, 0.8));
            }
            
        }

        // [[ UPDATE UI ]]

    }

    connectPlayer(player) {
        // Check if the player already exists in the array
        const playerExists = this.connectedPlayers.some(p => p === player);
      
        // If the player doesn't exist, add it to the array
        if (!playerExists) {

            this.connectedPlayers.push(player);
            player.newTetheredObject(this);

            console.log("<3 HEART -> new connected player: " + player.name);
            this.id_type = player.playerID;
            this.playLoopAnim();

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

            console.log("<3 HEART -> player removed: " + player.name);
            this.id_type = player.playerID;
            this.playSpinAnim(player.playerID);
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
        else
        {
            this.anims.play('default_loop');
        }
    }

    playSpinAnim(id)
    {
        if (id === 1) {        
            this.anims.play('violet_spin');
        }
        else if (id === 2) {        
            this.anims.play('blue_spin');
        }
        else
        {
            this.anims.play('default_spin');
        }

        this.on('animationcomplete', this.playLoopAnim);
    }
}