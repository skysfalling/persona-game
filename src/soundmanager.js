class SoundManager {
    constructor(scene) {
      this.scene = scene;
      this.music = null;
      this.sfx = {};
    }
  
    // #region Loading Sound
    // Preload music track
    loadMusic(key, filePath) {
        this.scene.load.audio(key, filePath);
    }

    // Preload sound effect
    loadSFX(key, filePath) {
        this.scene.load.audio(key, filePath);
    }

    // Preload all sounds and music
    load() {
        this.loadMusic('backgroundMusic', 'assets/sounds/death_of_an_octopus.wav');

        this.loadSFX('cat1', 'assets/sounds/cat_1.wav');
        this.loadSFX('cat2', 'assets/sounds/cat_2.wav');

        this.catSfxList = ['cat1', 'cat2']; // List of cat sound effect keys

    }
    // #endregion

    // #region Music
    // Play background music
    playMusic(key, config) {
      this.stopMusic();
      this.music = this.scene.sound.add(key, config);
      this.music.play();
    }
    
    // Pause background music
    pauseMusic() {
        if (this.music && this.music.isPlaying) {
          this.music.pause();
        }
      }
    
    // Resume paused background music
    resumeMusic() {
        if (this.music && this.music.isPaused) {
            this.music.resume();
        }
    }

    // Stop playing background music
    stopMusic() {
      if (this.music) {
        this.music.stop();
        this.music = null;
      }
    }
    //#endregion
  
    // #region SFX
    // Play sound effect
    playSFX(key, config) {
      const sound = this.scene.sound.add(key, config);
      sound.play();
      this.sfx[key] = sound;
      console.log("SOUND )) : Play SFX " + key );
    }
  
    // Stop playing a specific sound effect
    stopSFX(key) {
      const sound = this.sfx[key];
      if (sound) {
        sound.stop();
        delete this.sfx[key];
      }
    }
  
    // Stop playing all sound effects
    stopAllSFX() {
      Object.values(this.sfx).forEach((sound) => sound.stop());
      this.sfx = {};
    }

    playRandCatSfx() {
        const randomIndex = Phaser.Math.RND.between(0, this.catSfxList.length - 1);
        const randomKey = this.catSfxList[randomIndex];
        this.playSFX(randomKey);
    }


    // #endregion
  
    // #region Mute
    // Mute all audio
    mute() {
      this.scene.sound.mute = true;
    }
  
    // Unmute all audio
    unmute() {
      this.scene.sound.mute = false;
    }
  
    // Toggle audio mute/unmute
    toggleMute() {
      this.scene.sound.mute = !this.scene.sound.mute;
    }
    //#endregion
}
  