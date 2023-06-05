class DialogueManager {
    constructor(scene) {
        this.scene = scene;
        this.gizmos = new Gizmos(scene);
        this.graphics = this.gizmos.graphics;
        this.graphics.setDepth(globalDepth.ui);
        this.gizmos.enabled = true;

        this.currDialogue;

        // -- position and scale --------------------------------------------------------
        this.screenMargin = 50;
        this.portraitWidth = 50;

        this.origin = {x: screen.center.x, y: screen.height - this.screenMargin};
        this.left_point = {x: 0 + this.screenMargin, y: screen.height - this.screenMargin};
        this.right_point = {x: screen.width - this.screenMargin, y: screen.height - this.screenMargin};

        // -- [[ DIALOG ]] --------------------------------------------------------
        // Define a key to toggle editor mode
        this.skipTextActive = false;
        this.fontSize = 16;
        this.characterDelay = 25;
        this.characterWrapLimit = 40; // Adjust the character wrap limit as needed

        // -- create dialog text object --------------------------------------------------------
        this.dialogueTextObj = scene.add.bitmapText(this.origin.x - this.screenMargin, this.origin.y - this.screenMargin/2, 'awasete', "default dialog text", this.fontSize);
        this.dialogueTextObj.setScrollFactor(0);
        this.dialogueTextObj.setDepth(globalDepth.ui + 1);
        this.dialogueTextObj.setScale(0.5);
        this.dialogueTextObj.setLineSpacing(30); // Set the desired line spacing value (in pixels)
        this.currCharIndex = 0;
        this.isTyping = false;

        this.skipPromptText = scene.add.bitmapText(this.origin.x, this.origin.y + this.screenMargin*0.75, 'awasete', "<< spacebar to skip >>", 16);
        this.skipPromptText.setScrollFactor(0);
        this.skipPromptText.setDepth(globalDepth.ui + 1);
        this.skipPromptText.setScale(0.5);
        this.skipPromptText.setOrigin(0.5);
        this.skipPromptText.setTint(0x333333);

        // -- create dialog box --------------------------------------------------------
        this.currentProfile = "violet";
        this.profile_image = scene.add.sprite(this.left_point.x, this.left_point.y, 'character_profiles');
        this.profile_image.setScale(2);
        this.profile_image.setScrollFactor(0);
        this.profile_image.setOrigin(0.25, 0.5);
        this.profile_image.setDepth(globalDepth.ui + 1);

        // grey background
        this.backgroundRect = scene.add.rectangle(this.origin.x, this.origin.y, screen.width - this.screenMargin, 75, 0x000000, 0.8);
        this.backgroundRect.setScrollFactor(0);
        this.backgroundRect.setOrigin(0.5, 0.5);

        // -- [[ CHARACTER PROFILES ]] --------------------------------------------------------
        this.randomSwitchProfileFrame(this.profile_image, 'character_profiles', 0, 2);
        
        this.hide();
    }
    // adds 'newline' so that the text wraps
    wrapTextString(text, wrapLimit) {
        const words = text.split(' ');
        let line = '';
        let newLines = '';
        
        for (let i = 0; i < words.length; i++) {
            if (line.length + words[i].length <= wrapLimit) 
            {
                line += words[i] + ' ';
            } 
            else {
                newLines += line.trim() + '\n';
                line = words[i] + ' ';
            }
        }
        
        return newLines + line.trim();
    }

    show() {
        this.dialogueTextObj.setVisible(true); // Show the dialogue text object
        this.skipPromptText.setVisible(true);
        this.profile_image.setVisible(true); // Show the profile image
        this.backgroundRect.setVisible(true); // Show the dialogue box
    }
    
    hide() {
        this.dialogueTextObj.setVisible(false); // Hide the dialogue text object
        this.skipPromptText.setVisible(false);
        this.profile_image.setVisible(false); // Hide the profile image
        this.backgroundRect.setVisible(false); // Hide the dialogue box
    }

    // -- [[ TYPE TEXT ]] --------------------------------------------------------
    typeText(text, color) {
        this.currText = this.wrapTextString(text, this.characterWrapLimit); // use newlines to wrap text
        this.currCharIndex = 0;
        this.dialogueTextObj.setText(''); // reset dialog text obj
        this.dialogueTextObj.setTint(color);
        this.isTyping = true; // isTyping flag

        // typing event that loops through characters
        this.typingEvent = this.scene.time.addEvent({
            delay: this.characterDelay,
            callback: () => {
                this.dialogueTextObj.setText(this.dialogueTextObj.text + this.currText[this.currCharIndex]);
                this.currCharIndex++;

                // stop event if text finished
                if (this.currCharIndex === this.currText.length) {
                    this.isTyping = false;
                    this.typingEvent.destroy(); // Stop the typing event
                }
            },
            callbackScope: this,
            loop: true
        });
    }
      
    skipText() {
        if (this.isTyping) {
            this.dialogueTextObj.setText(this.currText); // Set the full text instantly if skipped
            this.currCharIndex = 0;
            this.isTyping = false;
            this.skipTextActive = false;
            this.typingEvent.destroy(); // Stop the typing event
        }
    }

// -- [[ CHARACTER PROFILE ]] ----------------------------------------------------

    randomSwitchProfileFrame(image, spritesheet, minFrame, maxFrame) {
        const texture = this.scene.textures.get(spritesheet);
        const frameNames = texture.getFrameNames();
        
        this.scene.time.addEvent({
          delay: Phaser.Math.Between(100, 300), // random frame duration
          callback: () => {

            // choose the first frame 80% of the time
            const randomValue = Math.random();
            const selectedFrame = randomValue <= 0.9 ? minFrame : Phaser.Math.Between(minFrame, maxFrame);
            image.setFrame(frameNames[selectedFrame]);
          },
          callbackScope: this,
          loop: true
        });
    }
}

class Dialogue {
    constructor(scene, textList) {
      this.scene = scene;
      this.textList = textList;
      this.currentLineIndex = 0;
      this.dialogueManager = new DialogueManager(scene); // Create an instance of the Dialogue class
    }

    start(){
        this.dialogueManager.show();
        this.nextLine();

        this.scene.input.keyboard.on('keydown-SPACE', () => {
            this.nextLine();
        });
    }
  
    nextLine() {
        // if no more lines, return
        if (this.currentLineIndex >= this.textList.length) {
            this.dialogueManager.hide();
            console.log("DIALOGUE :: << END OF DIALOGUE >>");
            return;
        }

        // if manager is typing, stop
        if (this.dialogueManager.isTyping){
            this.dialogueManager.skipText();
            console.log("DIALOGUE :: skip line");
            return;
        }

        const currentText = this.textList[this.currentLineIndex];
        this.dialogueManager.typeText(currentText, 0xffffff); // Start typing the text    
        console.log("DIALOGUE :: NEW LINE INDEX >> " + this.currentLineIndex);

        this.currentLineIndex++;

    }
  }
  
  
  