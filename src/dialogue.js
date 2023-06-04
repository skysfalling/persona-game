class Dialogue {
    constructor(scene, x, y, textSize) {
      this.scene = scene;
      this.x = x;
      this.y = y;
      this.textSize = textSize;

        this.text = scene.add.text(x, y, 'dialogue', {
            fontSize: textSize,
            fontFamily: 'Awasete Powder',
            color: '#ffffff',
            resolution: 10
        });
        this.currentIndex = 0;
        this.isTyping = false;
    }


    typeText(text, color) {
      this.currentIndex = 0;
      this.text.setText('');
      this.text.setColor(color);
      this.isTyping = true;
  
      this.scene.time.addEvent({
        callback: () => this.typeNextCharacter(text),
        delay: 100, // Adjust the delay between characters as needed
        repeat: text.length - 1,
      });
    }
  
    typeNextCharacter(text) {
      this.text.setText(this.text.text + text[this.currentIndex]);
      this.currentIndex++;
  
      if (this.currentIndex === text.length) {
        this.isTyping = false;
      }
    }
  }
  