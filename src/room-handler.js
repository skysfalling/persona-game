class Room {
    constructor(name, x, y, width, height) {
      this.name = name;
      this.pos = new Phaser.Math.Vector2(x, y);
      this.center = new Phaser.Math.Vector2(x + width / 2, y + height / 2);
      this.roomRect = null;
    }
  }
  
class RoomHandler {
    constructor(scene, roomLayerName) {
        this.scene = scene;
        this.roomLayerName = roomLayerName;
        this.rooms = [];
        this.textMarkers = [];

        this.gizmos = new Gizmos(scene);
        this.gizmos.enabled = false;
    }

    loadRooms() {
        const roomLayer = this.scene.map.getObjectLayer(this.roomLayerName);
        if (!roomLayer) {
        console.warn(`Object layer '${this.roomLayerName}' not found in the tilemap.`);
        return;
        }

        roomLayer.objects.forEach((room) => {
            console.log('Loaded room:', room.name);
            const roomObj = new Room(room.name, room.x, room.y, room.width, room.height);
            roomObj.roomRect = new Phaser.Geom.Rectangle(room.x, room.y, room.width, room.height);
            this.rooms.push(roomObj);

            const textMarker = this.gizmos.createText(roomObj.center.x, roomObj.center.y, roomObj.name,  '#ffffff', 20);
            this.textMarkers.push(textMarker);
            
            this.gizmos.createRect(room.x, room.y, room.width, room.height, 0xffffff, 1, 1, {x: 0, y: 0} );
        });

        console.log(this.rooms);
    }

    isPlayerInRoom(player) {
        const playerX = player.x;
        const playerY = player.y;

        for (const room of this.rooms) {

            if (Phaser.Geom.Rectangle.Contains(room.roomRect, playerX, playerY)) {
                return true;
            }
        }

        return false;
    }

    getCurrentRoom(player) {
        for (const room of this.rooms) {
        if (this.isPlayerInRoom(player, room)) {
            return room;
        }
        }
        return null;
    }
}
  