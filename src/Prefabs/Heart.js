class Heart extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);



        this.gizmos = new Gizmos(scene);
        this.gizmos.enabled = true;
    
        // Reference to players in the scene
        this.name = "heart obj";
        this.connectedPlayers = [];

        // - movement -----------------------------------------------
        this.speed = 100;


  
      // Add this sprite to the interactObjects group
      scene.interactObjects.add(this);
    }
    update() {

        this.connectedPlayers.forEach(player => {
            const distance = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);

            if (distance > 50) { this.disconnectPlayer(player);}
        });


        // [[ UPDATE MOVEMENT ]--------------------------------]
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
          console.log("<3 HEART -> new connected player: " + player.name);
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
            console.log("<3 HEART -> player removed: " + player.name);

            player.tetheredObject = null;
        }
    }
}