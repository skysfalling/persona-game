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
        this.dialogueTextObj = scene.add.bitmapText(this.origin.x - this.screenMargin, this.origin.y - this.screenMargin*0.6, 'awasete', "default dialog text", this.fontSize);
        this.dialogueTextObj.setScrollFactor(0);
        this.dialogueTextObj.setDepth(globalDepth.ui + 1);
        this.dialogueTextObj.setScale(0.5);
        this.dialogueTextObj.setLineSpacing(30); // Set the desired line spacing value (in pixels)
        this.currCharIndex = 0;
        this.isTyping = false;

        // -- create skip prompt --------------------------------------------------------
        this.skipPromptText = scene.add.bitmapText(this.origin.x, this.origin.y + this.screenMargin*0.9, 'awasete', "<< spacebar to skip >>", 16);
        this.skipPromptText.setScrollFactor(0);
        this.skipPromptText.setDepth(globalDepth.ui + 1);
        this.skipPromptText.setScale(0.5);
        this.skipPromptText.setOrigin(0.5);
        this.skipPromptText.setTint(0x555555);

        // -- create profile image --------------------------------------------------------
        this.currentProfile = "violet";
        this.profile_image = scene.add.sprite(this.left_point.x, this.left_point.y, 'character_profiles');
        this.profile_image.setScale(2);
        this.profile_image.setScrollFactor(0);
        this.profile_image.setOrigin(0.25, 0.5);
        this.profile_image.setDepth(globalDepth.ui + 1);
        this.profile_image.minFrame = 0;
        this.profile_image.maxFrame = 2;

        // grey background
        this.backgroundRect = scene.add.rectangle(this.origin.x, this.origin.y, screen.width - this.screenMargin, 75, 0x000000, 0.8);
        this.backgroundRect.setScrollFactor(0);
        this.backgroundRect.setOrigin(0.5, 0.5);
        this.backgroundRect.setAlpha(0.5);

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

    setColorTheme(textColor, backgroundColor, profileBackgroundColor) {
        this.dialogueTextObj.setTint(textColor.int);
        this.backgroundRect.setFillStyle(backgroundColor.int);
    }

    //#region -- [[ TYPE TEXT ]] --------------------------------------------------------
    typeText(text) {
        this.currText = this.wrapTextString(text, this.characterWrapLimit); // use newlines to wrap text
        this.currCharIndex = 0;
        this.dialogueTextObj.setText(''); // reset dialog text obj
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
    //#endregion

}

class Dialogue {
    constructor(scene, characterID = 0, textList = "I have nothing to say [[ NO TEXT GIVINE ]]") {
        this.scene = scene;
        this.dialogueManager = new DialogueManager(scene);

        // profile texture
        this.characterID = characterID;
        this.characterProfileTexture = this.scene.textures.get('character_profiles');
        this.profileFrames = this.characterProfileTexture.getFrameNames();

        // character profile values ------------------------------------------------------ //
        this.characterName = "none";
        this.minProfileFrame = 0;
        this.maxProfileFrame = 0;
        this.characterColor = global_colors.white;

        // dialog values ---------------------------------------------------- //
        this.textList = textList;
        this.currentLineIndex = 0;

        if (this.characterID == 1) {
            this.characterName = "violet";
            this.minProfileFrame = 0;
            this.maxProfileFrame = 2;
            this.characterColor = global_colors.violet;

            this.dialogueManager.setColorTheme(this.characterColor.light1, global_colors.black, global_colors.black)
        }

        if (this.characterID == 2) {
            this.characterName = "blue";
            this.minProfileFrame = 6;
            this.maxProfileFrame = 8;
            this.characterColor = global_colors.blue;

            this.dialogueManager.setColorTheme(this.characterColor, global_colors.black, global_colors.black)
        }

        this.dialogueManager.profile_image.setFrame(this.profileFrames[this.minProfileFrame]);

    }

    start(){
        this.dialogueManager.show();
        this.nextLine();

        // -- [[ CHARACTER PROFILES ]] --------------------------------------------------------
        this.randomSwitchProfileFrame(this.dialogueManager.profile_image, this.minProfileFrame, this.maxProfileFrame);

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

    
    // -- [[ CHARACTER PROFILE ]] ----------------------------------------------------
    randomSwitchProfileFrame(image, minFrame, maxFrame) {        
        // start random animation loop
        this.scene.time.addEvent({
          delay: Phaser.Math.Between(100, 300), // random frame duration
          callback: () => {
            // choose the first frame 80% of the time
            const randomValue = Math.random();
            const selectedFrame = randomValue <= 0.9 ? minFrame : Phaser.Math.Between(minFrame, maxFrame);
            image.setFrame(this.profileFrames[selectedFrame]);
          },
          callbackScope: this,
          loop: true
        });
    }
}
  
  
  