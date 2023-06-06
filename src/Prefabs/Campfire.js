class Campfire extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, 'campfire');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setImmovable(true);

        this.name = 'campfire';

        this.connectedPlayer;
        this.setupAnimations();
    }
  
    setupAnimations() {
        this.scene.anims.create({
            key: 'campfire_loop',
            frames: this.anims.generateFrameNumbers('campfire', { start: 0, end: 4 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'campfire_violet_loop',
            frames: this.anims.generateFrameNumbers('campfire', { start: 5, end: 9 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'campfire_blue_loop',
            frames: this.anims.generateFrameNumbers('campfire', { start: 10, end: 14 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.play('campfire_loop', true);
    }

    connectPlayer(player) {

        if (this.connectedPlayer)
        {
            this.disconnectPlayer(this.connectedPlayer);
        }

        this.connectedPlayer = player;
        this.connectedPlayer.enableMove = false;
        this.connectedPlayer.newTetheredObject(this);

        if (this.connectedPlayer.playerID == 1) { this.anims.play('campfire_violet_loop', true); }
        else if (this.connectedPlayer.playerID == 2) { this.anims.play('campfire_blue_loop', true); }
        else { this.anims.play('campfire_loop', true); }
    }

    disconnectPlayer(player) {
        player.enableMove = true;
        this.connectedPlayer.tetheredObject = null;
        this.connectedPlayer = null;

        this.anims.play('campfire_loop', true);
    }
}
  