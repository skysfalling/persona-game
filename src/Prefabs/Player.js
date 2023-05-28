class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, frame) {
        super(scene, x, y, 'characters', 0);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(this.width / 2, this.height/2);
        this.body.setCollideWorldBounds(true);
        
        this.cursors = scene.input.keyboard.createCursorKeys();

        this.extraCollider = scene.physics.add.sprite(x, y, 'collider');
        this.extraCollider.setAlpha(0); // Make the extra collider invisible
        // Set up collisions
        scene.physics.add.collider(this, scene.collisionLayer);
        scene.physics.add.collider(this, scene.playerGroup, () => {
            console.log("player collision");
            this.body.setVelocity(0);

        });

        scene.anims.create({
            key: 'down',
            frames: scene.anims.generateFrameNames('characters', {
                prefix: 'character-sheet',
                start: 0,
                end: 2,
                suffix: '.png'
            }),
            frameRate: 8,
            repeat: -1
        });

        scene.anims.create({
            key: 'up',
            frames: scene.anims.generateFrameNames('characters', {
                prefix: 'character-sheet',
                start: 6,
                end: 8,
                suffix: '.png'
            }),
            frameRate: 8,
            repeat: -1
        });

        scene.anims.create({
            key: 'horz-walk',
            frames: scene.anims.generateFrameNames('characters', {
                prefix: 'character-sheet',
                start: 3,
                end: 5,
                suffix: '.png'
            }),
            frameRate: 8,
            repeat: -1
        });
    }

    update() {
        this.body.setVelocity(0);

        this.extraCollider.setPosition(this.x, this.y);

        //#region PLAYERMOVEMENT
        if (this.cursors.left.isDown) {
            this.body.setVelocityX(-100);
            this.setFlipX(false);
            this.anims.play('horz-walk', true);
        } else if (this.cursors.right.isDown) {
            this.body.setVelocityX(100);
            this.setFlipX(true);
            this.anims.play('horz-walk', true);
        } else if (this.cursors.up.isDown) {
            this.body.setVelocityY(-100);
            this.setFlipX(false);
            this.anims.play('up', true);
        } else if (this.cursors.down.isDown) {
            this.body.setVelocityY(100);
            this.anims.play('down', true);
        } else {
            this.anims.stop();
        }
        //#endregion
        
    }
}
