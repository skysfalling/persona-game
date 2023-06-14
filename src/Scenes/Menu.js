class Menu extends Phaser.Scene {
    constructor() {
      super('Menu');
    }
  
    create() {
      // Display the menu text
      this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'Press Space to Start',
        { fontSize: '16px', fill: '#fff' }
      ).setOrigin(0.5);
  
      // Capture the space bar input
      const spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
      // Start the Play scene when space bar is pressed
      this.input.keyboard.on('keydown-SPACE', () => {
        this.scene.start('playScene');
      });
    }
  }