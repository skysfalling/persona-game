class GameManager extends Phaser.Scene {
  constructor() {
    super('GameManager');
  }

  preload(){
    console.log(">> GameManager Init ::: Active Scenes : ", this.scene.manager.getScenes());
  
    this.scene.launch('Menu');


    this.currentSceneKey = "";
    this.currentUI = this.scene.get("UI");

    this.soundManager = new SoundManager(this);
    this.soundManager.load();
  }

  transitionFromMenuToLevel(levelSceneKey) {
    const menuScene = this.scene.get("Menu");
    console.log(this.scene.manager.getScenes());

    if (this.currentSceneKey !== levelSceneKey) {
      this.currentSceneKey = levelSceneKey;

      menuScene.cameras.main.fadeOut(500, 0, 0, 0);
      menuScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.stop('Menu');

        // start / restart level
        if (this.scene.isActive(levelSceneKey)) {
          this.scene.restart(levelSceneKey);
        } 
        else {
          this.scene.launch(levelSceneKey);
        }

        // start / restart ui
        if (this.scene.isActive("UI")) {
          this.scene.restart("UI");
        } 
        else {
          this.scene.launch("UI");
        }

        this.currentScene = this.scene.get(levelSceneKey);
        console.log(this.scene.manager.getScenes());
        console.log("]] TRANSITION TO LEVEL " + this.currentSceneKey + " -> " + levelSceneKey);
      });
    }
  };


  transitionFromLevelToMenu() {
    const oldLevelKey = this.currentSceneKey;
    if (this.currentSceneKey !== "Menu") {
      console.log(">> GameManager Scene Switch ( " + this.currentSceneKey + " -> Menu ");
      console.log("Active Scenes : ", this.scene.manager.getScenes());

      this.currentSceneKey = "Menu";

      this.currentScene.cameras.main.fadeOut(500, 0, 0, 0);
      this.currentUI.cameras.main.fadeOut(500, 0, 0, 0);
      this.currentScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.stop(oldLevelKey);
        this.scene.stop('UI');

        this.scene.launch("Menu");

        this.currentScene = this.scene.get("Menu");

      });
    }
  };

  create() {
    // Capture the space bar input
    this.input.keyboard.on('keydown-SPACE', () => {
      this.transitionFromMenuToLevel('Level1');
    });
  
    // Debug functionality
    this.input.keyboard.on('keydown-THREE', () => {
      this.transitionFromLevelToMenu();
    });

    this.input.keyboard.on('keydown-ONE', () => {
      this.transitionFromMenuToLevel('Level1');
    });
  
    this.input.keyboard.on('keydown-TWO', () => {
      this.transitionFromMenuToLevel('Level2');
    });

    // START BACKGROUND MUSIC
    this.soundManager.playMusic('backgroundMusic', { loop: true, volume: 0.2 });

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

  preload() {
    this.load.spritesheet('gif', 'assets/cutscene/test-cutscene.png', { frameWidth: 270, frameHeight: 270 });
  }

  create() {
    // Display the menu text
    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'Press Space to Start',
      { fontSize: '16px', fill: '#fff' }
    ).setOrigin(0.5);

    // Add the GIF sprite
    //this.gif = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'gif');

    // Start the animation
    this.anims.create({
      key: 'gif',
      frames: this.anims.generateFrameNumbers('gif', { start: 0, end: -1 }),
      frameRate: 10, // Set the frame rate to 10 frames per second
      repeat: -1 // Repeat indefinitely
    });
    //this.gif.play('gif');
  }
}

