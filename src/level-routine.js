class LevelRoutine {
  constructor(scene, jsonFile) {

      this.scene = scene;
      this.p1 = scene.p1; 
      this.p2 = scene.p2; 

      this.playerFreezeStates = [];
      this.waitForObjectiveComplete = [];
      this.waitPeriods = [];
      this.characterIds = [];
      this.consoleTexts = [];
  
      // Load and parse the JSON file
      this.loadJSON(jsonFile);
  }

  loadJSON(jsonFile) {
    this.scene.load.json('levelData', jsonFile);
  }

  start() {
    this.scene.load.start();

    this.scene.load.once('complete', () => {
      const data = this.scene.cache.json.get('levelData');

      // Extract wait periods and console texts from the JSON data
      for (const entry of data) {
        this.waitPeriods.push(entry.wait);
        this.characterIds.push(entry.id);
        this.consoleTexts.push(entry.text);

        // Only update freezePlayer or objectiveCompleted if they are explicitly defined
        if (entry.hasOwnProperty('freezePlayer')) {
            this.playerFreezeStates.push(entry.freezePlayer);
        } else {
            const prevValue = this.playerFreezeStates.length > 0 ? this.playerFreezeStates[this.playerFreezeStates.length - 1] : false;
            this.playerFreezeStates.push(prevValue);
        }
      }

      this.runRoutine();
    });
  }
  
  runRoutine() {
    let currentIndex = 0;

    const stateMachine = () => {
      if (currentIndex >= this.consoleTexts.length) {
        // End of routine
        return;
      }

      const waitPeriod = this.waitPeriods[currentIndex];
      const characterId = this.characterIds[currentIndex];
      const consoleText = this.consoleTexts[currentIndex];
      const freezePlayer = this.playerFreezeStates[currentIndex];
      const shouldWait = this.waitForObjectiveComplete[currentIndex];

      // Toggle freeze state of player
      this.togglePlayerFreeze(freezePlayer);

      // Check if should wait for objective to be completed
      if (shouldWait && !this.objectiveCompleted) {
          // Delay the state machine for 1 second before checking again
          this.scene.time.delayedCall(1000, stateMachine);
          return;
      }

      // State: Create dialogue
      const createDialogue = () => {
        this.dialogue = new Dialogue(this.scene, characterId, consoleText);
        this.dialogue.start();
        console.log("New dialogue: " + consoleText);

        // Transition to the next state after a delay
        this.scene.time.delayedCall(waitPeriod * 1000, startDialogue);
      };

      // State: Start dialogue
      const startDialogue = () => {
        this.dialogue.onComplete(() => {
          // Destroy dialogue and transition to the next state
          this.dialogue.destroy();
          this.dialogue = null;
          console.log("Dialogue complete: " + consoleText);
          currentIndex++;
          stateMachine();
        });
      };

      // Initial state
      createDialogue();
    };

    stateMachine();
  }

  // Method to freeze/unfreeze player
  togglePlayerFreeze(freeze) {
    this.scene.p1.enableMove = !freeze;
    this.scene.p2.enableMove = !freeze;
  }

  setObjectiveCompleted(value) {
    this.objectiveCompleted = value;
  }
}
  