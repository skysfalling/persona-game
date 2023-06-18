class SoundManager {
    constructor(scene) {
      this.scene = scene;
      this.music = null;
      this.sfx = {};

      this.walkLoopActive = false;
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
        this.loadMusic('backgroundMusic', 'assets/music/persona.wav');
        this.loadMusic('ambience', 'assets/sounds/ambience_empty-room.wav');

        this.loadSFX('cat1', 'assets/sounds/cat_1.wav');
        this.loadSFX('cat2', 'assets/sounds/cat_2.wav');
        this.catSfxList = ['cat1', 'cat2'];

        this.loadSFX('text-click_1', 'assets/sounds/text-click_1.wav');
        this.loadSFX('text-click_2', 'assets/sounds/text-click_2.wav');
        this.textClickList = ['text-click_1', 'text-click_2']; 

        this.loadSFX('walkLoop', 'assets/sounds/walk_loop.wav');

        this.loadSFX('tether_break', 'assets/sounds/tether_break.mp3');
        this.loadSFX('tether_connect', 'assets/sounds/tether_connect.mp3');


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
      if (!this.sfx[key]) {
        const sound = this.scene.sound.add(key, config);
        sound.play();
        this.sfx[key] = sound;
        console.log("SOUND )): Play SFX " + key);
      }
      else
      {
        const sound = this.sfx[key];
        sound.play();
      }
    }

    // Stop playing a specific sound effect
    stopSFX(key) {
      if (this.sfx[key]) {
        const sound = this.sfx[key];
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
        this.playSFX(randomKey, {volume : 2});
    }

    playRandTextClick() {
      const randomIndex = Phaser.Math.RND.between(0, this.textClickList.length - 1);
      const randomKey = this.textClickList[randomIndex];
      this.playSFX(randomKey, {volume : 0.2});
    }

    enableWalkLoopSFX(enable) {
      const key = 'walkLoop'; // Replace with the actual key of the walk loop sound effect
    
      if (enable && !this.sfx[key] && !this.walkLoopActive) {

        console.log("enable walkLoop SFX");

        // If enable is true and the sound is not already playing, play the walk loop sound effect
        const config = {
          //loop: true, // Set loop to true for continuous playback
          volume: 0.05, // Set the desired volume for the walk loop sound effect
        };
        this.playSFX(key, config);
        this.walkLoopActive = true;
      } 
      else if (!enable && this.sfx[key] && this.walkLoopActive) {
        // If enable is false and the sound is playing, stop the walk loop sound effect
        this.stopSFX(key);
        this.walkLoopActive = false;

        console.log("disable walkLoop SFX");

      }
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

    // Fade out and stop an SFX sound
    fadeAndStopSFX(key, duration = 10) {
      const sound = this.sfx[key];

      if (sound) {
        const fadeDuration = duration;
        const fadeStep = sound.volume / fadeDuration;

        const fadeOutInterval = setInterval(() => {
          sound.volume -= fadeStep;

          if (sound.volume <= 0) {
            sound.stop();
            clearInterval(fadeOutInterval);
            delete this.sfx[key];
          }
        }, 1); // Interval of 1ms for smoother fade-out
      }
    }

}
  