class Heart extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
      super(scene, x, y, texture, frame);
      scene.add.existing(this);
      scene.physics.add.existing(this);
      this.setCollideWorldBounds(true);
  
      // Reference to players in the scene
      this.name = "heart obj";
      this.connectedPlayers = [];
  
      // Add this sprite to the interactObjects group
      scene.interactObjects.add(this);
    }

    update(){

        console.log("connected players: " + this.connectedPlayers.length); 
        if (this.connectedPlayers.length >= 1)
        {
            let p1targetX = this.connectedPlayers[0].x;
            let p1targetY = this.connectedPlayers[0].y;

            let endTargetX = p1targetX;
            let endTargetY = p1targetY;
    
            if (this.connectedPlayers.length == 2)
            {
                let p2targetX = this.connectedPlayers[1].x;
                let p2targetY = this.connectedPlayers[1].y;

                this.playerMidpoint = this.scene.gizmos.calculateMidpoint({x: p1targetX, y: p1targetY}, {x: p2targetX, y: p2targetY});

                endTargetX = this.playerMidpoint.x;
                endTargetY = this.playerMidpoint.y;

            }
 
            // Check the distance between the grabbed object and the player
            const distance = Phaser.Math.Distance.Between(endTargetX, endTargetY, this.x, this.y);

            // Calculate the direction towards the player
            const directionX = endTargetX - this.x;
            const directionY = endTargetY - this.y;
            const length = Math.sqrt(directionX * directionX + directionY * directionY);
            const normalizedDirectionX = directionX / length;
            const normalizedDirectionY = directionY / length;

            // Check if the object is within the desired distance
            if (distance <= 25) {
                const lerpFactor = 0.1; // Adjust the lerp factor as needed
                this.setVelocity(
                    Phaser.Math.Linear(this.body.velocity.x, 0, lerpFactor),
                    Phaser.Math.Linear(this.body.velocity.y, 0, lerpFactor)
                );
            } 
            else {
                // Set the velocity of the grabbed object towards the player
                const speed = 50; // Adjust the speed as needed
                this.setVelocity(normalizedDirectionX * speed, normalizedDirectionY * speed);
            }
        }
    }

    connectPlayer(player) {
        // Check if the player already exists in the array
        const playerExists = this.connectedPlayers.some(p => p === player);
      
        // If the player doesn't exist, add it to the array
        if (!playerExists) {
          this.connectedPlayers.push(player);
        }
      }
}