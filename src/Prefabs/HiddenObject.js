class HiddenObject extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
      super(scene, x, y, texture);
      this.scene = scene;
      this.name = texture;
      this.scene.add.existing(this);
  
      this.setAlpha(0); // Start with zero opacity
      this.targetAlpha = 0; // Target opacity for lerping
      this.distanceThreshold = 50; 
      this.lerpSpeed = 0.05;
  
    }
  
    update(player) {

        if (player.echoActive){
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
      if (this.alpha < this.targetAlpha) {
        this.alpha = Phaser.Math.Linear(this.alpha, this.targetAlpha, this.lerpSpeed);
      }
    }
  
    hideObject() {
      if (this.alpha > this.targetAlpha) {
        this.alpha = Phaser.Math.Linear(this.alpha, this.targetAlpha, this.lerpSpeed); 
      }
    }
}
  