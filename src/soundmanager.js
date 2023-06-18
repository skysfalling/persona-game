class SoundManager {
    constructor(scene) {
      this.scene = scene;
      this.music = null;
      this.sfx = {};
      this.prefix = " SOUND )): ";
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

        this.loadSFX('campfire', 'assets/sounds/campfire_sfx.wav');


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
      let sound = this.sfx[key];

      // create sound effect
      if (!sound) {
        sound = this.scene.sound.add(key, config);
        this.sfx[key] = sound;
      }

      // if not playing already :: 
      if (!this.isSFXPlaying(key))
      {
        // play sound effect
        sound.play();
        //console.log("SOUND )): Play SFX " + key, this.sfx);
      }
    }

    // Stop playing a specific sound effect
    stopSFX(key) {
      if (this.sfx[key]) {
        const sound = this.sfx[key];
        sound.stop();
      }
    }

    // Stop playing all sound effects
    stopAllSFX() {
      Object.values(this.sfx).forEach((sound) => sound.stop());
      this.sfx = {};
    }

    isSFXPlaying(key) {
      const sound = this.scene.sound.get(key);
      return sound ? sound.isPlaying : false;
    }

    // -=================================================================//

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

    fadeAndStopMusic(key, duration = 100) {
      const music = this.music[key];
    
      if (music) {
        const fadeDuration = duration;
        const fadeStep = music.volume / fadeDuration;
    
        const fadeOutInterval = setInterval(() => {
          music.volume -= fadeStep;
    
          if (music.volume <= 0) {
            music.stop();
            clearInterval(fadeOutInterval);
          }
        }, 1); // Interval of 1ms for smoother fade-out
      }
    }

}
  