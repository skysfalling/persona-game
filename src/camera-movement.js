class CameraMovement {
    constructor(scene, p1, p2) {
        this.scene = scene;
        this.physics = scene.physics;
        this.cameras = scene.cameras;
        this.map = scene.map;
        this.currRoom;
        this.p1 = p1;
        this.p2 = p2;

        this.gizmos = new Gizmos(scene);
        this.gizmos.enabled = false;

        this.splitscreen = false;

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
        this.mainCamera = this.cameras.main;
        this.cameras.main.setBounds(-Infinity, -Infinity, Infinity, Infinity);
        this.mainCameraTarget = this.scene.add.sprite(this.p1.x, this.p1.y, null).setAlpha(0);
        this.cameras.main.startFollow(this.mainCameraTarget);
        this.cameras.main.setZoom(1);

        // Create camera for player 1
        this.camera1 = this.cameras.add(0, 0, screen.width, screen.height);
        this.camera1.startFollow(this.p1);
        this.camera1.setZoom(1);
        this.camera1.setAlpha(0);
        //this.camera1.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Create camera for player 2
        this.camera2 = this.cameras.add(0, 0, screen.width, screen.height);
        this.camera2.startFollow(this.p2);
        this.camera2.setZoom(1);
        this.camera2.setAlpha(0);
        //this.camera2.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.violetEchoOverlayRect = this.scene.add.graphics();
        this.violetEchoOverlayRect.fillStyle(global_colors.violet.int, 0.35); // Set the fill color and default alpha
        this.violetEchoOverlayRect.fillRect(0, 0, screen.width, screen.height);
        this.violetEchoOverlayRect.setScrollFactor(0);
        this.violetEchoOverlayRect.setDepth(globalDepth.playerEffects);
        this.violetEchoOverlayRect.setAlpha(0);

        this.blueEchoOverlayRect = this.scene.add.graphics();
        this.blueEchoOverlayRect.fillStyle(global_colors.blue.int, 0.35); // Set the fill color and default alpha
        this.blueEchoOverlayRect.fillRect(0, 0, screen.width, screen.height);
        this.blueEchoOverlayRect.setScrollFactor(0);
        this.blueEchoOverlayRect.setDepth(globalDepth.playerEffects);
        this.blueEchoOverlayRect.setAlpha(0);

        //this.mainCamera.ignore([this.violetEchoOverlayRect, this.blueEchoOverlayRect]);
        this.camera1.ignore([this.blueEchoOverlayRect]);
        this.camera2.ignore([this.violetEchoOverlayRect]);

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

            const playersInSameRoom = this.p1.currRoom.name === this.p2.currRoom.name;
            //console.log("Players in room " + playersInSameRoom);

            if (this.dualPlayerMovement === false)
            {
                //console.log("single player movement");
                const lerpAmount = 0.1;
                this.mainCameraTarget.x = Phaser.Math.Linear(this.mainCameraTarget.x, this.p1.x, lerpAmount);
                this.mainCameraTarget.y = Phaser.Math.Linear(this.mainCameraTarget.y, this.p1.y, lerpAmount);
                this.mainCamera.setAlpha(1);

                let violetEchoAlphaTarget = 0;
                let blueEchoAlphaTarget = 0;
                const alphaLerpAmount = 0.1;
                
                if (this.p1.echoActive)
                {
                    violetEchoAlphaTarget = 1;
                    blueEchoAlphaTarget = 0;
                    this.blueEchoOverlayRect.setAlpha(0);
                }
                this.violetEchoOverlayRect.alpha = Phaser.Math.Linear(this.violetEchoOverlayRect.alpha, violetEchoAlphaTarget, alphaLerpAmount);
                this.blueEchoOverlayRect.alpha = Phaser.Math.Linear(this.blueEchoOverlayRect.alpha, blueEchoAlphaTarget, alphaLerpAmount);

            }
            else 
            {
                const distance = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.p2.x, this.p2.y, {x: 0, y: 0});
                const thresholdDistance = 150;
                const targetAlpha = (distance > thresholdDistance) && !playersInSameRoom ? 1 : 0;
                const targetAlpha_inverse = (distance > thresholdDistance) && !playersInSameRoom ? 0 : 1;
                const lerpAmount = 0.1; 
        
                this.mainCamera.alpha = Phaser.Math.Linear(this.mainCamera.alpha, targetAlpha_inverse, lerpAmount);

                this.camera1.alpha = Phaser.Math.Linear(this.camera1.alpha, targetAlpha, lerpAmount);
                this.violetEchoOverlayRect.alpha = Phaser.Math.Linear(this.violetEchoOverlayRect.alpha, targetAlpha, lerpAmount);


                this.camera2.alpha = Phaser.Math.Linear(this.camera2.alpha, targetAlpha, lerpAmount);
                this.blueEchoOverlayRect.alpha = Phaser.Math.Linear(this.blueEchoOverlayRect.alpha, targetAlpha, lerpAmount);

                this.p1.echoActive = this.splitscreen;
                this.p2.echoActive = this.splitscreen;

                // << NORMAL VIEW >>
                if (playersInSameRoom) {
                    this.splitscreen = false;
                    
                    this.playerMidpoint = this.gizmos.calculateMidpoint({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y});
                    this.mainCameraTarget.setPosition( this.playerMidpoint.x,  this.playerMidpoint.y);
                }
                // << SPLITSCREEN VIEW >>
                else {
                    this.splitscreen = true;
                    let screenhalf = screen.width/2;
    
                    // Vertical Split Screen
                    this.camera1.setPosition(0, 0);
                    this.camera2.setPosition(screenhalf, 0);
                    
                    this.camera1.width = screenhalf;
                    this.camera1.height = screen.height;
    
                    this.camera2.width = screenhalf;
                    this.camera2.height = screen.height;
    
                    // Follow the players with the cameras
                    this.camera1.startFollow(this.p1, false, 1, 1, 0, 0);
                    this.camera2.startFollow(this.p2, false, 1, 1, 0, 0);
                    
                    // Adjust the camera bounds to the full map + screen size offset
                    this.camera1.setBounds(-screen.width, -screen.height, this.map.widthInPixels + screen.width , this.map.heightInPixels + screen.height);
                    this.camera2.setBounds(-screen.width, -screen.height, this.map.widthInPixels + screen.width, this.map.heightInPixels + screen.height);
                }

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
