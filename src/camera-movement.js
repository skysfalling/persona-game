class CameraMovement {
    constructor(scene) {
        this.scene = scene;
        this.physics = scene.physics;
        this.cameras = scene.cameras;
        this.map = scene.map;
        this.currRoom;
        this.p1 = scene.p1;
        this.p2 = scene.p2;

        this.gizmos = new Gizmos(scene);
        this.gizmos.enabled = false;

        this.editorMode = false; // Initialize editor mode as off
        this.cursors = scene.input.keyboard.createCursorKeys(); // Capture cursor keys
        this.zoomKeys = {
            z: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
            x: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)
        };
        this.cameraSpeed = 5; // Set the camera speed
        this.zoomSpeed = 0.02; // Set the zoom speed
    }

    setup() {
        this.cameras.main.setBounds(-Infinity, -Infinity, Infinity, Infinity);
        this.mainCameraTarget = this.scene.add.sprite(this.p1.x, this.p1.y, null).setAlpha(0);
        this.cameras.main.startFollow(this.mainCameraTarget);
        this.cameras.main.setZoom(1);

        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        // Create camera for player 1
        this.camera1 = this.cameras.add(0, 0, screenWidth, screenHeight);
        this.camera1.startFollow(this.p1);
        this.camera1.setZoom(1);
        this.camera1.setAlpha(0);
        //this.camera1.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Create camera for player 2
        this.camera2 = this.cameras.add(0,  0, screenWidth, screenHeight);
        this.camera2.startFollow(this.p2);
        this.camera2.setZoom(1);
        this.camera2.setAlpha(0);
        //this.camera2.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }

    updateEditorMode() {
        if (!this.editorMode) return;

        const { up, down, left, right } = this.cursors;

        // Movement
        if (up.isDown) {
            this.cameras.main.scrollY -= this.cameraSpeed;
        }
        else if (down.isDown) {
            this.cameras.main.scrollY += this.cameraSpeed;
        }

        if (left.isDown) {
            this.cameras.main.scrollX -= this.cameraSpeed;
        }
        else if (right.isDown) {
            this.cameras.main.scrollX += this.cameraSpeed;
        }

        // Zoom
        if (Phaser.Input.Keyboard.JustDown(this.zoomKeys.z)) {
            this.cameras.main.zoom -= this.zoomSpeed;
        }
        else if (Phaser.Input.Keyboard.JustDown(this.zoomKeys.x)) {
            this.cameras.main.zoom += this.zoomSpeed;
        }
    }

    update() {

        this.gizmos.clear();

        if (this.editorMode) {
            this.updateEditorMode();
        } 
        else {

            const playersInSameRoom = this.p1.currRoom === this.p2.currRoom;

            // if in same room
            if (playersInSameRoom) {
                this.playerMidpoint = this.gizmos.calculateMidpoint({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y});
                this.mainCameraTarget.setPosition( this.playerMidpoint.x,  this.playerMidpoint.y);
            }
            else{
                const distance = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.p2.x, this.p2.y, {x: 0, y: 0});
                const thresholdDistance = 350;
                const targetAlpha = distance > thresholdDistance ? 1 : 0;
                const lerpAmount = 0.1; 
        
                this.camera1.alpha = Phaser.Math.Linear(this.camera1.alpha, targetAlpha, lerpAmount);
                this.camera2.alpha = Phaser.Math.Linear(this.camera2.alpha, targetAlpha, lerpAmount);
        
                const isP1OnLeft = this.p1.x < this.p2.x;
                const screenWidth = this.cameras.main.width;
                const screenHeight = this.cameras.main.height;
                
                if (isP1OnLeft) {
                    // Horizontal Split Screen
                    this.camera1.setPosition(0, 0);
                    this.camera2.setPosition(screenWidth / 2, 0);
                  
                    // Follow the players with the cameras
                    this.camera1.startFollow(this.p1, false, 1, 1, 0, 0);
                    this.camera2.startFollow(this.p2, false, 1, 1, 0, -screen.height/4);
                } 
                else {
                // Vertical Split Screen
                this.camera1.setPosition(0, 0);
                this.camera2.setPosition(0, screenHeight / 2);
                
                }
                
                // Follow the players with the cameras
                this.camera1.startFollow(this.p1, false, 1, 1);
                this.camera2.startFollow(this.p2, false, 1, 1);
                
                // Adjust the camera bounds to the full map
                this.camera1.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
                this.camera2.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            }


        }
    }

    toggleEditorMode() {
        this.editorMode = !this.editorMode;
        console.log(">> Camera Edit Mode : " +this.editorMode);

        // When exiting editor mode, resume following the players
        if (!this.editorMode) {

            this.p1.disable = false;
            this.p2.disable = false;

            this.cameras.main.startFollow(this.mainCameraTarget);
        } 
        else {
            this.p1.disable = true;
            this.p2.disable = true;

        }
    }
}
