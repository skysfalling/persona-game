class Campfire extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, 'campfire');
      scene.add.existing(this);
      scene.physics.add.existing(this);
        this.body.setImmovable(true);


      this.connectedPlayer;
      this.setupAnimations();
  
      // Create the overlap trigger
      this.overlapTrigger = scene.add.zone(x, y).setSize(this.width, this.height);
      scene.physics.add.existing(this.overlapTrigger);
      this.overlapTrigger.body.setAllowGravity(false);
      this.overlapTrigger.body.moves = false;
      this.overlapTrigger.visible = false;
    }
  
    setupAnimations() {
        this.scene.anims.create({
            key: 'campfire_loop',
            frames: this.anims.generateFrameNumbers('campfire', { start: 0, end: 4 }),
            frameRate: 4,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'campfire_blue_loop',
            frames: this.anims.generateFrameNumbers('campfire_blue', { start: 0, end: 4 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'campfire_violet_loop',
            frames: this.anims.generateFrameNumbers('campfire_violet', { start: 0, end: 4 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.play('campfire_loop', true);
    }
  
    update() {



    }

    connectPlayer(player) {

        if (this.connectedPlayer)
        {
            this.disconnectPlayer(this.connectedPlayer);
        }

        this.connectedPlayer = player;
        this.connectedPlayer.disable = true;
        this.connectedPlayer.tetheredObject = this;

        if (this.connectedPlayer.playerID == 1) { this.anims.play('campfire_violet_loop', true); }
        else if (this.connectedPlayer.playerID == 2) { this.anims.play('campfire_blue_loop', true); }
        else { this.anims.play('campfire_loop', true); }
    }

    disconnectPlayer(player) {
        player.disable = false;
        this.connectedPlayer.tetheredObject = null;
        this.connectedPlayer = null;

        this.anims.play('campfire_loop', true);
    }
}
  