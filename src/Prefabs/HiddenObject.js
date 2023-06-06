class HiddenObject {
    constructor(scene, object, playerEcho) {
        this.scene = scene;
        this.scene.add.existing(this);
        this.object = object;
        this.playerEcho = playerEcho;
    
        this.object.setAlpha(0);
        this.targetAlpha = 0; // Target opacity for lerping
        this.distanceThreshold = 50; 
        this.lerpSpeed = 0.05;

        this.scene.events.on('update', this.update); 
    }
  
    update() {

        if (this.playerEcho)
        {
            const player = this.object.playerEcho;
            const distance = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
        
            if (distance <= this.distanceThreshold) {
                // Object is within the distance threshold, show it
                this.targetAlpha = 1;
                this.showObject();
            } else {
                // Object is outside the distance threshold, fade it away
                this.targetAlpha = 0;
                this.hideObject();
            }
        }
    }
  
    showObject() {
        if (this.object.alpha < this.targetAlpha) {
            this.object.alpha = Phaser.Math.Linear(this.alpha, this.targetAlpha, this.lerpSpeed);
        }
        }
    
        hideObject() {
        if (this.object.alpha > this.targetAlpha) {
            this.object.alpha = Phaser.Math.Linear(this.alpha, this.targetAlpha, this.lerpSpeed); 
        }
    }
}
  