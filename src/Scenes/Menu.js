class GameManager extends Phaser.Scene {
  constructor() {
    super('GameManager');
  }

  create() {
    console.log(">> GameManager initialization");
  
    this.currentScene = '';
  

  
    // Transition to the specified scene when the space bar is pressed
    const transitionToScene = (sceneKey) => {
      if (this.currentScene !== sceneKey && this.scene.isActive('Menu')) {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.stop('UI');
          this.scene.stop('Menu');
          this.scene.stop(this.currentScene);
          this.scene.start(sceneKey);
          this.currentScene = sceneKey;

          if (sceneKey === "Level1"){

          }
          else if (sceneKey === "Level2"){
          }
        });
      }
    };
  
    // Capture the space bar input
    this.input.keyboard.on('keydown-SPACE', () => {
      transitionToScene('Level1');
    });
  
    // Debug functionality to switch between Level1 and Level2
    this.input.keyboard.on('keydown-ONE', () => {
      transitionToScene('Level1');
    });
  
    this.input.keyboard.on('keydown-TWO', () => {
      transitionToScene('Level2');
    });
  }
  
}

class UI extends Phaser.Scene {

  constructor ()
  {
      super({ key: 'UI' });
  }

  preload(){

      this.load.bitmapFont('awasete', 'assets/fonts/awasete.png', 'assets/fonts/awasete.xml');

      this.load.spritesheet('character_profiles', 'assets/characters/character_profiles.png', {
          frameWidth: 32,
          frameHeight: 32
      });

      this.cursors = this.input.keyboard.createCursorKeys();
  }
}

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

    // Start the GameManager scene
    this.scene.launch('GameManager');
  }
}


