class GameManager extends Phaser.Scene {
  constructor() {
    super('GameManager');

    this.prefix = ">> GameManager "
    this.gameProgression = 0;
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

  transitionToScene(targetSceneKey) {
    console.log("transition attempt " + targetSceneKey);
    const oldLevelKey = this.currentSceneKey;

    if (this.currentSceneKey !== targetSceneKey) {
      console.log(this.prefix + " Scene Switch (" + this.currentSceneKey + " -> " + targetSceneKey + ")");
      console.log("Active Scenes: ", this.scene.manager.getScenes());
  
      this.currentScene = this.scene.get(this.currentSceneKey);
      if (this.currentScene.soundManager)
      {
        this.currentScene.soundManager.stopAllSFX();
      }
      
      this.currentSceneKey = targetSceneKey;

      this.currentScene.cameras.main.fadeOut(500, 0, 0, 0);
      this.currentScene.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.stop(oldLevelKey);
    
          // Restart the UI scene
          this.scene.stop('UI');
          this.scene.launch('UI');

          // Start or restart the level scene
          if (this.scene.isActive(targetSceneKey)) {
            this.scene.restart(targetSceneKey);
          } else {
            this.scene.launch(targetSceneKey);
          }
    
          this.currentScene = this.scene.get(targetSceneKey);
        

          // LEVEL SOUND SETTINGS
          if (this.currentSceneKey === "Level1" || this.currentSceneKey === "Level2" || this.currentSceneKey === "Level3")
          {
            this.soundManager.playMusic("backgroundMusic", 0.5);
            this.soundManager.playSFX("ambience", {loop: true});
          }
          else 
          {
            this.soundManager.stopMusic("backgroundMusic");
            this.soundManager.stopSFX("ambience");

            if (this,this.currentSceneKey == "Menu")
            {
              this.soundManager.playSFX("ambience", {loop: true});
            }
          }
          console.log(this.prefix + " gameProgression: " + this.gameProgression);
      });
    }
  }
  
  create() {
    // Capture the space bar input
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.currentSceneKey === "Menu")
      {
        this.gameProgression = 1;
        this.transitionToScene('IntroCutscene');
      }
    });
  
    this.input.keyboard.on('keydown-ONE', () => {
      this.transitionToScene('IntroCutscene');
    });
  
    this.input.keyboard.on('keydown-TWO', () => {
      this.transitionToScene('ReflectionCutscene');
    });

    // Debug functionality
    this.input.keyboard.on('keydown-THREE', () => {
      this.transitionToScene('RunCutscene');
    });

    this.input.keyboard.on('keydown-FOUR', () => {
      this.transitionToScene('EndCutscene');
    });

    this.input.keyboard.on('keydown-FIVE', () => {
      this.transitionToScene('Menu');
    });

    this.input.keyboard.on('keydown-SIX', () => {
      this.transitionToScene('Level1');
    });

    this.input.keyboard.on('keydown-SEVEN', () => {
      this.transitionToScene('Level2');
    });

    this.input.keyboard.on('keydown-EIGHT', () => {
      this.transitionToScene('Level3');
    });

    this.soundManager.playSFX("ambience", {loop:true});
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

class IntroCutscene extends Phaser.Scene {
  constructor() {
    super('IntroCutscene');
  }

  preload() {
    // Load the video file
    this.load.video('video', 'assets/cutscene/persona-intro.mp4');
  }

  create() {
    this.gameManager = this.scene.get('GameManager');
    this.gameManager.gameProgression = 1;

    // Load and play the video using the id
    this.video = this.add.video(0, 0, 'video').setScale(0.3).setOrigin(0).setAlpha(1);
    this.video.resolution = 10;
    this.video.play();

    // Event triggered when the video completes
    this.video.on('complete', () => {
      this.gameManager.transitionToScene("Level1");
    });
  }
}

class ReflectionCutscene extends Phaser.Scene {
  constructor() {
    super('ReflectionCutscene');
  }

  preload() {

    // Load the video file
    this.load.video('reflection-video', 'assets/cutscene/reflection-cutscene.mp4');
  }

  create() {
    this.gameManager = this.scene.get('GameManager');
    this.gameManager.gameProgression = 2;

    // Load and play the video using the id
    this.video = this.add.video(0, 0, 'reflection-video').setScale(0.3).setOrigin(0).setAlpha(1);
    this.video.resolution = 10;
    this.video.play();

    // Event triggered when the video completes
    this.video.on('complete', () => {
      this.gameManager.transitionToScene("Level2");
    });
  }
}

class RunCutscene extends Phaser.Scene {
  constructor() {
    super('RunCutscene');
  }

  preload() {

    // Load the video file
    this.load.video('run-video', 'assets/cutscene/run-cutscene.mp4');
  }

