class CameraMovement {
    constructor(scene) {
        this.scene = scene;
        this.cameras = scene.cameras;
        this.map = scene.map;
        this.p1 = scene.p1;
        this.p2 = scene.p2;

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
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameraTarget = this.scene.add.sprite(this.p1.x, this.p1.y, null).setAlpha(0);
        this.cameras.main.startFollow(this.cameraTarget);
        this.cameras.main.setZoom(1);

        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        // Create camera for player 1
        this.camera1 = this.cameras.add(0, 0, screenWidth / 2, screenHeight);
        this.camera1.startFollow(this.p1);
        this.camera1.setZoom(1);
        this.camera1.setAlpha(0);
        this.camera1.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Create camera for player 2
        this.camera2 = this.cameras.add(screenWidth / 2, 0, screenWidth / 2, screenHeight);
        this.camera2.startFollow(this.p2);
        this.camera2.setZoom(1);
        this.camera2.setAlpha(0);
        this.camera2.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
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

    update(gizmos) {

        if (this.editorMode) {
            this.updateEditorMode();
        } 
        else {
            if (this.p1.x > this.p2.x) { 
                this.camera1.startFollow(this.p1);
                this.camera2.startFollow(this.p2);
            }
    
            const distance = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.p2.x, this.p2.y, {x: 0, y: 0});
            const thresholdDistance = 300;
            const targetAlpha = distance > thresholdDistance ? 1 : 0;
            const lerpAmount = 0.1; 
    
            this.camera1.alpha = Phaser.Math.Linear(this.camera1.alpha, targetAlpha, lerpAmount);
            this.camera2.alpha = Phaser.Math.Linear(this.camera2.alpha, targetAlpha, lerpAmount);
    
            const isP1OnLeft = this.p1.x < this.p2.x;
        
            if (isP1OnLeft) {
                this.camera1.setPosition(0, 0);
                this.camera2.setPosition(this.cameras.main.width / 2, 0);
            } else {
                this.camera1.setPosition(this.cameras.main.width / 2, 0);
                this.camera2.setPosition(0, 0);
            }
    
            const playerMidpoint = gizmos.calculateMidpoint({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y});
            this.cameraTarget.setPosition(playerMidpoint.x, playerMidpoint.y);
            gizmos.drawCircle(this.cameraTarget.x, this.cameraTarget.y, thresholdDistance/2, 0xffffff, 0, 0.5);
        }
    }

    toggleEditorMode() {
        this.editorMode = !this.editorMode;
        console.log(">> Camera Edit Mode : " +this.editorMode);

        // When exiting editor mode, resume following the players
        if (!this.editorMode) {
            this.cameras.main.startFollow(this.cameraTarget);
        } else {
            this.cameras.main.stopFollow();
        }
    }
}
