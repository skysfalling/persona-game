class LevelRoutine {
    constructor(scene, jsonFile) {

        this.scene = scene;

        this.waitPeriods = [];
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
          this.consoleTexts.push(entry.text);
        }
  
        this.runRoutine();
      });
    }
  
    runRoutine() {
      let currentIndex = 0;
  
      const updateCallback = () => {
        const waitPeriod = this.waitPeriods[currentIndex];
        const consoleText = this.consoleTexts[currentIndex];
  
        console.log(consoleText); // Print the console text
  
        currentIndex++;
  
        if (currentIndex < this.consoleTexts.length) {
          this.scene.time.delayedCall(waitPeriod * 1000, updateCallback, [], this);
        }
      };
  
      const initialWaitPeriod = this.waitPeriods[0];
      this.scene.time.delayedCall(initialWaitPeriod * 1000, updateCallback, [], this);
    }
  }
  