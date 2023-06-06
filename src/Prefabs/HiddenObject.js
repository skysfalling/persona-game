class HiddenObject {
    constructor(scene, object, playerEcho) {
        this.scene = scene;
        this.scene.add.existing(this);
        this.object = object;
        this.playerEcho = playerEcho;
        this.hidden = true;
    
        this.object.setAlpha(0);
        this.targetAlpha = 0; // Target opacity for lerping
        this.distanceThreshold = 100; 
        this.lerpSpeed = 0.05;

        this.scene.events.on('update', this.update); 
    }
  
    update() {
        if (this.playerEcho && this.playerEcho.echoActive)
        {
            const player = this.playerEcho;
            const distance = Phaser.Math.Distance.Between(player.x, player.y, this.object.x, this.object.y);

            if (distance <= this.distanceThreshold) {
                this.targetAlpha = 1;
                this.showObject();
            } 
            else {
                this.targetAlpha = 0;
                this.hideObject();
            }
        }
    }
  
    showObject() {
        this.hidden = false;
        if (this.object.alpha < this.targetAlpha) {
            this.object.alpha = Phaser.Math.Linear(this.object.alpha, this.targetAlpha, this.lerpSpeed);
        }
    }

    hideObject() {
        this.hidden = true;
        if (this.object.alpha > this.targetAlpha) {
            this.object.alpha = Phaser.Math.Linear(this.object.alpha, this.targetAlpha, this.lerpSpeed); 
        }
    }
}
  