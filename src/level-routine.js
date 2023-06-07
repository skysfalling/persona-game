class LevelRoutine {
  constructor(scene, jsonFile) {

      this.scene = scene;

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
}
  