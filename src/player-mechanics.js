class PlayerMovement {
    constructor(player) {
      this.player = player;
      this.cursors = player.scene.input.keyboard.createCursorKeys();
    }
  
    update() {
      // Player movement logic
      // Use this.player to access the player object
      // Use this.cursors to access the keyboard input
  
      // Example code:
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.player.moveSpeed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.player.moveSpeed);
      } else {
        this.player.setVelocityX(0);
      }
  
      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-this.player.moveSpeed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(this.player.moveSpeed);
      } else {
        this.player.setVelocityY(0);
      }
    }
  }