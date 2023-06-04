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
        this.camera1 = this.cameras.add(0, 0, screenWidth / 3, screenHeight/3);
        this.camera1.startFollow(this.p1);
        this.camera1.setZoom(1);
        this.camera1.setAlpha(0);
        this.camera1.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Create camera for player 2
        this.camera2 = this.cameras.add(screenWidth / 2, 0, screenWidth / 3, screenHeight/3);
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

    update() {

        this.gizmos.clear();

        if (this.editorMode) {
            this.updateEditorMode();
        } 
        else {

            const distance = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.p2.x, this.p2.y, {x: 0, y: 0});
            const thresholdDistance = 100;
            const targetAlpha = distance > thresholdDistance ? 1 : 0;
            const inverseTargetAlpha = distance < thresholdDistance ? 1 : 0;
            const lerpAmount = 0.5; 
            const isP1OnLeft = this.p1.x < this.p2.x;


            this.playerMidpoint = this.gizmos.calculateMidpoint({x: this.p1.x, y: this.p1.y}, {x: this.p2.x, y: this.p2.y});
            this.mainCameraTarget.setPosition( this.playerMidpoint.x,  this.playerMidpoint.y);

            // << FORCE PLAYERS TO STAY IN BOUNDS >>

            // Draw a rectangle representing the camera bounds
            const cameraWidth = this.cameras.main.width - 50;
            const cameraHeight = this.cameras.main.height - 50;
            const cameraX = this.playerMidpoint.x - cameraWidth / 2;
            const cameraY = this.playerMidpoint.y - cameraHeight / 2;

            const collisionRect = new Phaser.Geom.Rectangle(cameraX, cameraY, cameraWidth, cameraHeight);
            this.gizmos.drawExistingRect(collisionRect, collisionRect.x, collisionRect.y);

            const boundsResetVelocity = 15;
            function applyBoundsResetVelocity(player) {
                const outOfBounds = !Phaser.Geom.Rectangle.Contains(collisionRect, player.x, player.y);
                if (outOfBounds && !player.disable) {
                  player.disable = true;
              
                  // Calculate the vector from player position to the center of the collision rectangle
                  const direction = new Phaser.Math.Vector2(
                    new Phaser.Math.Vector2(
                      collisionRect.centerX - player.x,
                      collisionRect.centerY - player.y
                    )
                  );
              
                  direction.normalize();

                  const velocityX = direction.x * boundsResetVelocity;
                  const velocityY = direction.y * boundsResetVelocity;
                  player.body.setVelocity(velocityX, velocityY);
              
                  this.scene.time.delayedCall(200, () => {
                    player.disable = false;
                  });
                }
              }
              
            applyBoundsResetVelocity.call(this, this.p1);
            applyBoundsResetVelocity.call(this, this.p2);
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
