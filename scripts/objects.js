const ObjMessage = function(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.visible = false;
    this.baseline = "top";
    this.font = "italic bold 50px monospace";
    
    ObjMessage.prototype.setVisibility = function(value) {
        return this.visible = value;
    }
}

const Pad = function(x, y, color, width, height) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.width = width;
    this.widthOriginal = width;
    this.height = height;
    this.visible = true;
    this.padSpeed = 0;
    
    Pad.prototype.move = function(add) {
        return this.x += add;
    }
}

const Ball = function(x, y, color, width, height) {
    this.x = x;
    this.y = y;
    this.nextX = 0;
    this.nextY = 0;
    this.color = color;
    this.width = width;
    this.height = height;
    this.speedX = 4;
    this.speedY = -4;
    this.dmg = 1;
    this.angle = 1;
    this.speedDown = false;
    this.visible = true;
    this.hitable = true;
    
    Ball.prototype.halfWidth = function() {
        return this.width/2;
    }
}

const Block = function(x, y, type) {
    this.x = x;
    this.y = y;
    this.color = "";
    this.width = 100;
    this.height = 25;
    this.type = type;
    this.hp = 1;
    this.visible = true;
    this.point = 10;
    
    if(this.type == "b") {
        this.color = "#DB7093";
    } else if(this.type == "h") {
        this.color = "#855864";
        this.hp = 2;
    } else if(this.type == "e") {
        this.color = "#ffc04c";
    } else if(this.type == "i") {
        this.color = "#999";
    } else if(this.type == "p") {
        this.color = "#009abe";
    }
    
    Block.prototype.setVisible = function(v) {
        this.visible = v;
    }
}

const Pill = function(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 40;
    this.speedX = 0;
    this.speedY = 2;
    this.type = type;
    this.visible = true;
    this.src;
    
    if(this.type=="s") this.src = "images/PilulaS.png";
    if(this.type=="l") this.src = "images/PilulaL.png";
    if(this.type=="c") this.src = "images/PilulaC.png";
    if(this.type=="x") this.src = "images/PilulaX.png";
    if(this.type=="r") this.src = "images/PilulaR.png";
    if(this.type=="m") this.src = "images/PilulaM.png";
    if(this.type=="b") this.src = "images/PilulaB.png";
    
    Pill.prototype.fall = function() {
        if(this.visible) return this.y += this.speedY;
    }
    
    Pill.prototype.setVisible = function(v) {
        this.visible = v;
    }
}