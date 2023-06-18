class LevelRoutine {
  constructor(scene) {
    this.prefix = '|| LEVEL ROUTINE >> ';
    this.scene = scene;
    console.log(this.prefix + "New Scene", this.scene);

    this.objectiveIds = [];
    this.startDelays = [];
    this.characterIds = [];
    this.consoleTexts = [];

    // Load and parse the JSON file
    this.endOfRoutine = false;
  }

  loadJSON(key, path) {
    console.log(this.prefix +  this.jsonFile);

    this.jsonKey = key;
    this.jsonFile = path;


    this.scene.load.json(key,  path);
    this.start();
  }

  start() {
    this.scene.load.start();
    this.scene.load.once('complete', () => {
      this.p1 = this.scene.p1;
      this.p2 = this.scene.p2;
      this.cats = this.scene.cats;
      
      const data = this.scene.cache.json.get(this.jsonKey);

      // Extract wait periods and console texts from the JSON data
      for (const entry of data) {
        this.startDelays.push(entry.delay);
        this.characterIds.push(entry.character_id);
        this.objectiveIds.push(entry.objective_id);
        this.consoleTexts.push(entry.text);
      }
      this.runRoutine();

    });
  }
  
  runRoutine() {

    let currentIndex = 0;

    console.log("Routine running");
    const stateMachine = () => {
      if (currentIndex >= this.consoleTexts.length) {
        this.endOfRoutine = true;
        return;
      }

      const startDelay = this.startDelays[currentIndex];
      const characterId = this.characterIds[currentIndex];
      const consoleText = this.consoleTexts[currentIndex];
      const objectiveId = this.objectiveIds[currentIndex];

      console.log("curr objectiveId: " + objectiveId);
      console.log(" count : " + this.scene.getObjectiveCount(objectiveId));

      // Check if should wait for objective to be completed
      if (this.scene.getObjectiveCount(objectiveId) > 0) {

          //console.log(this.prefix + "currObjective " + objectiveId + " // Count: " + this.scene.getObjectiveCount(objectiveId));
          // Delay the state machine for 1 second before checking again
          this.scene.time.delayedCall(1000, stateMachine);
          return;
      }

      // State: Create dialogue
      const createDialogue = () => {
        this.dialogue = new Dialogue(this.uiScene, characterId, consoleText);
        console.log("New dialogue: " + consoleText + " (delay : " + startDelay + ")");

        // Transition to the next state after a delay
        this.uiScene.time.delayedCall(startDelay * 1000, startDialogue);
      };

      // State: Start dialogue
      const startDialogue = () => {
        this.dialogue.start();
        this.playerFreeze(true); // freeze player if needed

        this.dialogue.onComplete(() => {
          // Destroy dialogue and transition to the next state
          this.dialogue.destroy();
          this.dialogue = null;
          //console.log("Dialogue complete: " + consoleText);
          currentIndex++;

          this.playerFreeze(false);

          stateMachine();
        });
      };

      // Initial state
      createDialogue();
    };

    stateMachine();
  }

  // Method to freeze/unfreeze player
  playerFreeze(freeze) {
    if (!this.scene.p1.freezeOverride)
    {
      this.scene.p1.enableMove = !freeze;
    }
    
    if (!this.scene.p2.freezeOverride)
    {
      this.scene.p2.enableMove = !freeze;
    }
  }
}
  