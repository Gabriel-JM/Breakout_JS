//                           BRICKS TYPE LIST
// b = Normal bricks    i = indestructable bricks   p = powerup brickss
// | = Line break       h = hardened bricks
// - = Empty space      e = exploding bricks    
(function(){
    //Getting elements
    let score = document.getElementById('numbers');
    const cnv = document.querySelector("canvas");
	const ctx = cnv.getContext("2d");
    
    //Instance of the paddle and ball
    const pad = new Pad((cnv.width/2)-70, 610, "#ecc", 140, 20);
    const ball = new Ball(pad.x + Math.floor(pad.width/2) - 10, pad.y - 20, "#eee", 20, 20);
    const ballImg = new Image();
    ballImg.src = "images/bolinha.png";
    
    //Loading Pills Imagens
    const pillImg = new Image();
    let pillTypes = ["s","l","c","x","r","m","b"];
    
    //Variables for gaming control
    let scorePoint = 0;
    let sticky = true;
    let posXSticky = Math.floor(pad.width/2) - ball.halfWidth();
    let chain = 1;
    let pointMultiplier = 1;
    let atualPower = "";
    let powerClock = 0;
    let lives = 3;
    let lives_p = document.getElementById('lives');
    lives_p.innerHTML = lives;
    const level_p = document.getElementById('level-title');
    
    //Variables for levels
    let levelNum = 0;
    let levels = ["i2b5i2|1p1b3i1b3p1|1b9","b1","b1"]; // Levels Design encoded
    let lvl = levels[levelNum];
    
    //Moviment Keys
	let LEFT = 37, RIGHT = 39, ENTER = 13;
	let mvLeft = mvRight = false;
    
    //Block collision checkers
    let hitUpDown = hitLeftRight = false;
    
    //Game States
    let START = 0, GAMING = 1, PAUSE = 2, OVER = 3, NEXTLEVEL = 4;
    let gameState = START;
    
    //Audios
    const padHit = new Audio("sound/Hit_01.mp3");
    padHit.volume = 0.4;
    const wallHit = new Audio("sound/wall_hit.mp3");
    wallHit.volume = 0.6;
    const loseBall = new Audio("sound/loseBall.mp3");
    loseBall.volume = 0.4;
    const blockHit = new Audio("sound/blockHit.wav");
    const indesHit = new Audio("sound/indestrucHit.wav");
    indesHit.volume = 0.6;
    const winSong = new Audio("sound/Jingle_Win.wav");
    const loseSong = new Audio("sound/Jingle_Lose_00.mp3");
    loseSong.volume = 0.3;
    const pickPowerUp = new Audio("sound/pickPowerUp.mp3");
    pickPowerUp.volume = 0.4;
    const pauseSong = new Audio("sound/pause.mp3");
    pauseSong.volume = 0.5;
    const despauseSong = new Audio("sound/despause.mp3");
    despauseSong.volume = 0.5;
    
    //Messages
    let messages = [];
    const pauseMessage = new ObjMessage((cnv.width-150)/2, (cnv.height-40)/2, "PAUSE", "#ddd");
        messages.push(pauseMessage);
    const startMessage = new ObjMessage((cnv.width-530)/2, (cnv.height-60)/2, "Press ENTER to Start", "#6d6");
        startMessage.setVisibility(true);
        messages.push(startMessage);
    const overMessage = new ObjMessage((cnv.width-250)/2, (cnv.height-80)/2, "GAME OVER", "#d66");
        messages.push(overMessage);
    const winMessage = new ObjMessage((cnv.width-250)/2, (cnv.height-80)/2, "You WIN!!!", "#6d6");
        messages.push(winMessage);
    const scoreMessage = new ObjMessage((cnv.width-260)/2,(cnv.height+20)/2, "", "#ddd");
        scoreMessage.font = "normal bold 30px monospace";
        messages.push(scoreMessage);
    const chainMessage = new ObjMessage(8, 5, "Chain: " + chain, "rgba(240, 240, 240, 0.5)");
        chainMessage.font = "italic bold 20px monospace";
        messages.push(chainMessage);
    
    //Array of blocks
    let blocks = [];
    
    //Array of pills
    let pills = [];

    //Key pressed event
	window.addEventListener("keydown", function(e){
		var key = e.keyCode;
		switch(key) {
			case LEFT:
				mvLeft = true;
                mvRight = false;
                if(sticky) ball.speedX = -4;
			break;
			case RIGHT:
				mvRight = true;
                mvLeft = false;
                if(sticky) ball.speedX = 4;
			break;
        }
	});

    //Key released event
	window.addEventListener("keyup", function(e) {
		var key = e.keyCode;
		switch(key) {
			case LEFT:
				mvLeft = false;
			break;
			case RIGHT:
				mvRight = false;
			break;
            case ENTER:
                //Game's State switch
                if(gameState == START) {
                    startMessage.setVisibility(false);
                    level_p.innerHTML = "Level " + (levelNum+1);
                    gameState = GAMING;
                } else if(gameState == GAMING) {
                    if(sticky) {
                        sticky = false;
                    } else {
                        gameState = PAUSE;
                        pauseMessage.setVisibility(true);
                        pauseSong.play();
                    }
                } else if(gameState == NEXTLEVEL) {
                    winSong.pause();
                    winSong.currentTime = 0;
                    winMessage.setVisibility(false);
                    scoreMessage.setVisibility(false);
                    nextLevel();
                } else if(gameState == OVER) {
                    loseSong.pause();
                    loseSong.currentTime = 0;
                    overMessage.setVisibility(false);
                    scoreMessage.setVisibility(false);
                    chainMessage.setVisibility(false);
                    if(winMessage.visible) {
                        winMessage.setVisibility(false);
                        scoreMessage.setVisibility(false);
                        winSong.pause();
                        winSong.currentTime = 0;
                    }
                    reStart();
                } else {
                    gameState = GAMING;
                    pauseMessage.setVisibility(false);
                    despauseSong.play();
                }
		}
	});
    
    buildBlocks();
    
    //Game restart function (without reload the page)
    function reStart() {
        pills = [];
        blocks = [];
        pointMultiplier = 1;
        chain = 1;
        chainMessage.text = "Chain: " + chain;
        lives = 3;
        lives_p.innerHTML = lives;
        level_p.innerHTML = "Level " + (levelNum+1);
        pad.width = pad.widthOriginal;
        atualPower = -1;
        powerClock = 0;
        
        sticky = true;
        posXSticky = Math.floor(pad.width/2) - ball.halfWidth();
        pad.x = (cnv.width/2)-70;
        
        ball.x = pad.x + Math.floor(pad.width/2);
        ball.y = pad.y - ball.height;
        ball.speedX = 4;
        ball.speedY = -4;
        ball.angle = 1;
        
        buildBlocks();
        
        scorePoint = 0;
        score.innerHTML = scorePoint;
        gameState = GAMING;
    }
    
    //Jumps to the next stage of the game
    function nextLevel() {
        if(levels[levelNum] != undefined) { lvl = levels[levelNum]; }
        level_p.innerHTML = "Level " + (levelNum+1);
        blocks = [];
        pills = [];
        pointMultiplier = 1;
        chain = 1;
        chainMessage.text = "Chain: " + chain;
        atualPower = -1;
        powerClock = 0;
        
        sticky = true;
        posXSticky = Math.floor(pad.width/2) - ball.halfWidth();
        pad.x = (cnv.width/2)-70;
        
        ball.x = pad.x + Math.floor(pad.width/2);
        ball.y = pad.y - ball.height;
        ball.speedX = 4;
        ball.speedY = -4;
        ball.angle = 1;
        
        buildBlocks();
        
        gameState = GAMING;
    }
    
    //Update Lives score
    function updateLives(n) {
        lives += n;
        lives_p.innerHTML = lives;
    }
    
    //Blocks creation
    function buildBlocks() {
        let x = 10, y = 30;
        for(let i=0; i<lvl.length; i+=2) {
            let letter = lvl.charAt(i);
            let rptNum = lvl.charAt(i+1); //rptNum means repetition number
            for(let j=0; j < rptNum; j++) {
                if(letter == "-") {
                    x += 110;
                } else if(letter == "|") {
                    y += 35;
                    x = 10;
                } else {
                    let blk = new Block(x, y, letter); //blk is the abbreviation of block
                    blocks.push(blk);
                    x += 110;
                }
            }
        }
    }
    
    //Set the angle of the ball
    function setAngle(angle) {
        ball.angle = angle
        
        if(angle === 2) {
            ball.speedX = 3 * Math.sign(ball.speedX); 
            ball.speedY = 4.5 * Math.sign(ball.speedY);
        } else if(angle === 0) {
            ball.speedX = 4.5 * Math.sign(ball.speedX); 
            ball.speedY = 3 * Math.sign(ball.speedY);
        } else {
            ball.speedX = 4 * Math.sign(ball.speedX); 
            ball.speedY = 4 * Math.sign(ball.speedY);
        }
    }
    
    //Wall hitted
    function wallHitted() {
        wallHit.currentTime = 0;
        wallHit.play();
        if(!ball.hitable) { ball.hitable = true; }
    }
    
    //Collision of the ball with the pad
    function padCollision() {
        //Check if the ball can be hitted (Prevent a bug, which the ball become imprisoned in the paddle)
        if(ball.hitable) {
            //Collision of the ball with left and right sides of the pad
            if(leftRightCollision(ball, pad)) {
                chain = 1;
                ball.hitable = false;
                ball.speedX *= -1;
                padHit.play();
            }

            //Collision of the ball with the top and bottom sides of the pad
            if(upDownCollision(ball, pad)) {
                if(atualPower=="c") {
                    sticky = true;
                } else {
                    chain = 1;
                    chainMessage.text = "Chain: " + chain;
                    ball.hitable = false;
                    ball.speedY *= -1;
                    padHit.play();

                    //Change Angle
                    if(Math.abs(pad.padSpeed) > 4) {
                        if(Math.sign(pad.padSpeed) === Math.sign(ball.speedX)) {
                            setAngle(Math.max(0, Math.min(ball.angle-1, 2)));
                        } else {
                            setAngle(Math.max(0, Math.min(ball.angle+1, 2)));
                        }
                    }
                }
            }
        }
    }
    
    //Check which is the type pf the block
    function checkBlockType(block) {
        if(block.type != "i") {
            destroyBlock(block, true);
            if(block.type == "e") {
                checkExplosions(block);
            } else if(block.type == "p") {
                spawnPill(block.x, block.y, "m"/*pillTypes[Math.floor(Math.random() * pillTypes.length)]*/);
            }
            return (atualPower == "m")? false : true;
        } else if(block.type == "i") {
            indesHit.currentTime = 0;
            indesHit.play();
            return true;
        }
    }
    
    //Checking explosions of the brick
    function checkExplosions(expB) {
        let e = expB;
        for(let i=0; i<blocks.length; i++) {
            let b = blocks[i];
            if(b.type != "e" && b.type != "i"
               && ((e.x - 111 < b.x) && (e.x + e.width + 11 > b.x)) && (e.y - b.y < e.height+11 && e.y - b.y > (e.height+11)*-1)) {
                destroyBlock(b, false);
            }
        }
    }
    
    //Create a type of a pill
    function spawnPill(x, y, tp) {
        const pill = new Pill(x, y, tp);
        pills.push(pill);
    }
    
    //Deal with which type of pills was picked up and it does
    function pillEffect(t) {
        atualPower = t;
        switch(atualPower) {
            case "s":
                //Slow down
                powerClock = 900;
                break;
            case "l":
                //Live Up
                updateLives(1);
                powerClock = 0;
                break;
            case "c":
                //catch
                powerClock = 800;
                break;
            case "x":
                //Expand
                pad.width = Math.floor(pad.widthOriginal * 1.5);
                posXSticky = Math.floor(pad.width/2) - ball.halfWidth();
                powerClock = 800;
                break;
            case "r":
                //Reduce
                pointMultiplier = 2;
                pad.width = Math.floor(pad.widthOriginal / 2);
                posXSticky = Math.floor(pad.width/2) - ball.halfWidth();
                powerClock = 800;
                break;
            case "m":
                //Megaball
                powerClock = 800;
                ball.dmg = 2;
                break;
            case "b":
                //MultiBall
                powerClock = 0;
                break;
            default:
                console.log("Erro!!! Tipo incompativel: " + atualPower);
        }
    }
    
    //Reset the effect of the power of the pill
    function resetPower(){
        switch(atualPower) {
            case "c":
                posXSticky = Math.floor(pad.width/2) - ball.halfWidth();
                break;
            case "x":
            case "r":
                pad.width = pad.widthOriginal;
                posXSticky = Math.floor(pad.width/2) - ball.halfWidth();
                pointMultiplier = 1;
                break;
            case "m":
                ball.dmg = 1;
        }
        atualPower="";
    }
    
    //Deal with the result of the impact of the ball with the block
    function destroyBlock(b, combo) {
        b.hp -= ball.dmg;
        scorePoint += b.point * chain * pointMultiplier;
        score.innerHTML = scorePoint;
        chain = (combo) ? ++chain : chain;
        chainMessage.text = "Chain: " + chain;
        blockHit.currentTime = 0;
        blockHit.play();
        if(b.hp <= 0) b.setVisible(false);
        else if(b.type == "i") b.setVisible(false);
        else b.color = "#DB7093";
    }
    
    //Collision in up and down between two objects
    function upDownCollision(obj1, obj2) {
        if(obj1.visible && obj2.visible) {
            if(obj1.x + obj1.width > obj2.x && obj1.x < obj2.x + obj2.width && obj1.y + obj1.height + obj1.speedY > obj2.y && obj1.y + obj1.speedY < obj2.y + obj2.height) return true;
        }
    }
    
    //Collision in left and right between two objects
    function leftRightCollision(obj1,obj2) {
        if(obj1.visible && obj2.visible) {
            if(obj1.x + obj1.width + obj1.speedX > obj2.x && obj1.x + obj1.speedX < obj2.x + obj2.width && obj1.y + obj1.height > obj2.y && obj1.y < obj2.y +obj2.height) return true;
        }
    }
    
    //Remove object from an array
    function removeObjects(objectsToRemove, array) {
        var i = array.indexOf(objectsToRemove);
        if(i !== -1) {
            array.slice(i, 1);
        }
    }
    
    //Deal with the ball repeling
    function ballRepel(direction) {
        ball.hitable = (!ball.hitable) ? true : ball.hitable;
        ball[direction] *= -1;
    }
    
    //Render Bricks
    function renderBlocks(blck) {
        if(blck.visible && gameState != START) {
            ctx.fillStyle = blck.color;
            ctx.fillRect(blck.x, blck.y, blck.width, blck.height);
        }
    }
    
    //Render Pills
    function renderPills(pill) {
        if(pill.visible && gameState != START) {
            for(let i in pillTypes) {
                let pt = pillTypes[i];
                if(pill.type==pt) pillImg.src = pill.src;
            }
            ctx.drawImage(pillImg,0, 0, pill.width, pill.height,pill.x, pill.y, pill.width, pill.height);
        }
    }
    
    //Render Messages
    function renderText(msg) {
        if(msg.visible) {
            ctx.font = msg.font;
            ctx.fillStyle = msg.color;
            ctx.textBaseline = msg.baseline;
            ctx.fillText(msg.text, msg.x, msg.y);
        }
    }
	
    //Main loop function
	function loop() {
		requestAnimationFrame(loop, cnv);
        if(gameState == GAMING) {
            update();    
        }
		render();
	}
    
    //Draw a line that shows which direction will goes the ball when it's sticky in the paddle
    function drawStickyBallLine() {
        if(sticky) {
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.setLineDash([5, 10]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            if(ball.speedX == 4) {
                ctx.beginPath();
                ctx.moveTo((ball.x + ball.halfWidth()) + 18, pad.y - pad.height - 8);
                ctx.lineTo(ball.x + ball.width + 70, ball.y - ball.height*3.1);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo((ball.x - ball.halfWidth()), pad.y - pad.height - 8);
                ctx.lineTo(ball.x - 70, ball.y - ball.height*3.1);
                ctx.stroke();
            }
        }
    }

    //Game update function
	function update() {
        if(gameState == GAMING) {
            if(atualPower=="s") {
                ball.nextX = ball.x + (ball.speedX/1.8);
                ball.nextY = ball.y + (ball.speedY/1.8);
            } else {
                ball.nextX = ball.x + ball.speedX;
                ball.nextY = ball.y + ball.speedY;
            }
            //Collision Screen and Ball
            if(ball.nextX + ball.width > cnv.width || ball.nextX < 0) {
                ball.nextX = Math.max(0 ,Math.min((cnv.width) - ball.width, ball.nextX));
                ball.speedX = -ball.speedX;
                wallHitted();
            } else if(ball.nextY < 0) {
                ball.nextY = Math.max(0, ball.nextY);
                ball.speedY = -ball.speedY;
                wallHitted();
            }
            
            //Move Pad
            if(mvRight) {
                pad.padSpeed = 5;
                pad.move(pad.padSpeed);
            } else if(mvLeft) {
                pad.padSpeed = -5;
                pad.move(pad.padSpeed);
            }
            
            //Pad position readjustment
            pad.x = Math.max(4 ,Math.min((cnv.width - 4) - pad.width, pad.x));
            
            //Falling of the pills and deleting
            pills.forEach(function(pill) {
                if(upDownCollision(pill, pad) || leftRightCollision(pill, pad)) {
                    pickPowerUp.play();
                    pillEffect(pill.type);
                    pill.setVisible(false);
                    removeObjects(pill, pills);
                } else  pill.fall();
                if(pill.y + pill.height/2 > cnv.height) {
                    pill.setVisible(false);
                    removeObjects(pill, pills);
                }
            });
            
            //Run out the power up duration
            if(atualPower!="l" && atualPower!="") {
                powerClock -= 1;
                if(powerClock<=0) {
                    resetPower();
                }
            }
            
            //Start position of the ball
            if(sticky) {
                ball.x = pad.x + posXSticky;
                ball.y = pad.y - ball.height;
                ball.speedY = -4;
            } else {
                //Update Ball direction
                ball.x = ball.nextX;
                ball.y = ball.nextY;

                //Collision Pad and Ball
                padCollision();

                //Collision Ball and Blocks
                for(let i in blocks) {
                    let b = blocks[i];
                    if(upDownCollision(ball, b) && checkBlockType(b)) ballRepel("speedY");
                    else if(leftRightCollision(ball, b) && checkBlockType(b)) ballRepel("speedX");
                }

                //Ball out of Screen
                if(ball.y + 10 > cnv.height) {
                    if(lives == 0) {
                        gameState = OVER;
                        loseSong.play();
                        overMessage.setVisibility(true);
                        scoreMessage.text = "Level "+ (levelNum+1) +" Score: " + scorePoint;
                        scoreMessage.setVisibility(true);
                    } else {
                        chain = 1;
                        chainMessage.text = "Chain: " + chain;
                        updateLives(-1);
                        loseBall.play();
                        sticky = true;
                        posXSticky = Math.floor(pad.width/2) - ball.halfWidth();
                        ball.speedX = 4;
                        ball.speedY = -4;
                    }
                }

                //counting invisible blocks
                let normalCount = 0;
                let indestruCount = 0;
                for(let i in blocks) {
                    let blck = blocks[i];
                    if(!blck.visible) {
                        normalCount++;
                    } else if(blck.visible && blck.type == "i") {
                        indestruCount++;
                    }
                }

                //Checking if all blocks were destroyed and show win's message
                if(normalCount == (blocks.length - indestruCount)) {
                    winMessage.setVisibility(true);
                    scoreMessage.text = "Level "+ (levelNum+1)+ " Score: " + scorePoint;
                    scoreMessage.setVisibility(true);
                    
                    gameState = NEXTLEVEL;
                    levelNum = (levels[levelNum+1] != undefined)? ++levelNum : levelNum = 0;
                    winSong.play();
                }
            }
        }
	}

    //Rendering function
	function render() {
        //Clear the screen to draw out the game
		ctx.clearRect(0, 0, cnv.width, cnv.height);
        
        if(gameState !== START) {
            //Background Color
            ctx.fillStyle = "#004474";
            ctx.fillRect(0, 0, cnv.width, cnv.height);
            
            //Draw the paddle
            ctx.fillStyle = pad.color;
            ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
            
            //Draw the ball
            ctx.drawImage(ballImg,
                0, 0, ball.width, ball.height,
                ball.x, ball.y, ball.width, ball.height
            );
            
            //Draws the direction line
            drawStickyBallLine();
            chainMessage.setVisibility(true);
            
        } else {
            ctx.fillStyle = "rgba(50, 120, 200, 0.7)";
            ctx.fillRect(0, 0, cnv.width, cnv.height);
        }
        
        //Create a "semi-dark" bar behind the messages
        if(pauseMessage.visible || overMessage.visible || winMessage.visible) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, (cnv.height-120)/2, cnv.width, 120);
        }
        
        //Show blocks if has one and it's visible
        if(blocks !== 0) blocks.forEach(renderBlocks);
        
        //Show pills if has one and it's visible
        if(pills !== 0) pills.forEach(renderPills);
        
        //Show Messages if has one and if it's visible
        if(messages !== 0) messages.forEach(renderText);
	}

	loop();
}())