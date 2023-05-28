class Gizmos {
    constructor(scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(depthLayers.gizmos);
        this.visible = true;

        this.scene.events.on('update', this.update, this);
    }

    update(){
        if (gizmosActive)
        {
            this.visible = true;
        }
        else if (!gizmosActive){
            this.visible = false;
            this.clear();
        }
    }
  
    clear(){
        this.graphics.clear();
    }

    // [[ LINE ]]
    drawLine (startpoint, endpoint, color = 0xffffff, lineWidth = 2, opacity = 1) {
        if (!this.visible) {return;}
        this.graphics.lineStyle(lineWidth, color);
        this.graphics.beginPath();
        this.graphics.moveTo(startpoint.x, startpoint.y);
        this.graphics.lineTo(endpoint.x, endpoint.y);
        this.graphics.closePath();
        this.graphics.strokePath();
        this.graphics.setAlpha(opacity);
    }

    //#region  [[ CIRCLE ]]
    drawCircle(x, y, radius, color = 0xffffff, rotation = 0, lineWidth = 2) {
        if (!this.visible) {return;}

        // draw circle
        let circleConfig = new Phaser.Geom.Circle(x, y, radius);
        this.graphics.lineStyle(lineWidth, color, lineWidth);
        this.graphics.strokeCircleShape(circleConfig);

        // draw radius line
        let center = { x: x, y: y };
        let radiusPoint = { x: x + radius, y: y };

        const radians = Phaser.Math.DegToRad(rotation);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        
        radiusPoint.x = x + radius * cos;
        radiusPoint.y = y + radius * sin;
        this.drawLine(center, radiusPoint, color, lineWidth);
    }

    drawCircleFill(x, y, radius, color) {
        if (!this.visible) {return;}
        this.graphics.fillStyle(color);
        this.graphics.fillCircle(x, y, radius);
    }
    //#endregion

    //#region  [[ RECT ]]
    createRect(x, y, width, height, color = 0xffffff, lineWidth = 5, opacity = 1, origin = {x: 0.5, y: 0.5}) {
        if (!this.visible) {opacity = 0;}
        this.graphics.lineStyle(lineWidth, color, 1);
        this.graphics.setAlpha(opacity);

        // Calculate the position based on the origin
        const rectX = x - width * origin.x;
        const rectY = y - height * origin.y;

        const rect = new Phaser.Geom.Rectangle(rectX, rectY, width, height);
        this.graphics.strokeRectShape(rect);
        
        return rect;
    }

    drawExistingRect(rect, color = 0xffffff, lineWidth = 5, opacity = 1, origin = {x: 0.5, y: 0.5}) {
        if (!this.visible) {return;}
        this.graphics.lineStyle(lineWidth, color, opacity);
        this.graphics.setAlpha(opacity);

        this.graphics.strokeRectShape(rect);
        return rect;
    }

    createRectFill(x, y, width, height, color = 0xffffff, lineWidth = 2, opacity = 1, origin = {x: 0.5, y: 0.5}) {
        if (!this.visible) {opacity = 0;}
        this.graphics.fillStyle(color, opacity);
        this.graphics.lineStyle(lineWidth, color, opacity);

        // Calculate the position based on the origin
        const rectX = x - width * origin.x;
        const rectY = y - height * origin.y;

        const rect = new Phaser.Geom.Rectangle(rectX, rectY, width, height);
        this.graphics.strokeRectShape(rect);
        this.graphics.fillRectShape(rect);

        return rect;
    }

    drawExistingRectFill(rect, color = 0xffffff, lineWidth = 2, opacity = 0.5) {
        if (!this.visible) {return;}
        this.graphics.fillStyle(color, opacity);
        this.graphics.lineStyle(lineWidth, color);
        this.graphics.setAlpha(opacity);

        this.graphics.strokeRectShape(rect);
        this.graphics.fillRectShape(rect);

        return rect;
    }
    //#endregion

    //#region  [[ LINE RANGE ]] : line from start - end ,  colored lines show height
    createLineRange(startpoint, endpoint, widthRange = 50, outerColor = 0xff0000, innerColor = 0xffffff) {
        if (!this.visible) {
            return;
        }
    
        let startX = startpoint.x;
        let startY = startpoint.y;
        let endX = endpoint.x;
        let endY = endpoint.y;

        // Calculate the angle of the main line
        const dx = endX - startX;
        const dy = endY - startY;
        const angle = Math.atan2(dy, dx);
    
        // Calculate the offset for the width lines
        const offset = {
            x: (widthRange / 2) * Math.sin(angle),
            y: (widthRange / 2) * Math.cos(angle)
        };
    
        // Draw the main line
        this.drawLine({ x: startX, y: startY }, { x: endX, y: endY }, innerColor, 1);
    
        // Draw the width lines
        this.drawLine({ x: startX + offset.x, y: startY - offset.y }, { x: endX + offset.x, y: endY - offset.y }, outerColor, 1);
        this.drawLine({ x: startX - offset.x, y: startY + offset.y }, { x: endX - offset.x, y: endY + offset.y }, outerColor, 1);
    
        // Calculate the mid point
        const midPoint = {
            x: startX + (endX - startX) / 2,
            y: startY + (endY - startY) / 2
        };
    
        // Draw the mid point crossline
        const midLineStart = {
            x: startX + ((endX - startX) / 2) + (widthRange / 2) * Math.sin(angle),
            y: startY + ((endY - startY) / 2) - (widthRange / 2) * Math.cos(angle)
        };
        const midLineEnd = {
            x: endX - ((endX - startX) / 2) - (widthRange / 2) * Math.sin(angle),
            y: endY - ((endY - startY) / 2) + (widthRange / 2) * Math.cos(angle)
        };
        this.drawLine(midLineStart, midLineEnd, innerColor, 1);
    }
    //#endregion

    //#region [[ TEXT ]]
    // create or update a text object
    createText(x, y, text = "gizmos", color = "#ffffff", fontSize = 20, angle = 0) {        
        if (!this.visible) return;
        
        var textObject = this.scene.add.text(x, y, text);
        textObject.setOrigin(0.5, 0.5);
        textObject.setColor(color);
        textObject.setFont(fontSize);
        textObject.setAngle(angle);
        textObject.setVisible(this.visible);
        this.scene.add.existing(textObject);
        return textObject;
    }

    // create or update a text object
    updateText(textObject, x, y, text = "gizmos", color = "#ffffff", fontSize = 20, angle = 0) 
    {            
        if (!textObject) {console.error("No text object"); return;}
        
        textObject.x = x;
        textObject.y = y;
        textObject.text = text;
        textObject.setColor(color);
        textObject.setAngle(angle);
        textObject.setFont(fontSize);
        textObject.setVisible(this.visible);

    }
    //#endregion

    //#region  [[ HELPER ]]
    // rotate point
    rotatePoint(x, y, cx, cy, angle) {
        const radians = angle * (Math.PI / 180);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
        const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return { x: nx, y: ny };
    }
    //#endregion
}   
