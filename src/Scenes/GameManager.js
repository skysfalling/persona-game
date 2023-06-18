class GameManager extends Phaser.Scene {
  constructor() {
    super('GameManager');
  }

  preload(){
    console.log(">> GameManager Init ::: Active Scenes : ", this.scene.manager.getScenes());
  
    this.scene.launch('Menu');
    this.menuScene = this.scene.get("Menu");

    this.currentSceneKey = "Menu";
    this.currentUI = this.scene.get("UI");

    this.soundManager = new SoundManager(this);
    this.soundManager.load();
  }

  transitionFromMenuToCutscene(cutsceneSceneKey) {
    const menuScene = this.scene.get("Menu");
    console.log(this.scene.manager.getScenes());
    console.log("menuScene " , menuScene);

    if (this.currentSceneKey !== cutsceneSceneKey) {
      this.currentSceneKey = cutsceneSceneKey;
  
      menuScene.cameras.main.fadeOut(500, 0, 0, 0);
      menuScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.stop('Menu');
  
        // Start / restart cutscene
        if (this.scene.isActive(cutsceneSceneKey)) {
          this.scene.restart(cutsceneSceneKey);
        } 
        else {
          this.scene.launch(cutsceneSceneKey);
        }
  
        this.currentScene = this.scene.get(cutsceneSceneKey);
        console.log(this.scene.manager.getScenes());
        console.log("]] TRANSITION TO CUTSCENE " + this.currentSceneKey + " -> " + cutsceneSceneKey);
      });
    }
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
        console.log("]] TRANSITION MENU TO LEVEL " + this.currentSceneKey + " -> " + levelSceneKey);
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

  transitionBetweenLevels(levelSceneKey) {
    console.log("transition attempt " + levelSceneKey);
    const oldLevelKey = this.currentSceneKey;

    if (this.currentSceneKey !== levelSceneKey) {
      console.log(">> GameManager Scene Switch (" + this.currentSceneKey + " -> " + levelSceneKey + ")");
      console.log("Active Scenes: ", this.scene.manager.getScenes());
  
      this.currentScene = this.scene.get(this.currentSceneKey);
      this.currentSceneKey = levelSceneKey;
  
      this.currentScene.cameras.main.fadeOut(500, 0, 0, 0);
      this.currentScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.stop(oldLevelKey);
  
        // Start or restart the UI scene
        this.scene.stop('UI');
        this.scene.launch('UI');

        // Start or restart the level scene
        if (this.scene.isActive(levelSceneKey)) {
          this.scene.restart(levelSceneKey);
        } else {
          this.scene.launch(levelSceneKey);
        }
  
        this.currentScene = this.scene.get(levelSceneKey);
      });
    }
  }
  

  create() {
    // Capture the space bar input
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.currentSceneKey === "Menu")
      {
        this.transitionFromMenuToCutscene('Cutscene');
        this.soundManager.fadeAndStopMusic();
      }
    });
  
    this.input.keyboard.on('keydown-ONE', () => {
      this.transitionBetweenLevels('Level1');
    });
  
    this.input.keyboard.on('keydown-TWO', () => {
      this.transitionBetweenLevels('Level2'); 
    });

    // Debug functionality
    this.input.keyboard.on('keydown-THREE', () => {
      this.transitionBetweenLevels('Level3');
    });

    this.input.keyboard.on('keydown-FOUR', () => {
      this.transitionFromLevelToMenu();
    });

    this.soundManager.playMusic("ambience", {loop:true});


  }
  
  update(){
    console.log(this.scene.manager.getScenes());

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

class Cutscene extends Phaser.Scene {
  constructor() {
    super('Cutscene');
  }

  preload() {
    // Load the video file
    this.load.video('video', 'assets/cutscene/persona-intro.mp4');
  }

  create() {

    // Load and play the video using the id
    this.video = this.add.video(0, 0, 'video').setScale(0.3).setOrigin(0).setAlpha(1);
    this.video.resolution = 10;
    this.video.play();

    // Event triggered when the video completes
    this.video.on('complete', () => {
      // Transition to another scene
      this.scene.start('Level1');
      // Stop and destroy this scene
      this.scene.stop('Cutscene');
    });
  }
}

class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  preload() {

  }

  create() {

    this.add.text(
      screen.center.x,
      screen.center.y - 25,
      'Persona',
      { fontSize: '24px', fill: '#fff' }
    ).setOrigin(0.5);

    this.add.text(
      screen.center.x,
      screen.center.y + 50,
      'Press Space to Start',
      { fontSize: '12px', fill: '#fff' }
    ).setOrigin(0.5);

    this.add.text(
      screen.center.x,
      screen.botMid.y - 10,
      'skysfalling. 2023. v0.2 ',
      { fontSize: '10px', fill: '#fff', resolution: 1 }
    ).setOrigin(0.5);

    // Add the GIF sprite
    //this.gif = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'gif');



    /*
    // Start the animation
    this.anims.create({
      key: 'gif',
      frames: this.anims.generateFrameNumbers('gif', { start: 0, end: -1 }),
      frameRate: 10, // Set the frame rate to 10 frames per second
      repeat: -1 // Repeat indefinitely
    });
    */

    //this.gif.play('gif');
  }
}