  create() {
    this.gameManager = this.scene.get('GameManager');
    this.gameManager.gameProgression = 3;

    // Load and play the video using the id
    this.video = this.add.video(0, 0, 'run-video').setScale(0.3).setOrigin(0).setAlpha(1);
    this.video.resolution = 10;
    this.video.play();

    // Event triggered when the video completes
    this.video.on('complete', () => {
      this.gameManager.transitionToScene("Level3");
    });
  }
}

class EndCutscene extends Phaser.Scene {
  constructor() {
    super('EndCutscene');
  }

  preload() {
    // Load the video file
    this.load.video('end-video', 'assets/cutscene/end-cutscene.mp4');
  }

  create() {
    this.gameManager = this.scene.get('GameManager');
    this.gameManager.gameProgression = 4;

    // Load and play the video using the id
    this.video = this.add.video(0, 0, 'end-video').setScale(0.3).setOrigin(0).setAlpha(1);
    this.video.resolution = 10;
    this.video.play();

    // Event triggered when the video completes
    this.video.on('complete', () => {
      this.gameManager.transitionToScene("Menu");
    });
  }
}

class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  preload() {
    this.load.bitmapFont('doomed', 'assets/fonts/doomed.png', 'assets/fonts/doomed.xml');
    this.load.bitmapFont('awasete', 'assets/fonts/awasete.png', 'assets/fonts/awasete.xml');
  }

  create() {
    this.gameManager = this.scene.get('GameManager');

    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Calculate the x-position for each button
    const buttonSpacing = 50;
    const buttonWidth = 100;
    const buttonCount = 3;
    const totalButtonWidth = buttonWidth * buttonCount + buttonSpacing * (buttonCount - 1);

    // Create the buttons
    this.button1 = this.createButton(screen.center.x - 25, screen.center.y, '1', 10);
    this.button2 = this.createButton(screen.center.x, screen.center.y, '2', 10);
    this.button3 = this.createButton(screen.center.x + 25, screen.center.y, '3', 10);

    // Set the depth and interactive behavior for each button
    this.button1.setDepth(1);
    this.button2.setDepth(1);
    this.button3.setDepth(1);

    this.button1.setInteractive({ useHandCursor: true });
    this.button2.setInteractive({ useHandCursor: true });
    this.button3.setInteractive({ useHandCursor: true });


    // Handle button click events
    this.button1.on('pointerdown', () => {
      this.gameManager.transitionToScene("IntroCutscene");
    });

    this.button2.on('pointerdown', () => {
      this.gameManager.transitionToScene("ReflectionCutscene");
    });

    this.button3.on('pointerdown', () => {
      this.gameManager.transitionToScene("RunCutscene");
    });

    /// (( CREATE TITLE ))
    this.titleText = this.add.bitmapText(
      screenWidth / 2,
      screenHeight / 2 - 25,
      'doomed',
      'PERSONA',
      40
    );
    this.titleText.setScrollFactor(0);
    this.titleText.setDepth(2);
    this.titleText.setOrigin(0.5, 1);
    this.titleText.setTint(0xcccccc);

    /// (( CREATE START TEXT ))
    this.startText = this.add.bitmapText(
      screenWidth / 2,
      screenHeight / 2 + 100,
      'awasete',
      '-- press space to begin --',
      11
    );
    this.startText.setScrollFactor(0);
    this.startText.setDepth(2);
    this.startText.setOrigin(0.5, 1);
    this.startText.setTint(0xcccccc);

    this.devTagText = this.add.bitmapText(
      5,
      screenHeight - 5,
      'awasete',
      'skysfalling',
      8
    );
    this.devTagText.setScrollFactor(0);
    this.devTagText.setDepth(2);
    this.devTagText.setOrigin(0, 1);
    this.devTagText.setTint(0xcccccc);

    this.versionText = this.add.bitmapText(
      screen.width - 5,
      screenHeight - 5,
      'awasete',
      'v0.44',
      8
    );
    this.versionText.setScrollFactor(0);
    this.versionText.setDepth(2);
    this.versionText.setOrigin(1, 1);
    this.versionText.setTint(0xcccccc);
  }

  update() {
    // Hide or show buttons based on gameProgression
    switch (this.gameManager.gameProgression) {
      case 0:
        this.button1.setVisible(false);
        this.button2.setVisible(false);
        this.button3.setVisible(false);
        break;
      case 1:
        this.button1.setVisible(true);
        this.button2.setVisible(false);
        this.button3.setVisible(false);
        break;
      case 2:
        this.button1.setVisible(true);
        this.button2.setVisible(true);
        this.button3.setVisible(false);
        break;
      case 3:
        this.button1.setVisible(true);
        this.button2.setVisible(true);
        this.button3.setVisible(true);
        break;
      default:
        this.button1.setVisible(true);
        this.button2.setVisible(true);
        this.button3.setVisible(true);
    }
  }

  createButton(x, y, text, fontSize = 20) {
    const button = this.add.bitmapText(x, y, 'awasete', text, fontSize);
    button.setOrigin(0.5);
    button.setTint(0xcccccc);
    return button;
  }
}



