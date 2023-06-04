class CollisionHandler {
    constructor(scene) {
        this.scene = scene;
    }

    collideWithCollisionLayer(player, collisionLayer) {
        collisionLayer.setCollisionBetween(0, 1000);
        this.scene.physics.add.collider(player, collisionLayer);
    }

    playerOverlap(player1, player2) {
        this.scene.physics.add.overlap(player1, player2, () => {
            player1.x = Math.floor(player1.x);
            player1.y = Math.floor(player1.y);
            const angle = Phaser.Math.Angle.Between(player1.x, player1.y, player2.x, player2.y);
            this.scene.physics.velocityFromRotation(-angle, 500, player1.velocity);
        });
    }

    mainObjectCollision(playerObjs, interactObjects) {
        this.scene.physics.add.collider(playerObjs, interactObjects, (player, obj) => {
            if (player.disable) {return;}

            player.disable = true;

            this.scene.time.delayedCall(200, () => {
                player.disable = false;
            }, [], this.scene);

            const interaction_direction = player.getDirectionOfObj(obj);
            console.log(player.name + " " + interaction_direction);

            this.handleInteraction(player, obj, interaction_direction);
        });
    }

    handleInteraction(player, obj, direction) {
        const velocity = 50;
        const positionOffset = obj.width;
        let playerVelocity = 10;

        if (direction == "left") {
            player.setPosition(obj.x + positionOffset, player.y);
            player.setVelocity(playerVelocity, 0);
            obj.setVelocity(-velocity, 0);
        }
        else if (direction == "right") {
            player.setPosition(obj.x - positionOffset, player.y);
            player.setVelocity(-playerVelocity, 0);
            obj.setVelocity(velocity, 0);
        }
        else if (direction == "up") {
            player.setPosition(player.x, obj.y + obj.height);
            player.setVelocity(0, playerVelocity);
            obj.setVelocity(0, -velocity);
        }
        else if (direction == "down") {
            player.setPosition(player.x, obj.y - obj.height);
            player.setVelocity(0, -playerVelocity);
            obj.setVelocity(0, velocity);
        }
    }

    overlapWithTrigger(interactObjects, overlapTrigger, overlapCallback) {
        this.scene.physics.add.overlap(interactObjects, overlapTrigger, overlapCallback);
    }
}
