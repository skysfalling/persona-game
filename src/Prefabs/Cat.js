class Cat extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, id_type) {
      super(scene, x, y, 'cat_idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setImmovable(true);

        this.name = 'cat';
        this.id_type = id_type;
        console.log(":3 CAT -> setup: id_type " + this.id_type);

        this.correspondingExit;
        this.setupAnimations();
    
        // Create the overlap trigger
        this.overlapTrigger = scene.add.zone(x, y).setSize(this.width*3, this.height*3);
        scene.physics.add.existing(this.overlapTrigger);
        this.overlapTrigger.body.setAllowGravity(false);
        this.overlapTrigger.body.moves = false;
        this.overlapTrigger.visible = false;
    }

    setupAnimations() {
        this.scene.anims.create({
            key: 'default_cat_idle',
            frames: this.anims.generateFrameNumbers('cat_idle', { start: 0, end: 9 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'violet_cat_idle',
            frames: this.anims.generateFrameNumbers('cat_idle', { start: 10, end: 19 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'blue_cat_idle',
            frames: this.anims.generateFrameNumbers('cat_idle', { start: 20, end: 29 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'violet_cat_walk',
            frames: this.anims.generateFrameNumbers('cat_walk', { start: 4, end: 8 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'blue_cat_walk',
            frames: this.anims.generateFrameNumbers('cat_walk', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });

        this.playIdle(this.id_type);
    }

    playIdle(id){
        if (id == 1){ this.anims.play('violet_cat_idle', true); }
        else if (id == 2){ this.anims.play('blue_cat_idle', true); }
        else { this.anims.play('default_cat_idle', true); }
    }

    playWalk(id)
    {
        if (id == 1){ this.anims.play('violet_cat_walk', true); }
        else if (id == 2){ this.anims.play('blue_cat_walk', true); }
    }

    submit(id)
    {
        if (this.id_type === 0 || id == this.id_type)
        {
            console.log(" :3 CAT -> is satisfied by type " + id);
            this.moveToExit();
        }
    }

    moveToExit() {
        this.playWalk(this.id_type);

        if (this.correspondingExit) {
          const exitX = this.correspondingExit.x;
          const exitY = this.correspondingExit.y;
          const duration = 1500;
      
          this.scene.tweens.add({
            targets: this,
            x: exitX,
            y: exitY,
            duration: duration,
            onComplete: () => {
              // Remove the cat object when the tween is complete
              this.destroy();
            }
          });
        } else {
          console.warn(`No corresponding exit object found for cat with exit_id: ${this.exitId}`);
        }
    }
}