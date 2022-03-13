// Jack Doyle - main.js
// main body of game goes in here

"use strict";

// Creates the scene and adds it into the browser window
const app = new PIXI.Application({
    width: 800,
    height: 600
});
document.querySelector("#Game").appendChild(app.view);
app.view.style.margin = "auto";
app.view.style.position = "absolute";
app.view.style.left = "50%";
app.view.style.top = "50%";
app.view.style.transform = 'translate3d( -50%, -50%, 0)';

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// loading images
app.loader.
    add([
        "media/assets/Aura.png",
        "media/assets/Bullet.png",
        "media/assets/Ghost.png",
        "media/assets/Gunner.png",
        "media/assets/Platform.png",
        "media/assets/Player.png",
        "media/assets/Gun.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// aliases
let stage;

// game variables
let startLayer, gameLayer, endLayer, enemyLayer, controlsLayer;
let scoreLabel, timerLabel, lifeLabel, finalScoreLabel;
// let shootSound, auraSound, killSound, hitSound, takeDamageSound, deathSound;
let hitSound, shootSound;

let player;
let platforms = [];
let gunners = [];
let auras = [];
let ghosts = [];
let bullets = [];

let timer = 0;
let score = 0;
let life = 25;
let paused = true;
let stageSpeed = 50;

let spaceLockout = false;
let upLockout = false;
let wLockout = false;
let movingLeftKey = false;
let movingLeftArrow = false;
let movingRightKey = false;
let movingRightArrow = false;
let movingDownKey = false;
let movingDownArrow = false;

let minSpawnDelay = 4;
let maxSpawnDelay = 7;
let nextSpawnTime = 5;
let stageDifficulty = 0;

// Set up everything on start
function setup() {
    // Create the starting scene
    stage = app.stage;
    startLayer = new PIXI.Container();
    stage.addChild(startLayer);

    // Create the game scene
    gameLayer = new PIXI.Container();
    gameLayer.visible = false;
    stage.addChild(gameLayer);

    // Create the end scene
    endLayer = new PIXI.Container();
    endLayer.visible = false;
    stage.addChild(endLayer);

    // Create the controls scene
    controlsLayer = new PIXI.Container();
    controlsLayer.visible = false;
    stage.addChild(controlsLayer);

    // Create the enemy scene
    enemyLayer = new PIXI.Container();
    enemyLayer.visible = false;
    stage.addChild(enemyLayer);

    // Create labels, buttons, etc
    createWidgets();

    // Create Player
    player = new Player(0, 0, 100, 300, -320);
    gameLayer.addChild(player);

    // Load in sounds
    hitSound = new Howl({
        src: ['media/sounds/Hit1.mp3']
    });
    shootSound = new Howl({
        src: ['media/sounds/Hit2.mp3']
    });

    // Start update loop
    app.ticker.add(gameLoop);

    // Listen for mouse click events
    app.view.onclick = fireBulletPlayer;

    // Add in keyboard listener for strafing and jumping
    const keyA = keyboard("a");
    const keyD = keyboard("d");
    const keySpace = keyboard(" ");
    const keyLeft = keyboard("ArrowLeft");
    const keyRight = keyboard("ArrowRight");
    const keyUp = keyboard("ArrowUp");
    const keyW = keyboard("w");
    const keyS = keyboard("s");
    const keyDown = keyboard("ArrowDown");

    keyA.press = () => {
        movingLeftKey = true;
    };
    keyA.release = () => {
        movingLeftKey = false;
    };
    keyD.press = () => {
        movingRightKey = true;
    };
    keyD.release = () => {
        movingRightKey = false;
    };
    keySpace.press = () => {
        if (!spaceLockout && !upLockout && !wLockout && !paused) {
            player.jump();
            spaceLockout = true;
        }
    };
    keySpace.release = () => {
        spaceLockout = false;
    };
    keyLeft.press = () => {
        movingLeftArrow = true;
    };
    keyLeft.release = () => {
        movingLeftArrow = false;
    };
    keyRight.press = () => {
        movingRightArrow = true;
    };
    keyRight.release = () => {
        movingRightArrow = false;
    };
    keyUp.press = () => {
        if (!spaceLockout && !upLockout && !wLockout && !paused) {
            player.jump();
            upLockout = true;
        }
    };
    keyUp.release = () => {
        upLockout = false;
    };
    keyW.press = () => {
        if (!spaceLockout && !upLockout && !wLockout && !paused) {
            player.jump();
            wLockout = true;
        }
    };
    keyW.release = () => {
        wLockout = false;
    };
    keyS.press = () => {
        movingDownKey = true;
    };
    keyS.release = () => {
        movingDownKey = false;
    };
    keyDown.press = () => {
        movingDownArrow = true;
    };
    keyDown.release = () => {
        movingDownArrow = false;
    }
}

// Creates all of the static menus and labels. This is a LONG function and I had to put it in main
// because it needs access to the stage variable and also needs to run before the game loop.
function createWidgets() {
    let smallButtonStyle = new PIXI.TextStyle({
        fill: 0x57b041,
        fontSize: 30,
        fontFamily: "Press Start 2P",
        align: "center",
        stroke: 0xFFFFFF,
        strokeThickness: 4
    })
    let startLabel1 = new PIXI.Text("Greg Saves\nthe World");
    startLabel1.anchor.set(0.5);
    startLabel1.style = new PIXI.TextStyle({
        fill: 0x57b041,
        fontSize: 54,
        fontFamily: "Press Start 2P",
        stroke: 0xFF0000,
        lineHeight: 70,
        align: "center",
        stroke: 0xFFFFFF,
        strokeThickness: 4,
        dropShadow: true,
        dropShadowDistance: 0,
        dropShadowAngle: Math.PI / 3,
        dropShadowDistance: 5, 
        dropShadowBlur: 2,
        dropShadowColor: 0xFFFFFF
    });
    startLabel1.x = sceneWidth / 2;
    startLabel1.y = 140;
    startLayer.addChild(startLabel1);

    let controlButtonBackground1 = new ButtonBackground(sceneWidth / 4 + 10, sceneHeight / 2 + 15, 330, 130, 0x64805d);
    startLayer.addChild(controlButtonBackground1);

    let controlButtonBackground2 = new ButtonBackground(sceneWidth / 4 + 10, sceneHeight / 2 + 15, 310, 110, 0xb5deab);
    controlButtonBackground2.interactive = true;
    controlButtonBackground2.buttonMode = true;
    controlButtonBackground2.on("pointerup", controlsMenu);
    controlButtonBackground2.on('pointerover', e => e.target.alpha = 0.7);
    controlButtonBackground2.on('pointerout', e => e.currentTarget.alpha = 1.0);  
    startLayer.addChild(controlButtonBackground2);

    let controlButton = new PIXI.Text("Controls");
    controlButton.anchor.set(0.5);
    controlButton.style = smallButtonStyle
    controlButton.x = sceneWidth / 4 + 10;
    controlButton.y = sceneHeight / 2 + 15;
    startLayer.addChild(controlButton);

    let enemyButtonBackground1 = new ButtonBackground(3 * sceneWidth / 4 - 10, sceneHeight / 2 + 15, 330, 130, 0x64805d);
    startLayer.addChild(enemyButtonBackground1);

    let enemyButtonBackground2 = new ButtonBackground(3 * sceneWidth / 4 - 10, sceneHeight / 2 + 15, 310, 110, 0xb5deab);
    enemyButtonBackground2.interactive = true;
    enemyButtonBackground2.buttonMode = true;
    enemyButtonBackground2.on("pointerup", enemyMenu);
    enemyButtonBackground2.on('pointerover', e => e.target.alpha = 0.7);
    enemyButtonBackground2.on('pointerout', e => e.currentTarget.alpha = 1.0);
    startLayer.addChild(enemyButtonBackground2);

    let enemyButton = new PIXI.Text("Enemies");
    enemyButton.anchor.set(0.5);
    enemyButton.style = smallButtonStyle
    enemyButton.x = 3 * sceneWidth / 4 - 10;
    enemyButton.y = sceneHeight / 2 + 15;
    startLayer.addChild(enemyButton);


    let startButtonBackground1 = new ButtonBackground(sceneWidth / 2, sceneHeight - 110, 700, 130, 0x64805d);    
    startLayer.addChild(startButtonBackground1);

    let startButtonBackground2 = new ButtonBackground(sceneWidth / 2, sceneHeight - 110, 680, 110, 0xb5deab); 
    startButtonBackground2.interactive = true;
    startButtonBackground2.buttonMode = true;
    startButtonBackground2.on("pointerup", startGame);
    startButtonBackground2.on('pointerover', e => e.target.alpha = 0.7);
    startButtonBackground2.on('pointerout', e => e.currentTarget.alpha = 1.0);  
    startLayer.addChild(startButtonBackground2);

    let startButton = new PIXI.Text("Enter the Apocalypse");
    startButton.anchor.set(0.5);
    startButton.style = new PIXI.TextStyle({
        fill: 0x57b041,
        fontSize: 30,
        fontFamily: "Press Start 2P",
        align: "center",
        stroke: 0xFFFFFF,
        strokeThickness: 4
    });
    startButton.x = sceneWidth / 2;
    startButton.y = sceneHeight - 110;
    startLayer.addChild(startButton);

    let textStyle = new PIXI.TextStyle({
        fill: 0x57b041,
        fontSize: 14,
        fontFamily: "Press Start 2P",
        stroke: 0xFFFFFF,
        strokeThickness: 1
    });

    timerLabel = new PIXI.Text();
    timerLabel.style = textStyle;
    timerLabel.x = 5;
    timerLabel.y = 5;
    gameLayer.addChild(timerLabel);
    increaseTimer(0);

    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 26;
    gameLayer.addChild(scoreLabel);
    increaseScore(0);

    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 47;
    gameLayer.addChild(lifeLabel);
    decreaseLife(0);

    let gameOverText = new PIXI.Text("Game Over!");
    gameOverText.anchor.set(0.5);
    textStyle = new PIXI.TextStyle({
        fill: 0x57b041,
        fontSize: 56,
        fontFamily: "Press Start 2P",
        stroke: 0xFFFFFF,
        strokeThickness: 4,
        align: "center"
    });
    gameOverText.style = textStyle;
    gameOverText.x = sceneWidth / 2;
    gameOverText.y = 100;
    endLayer.addChild(gameOverText);

    let gameOverText2 = new PIXI.Text("RIP Greg, will be missed");
    gameOverText2.anchor.set(0.5);
    textStyle = new PIXI.TextStyle({
        fill: 0x57b041,
        fontSize: 24,
        fontFamily: "Press Start 2P",
        stroke: 0xFFFFFF,
        strokeThickness: 3,
        align: "center",
        lineHeight: 40
    });
    gameOverText2.style = textStyle;
    gameOverText2.x = sceneWidth / 2;
    gameOverText2.y = 210;
    endLayer.addChild(gameOverText2);

    finalScoreLabel = new PIXI.Text("Your final score: ");
    finalScoreLabel.anchor.set(0.5);
    finalScoreLabel.style = new PIXI.TextStyle({
        fill: 0x57b041,
        fontSize: 30,
        fontFamily: "Press Start 2P",
        stroke: 0xFFFFFF,
        strokeThickness: 2
    });
    finalScoreLabel.x = sceneWidth / 2 - 40;
    finalScoreLabel.y = 310;
    endLayer.addChild(finalScoreLabel);

    let mainMenuButtonBackground1 = new ButtonBackground(sceneWidth / 4 + 10, sceneHeight - 120, 330, 130, 0x64805d);
    endLayer.addChild(mainMenuButtonBackground1);

    let mainMenuButtonBackground2 = new ButtonBackground(sceneWidth / 4 + 10, sceneHeight - 120, 310, 110, 0xb5deab);
    mainMenuButtonBackground2.interactive = true;
    mainMenuButtonBackground2.buttonMode = true;
    mainMenuButtonBackground2.on("pointerup", mainMenu);
    mainMenuButtonBackground2.on('pointerover', e => e.target.alpha = 0.7);
    mainMenuButtonBackground2.on('pointerout', e => e.currentTarget.alpha = 1.0);  
    endLayer.addChild(mainMenuButtonBackground2);

    let mainMenuButton = new PIXI.Text("Main Menu");
    mainMenuButton.anchor.set(0.5);
    mainMenuButton.style = smallButtonStyle;
    mainMenuButton.x = sceneWidth / 4 + 10;
    mainMenuButton.y = sceneHeight - 120;
    endLayer.addChild(mainMenuButton); 

    let playAgainButtonBackground1 = new ButtonBackground(3 * sceneWidth / 4 - 10, sceneHeight - 120, 340, 130, 0x64805d);
    endLayer.addChild(playAgainButtonBackground1);

    let playAgainButtonBackground2 = new ButtonBackground(3 * sceneWidth / 4 - 10, sceneHeight - 120, 320, 110, 0xb5deab);
    playAgainButtonBackground2.interactive = true;
    playAgainButtonBackground2.buttonMode = true;
    playAgainButtonBackground2.on("pointerup", startGame);
    playAgainButtonBackground2.on('pointerover', e => e.target.alpha = 0.7);
    playAgainButtonBackground2.on('pointerout', e => e.currentTarget.alpha = 1.0);
    endLayer.addChild(playAgainButtonBackground2);

    let playAgainButton = new PIXI.Text("Play Again");
    playAgainButton.anchor.set(0.5);
    playAgainButton.style = smallButtonStyle;
    playAgainButton.x =  3 * sceneWidth / 4 - 10;
    playAgainButton.y = sceneHeight - 120;
    endLayer.addChild(playAgainButton); 

    let menuData = new PIXI.TextStyle({
        // fill: 0x57b041,
        fill: 0x000000,
        fontSize: 25,
        fontFamily: "Arial",
        align: "center"
    });
    let menuTitles = new PIXI.TextStyle({
        fill: 0x57b041,
        fontSize: 48,
        fontFamily: "Press Start 2P",
        stroke: 0xFFFFFF,
        strokeThickness: 4,
        align: "center"
    });

    let enemyTitle = new PIXI.Text("Enemies");
    enemyTitle.anchor.set(0.5);
    enemyTitle.style = menuTitles;
    enemyTitle.x = sceneWidth / 2 - 160;
    enemyTitle.y = 80;
    enemyLayer.addChild(enemyTitle);

    let enemyBackground1 = new ButtonBackground(sceneWidth / 2, 360, 760, 420, 0x64805d);
    enemyLayer.addChild(enemyBackground1);
    let enemyBackground2 = new ButtonBackground(sceneWidth / 2, 360, 740, 400, 0xb5deab);
    enemyLayer.addChild(enemyBackground2);

    let gunnerSprite = new Gunner(50, 50);
    gunnerSprite.scale.set(0.6);
    gunnerSprite.anchor.set(0.5);
    gunnerSprite.x = sceneWidth / 4 - 80;
    gunnerSprite.y = 220;
    enemyLayer.addChild(gunnerSprite);

    let gunnerData = new PIXI.Text("Gunners that fall from the sky while shooting.\nThey have low health pools but they tear you\napart if you let them get too low.");
    gunnerData.anchor.set(0.5);
    gunnerData.style = menuData;
    gunnerData.x = 2 * sceneWidth / 3 - 60;
    gunnerData.y = 220;
    enemyLayer.addChild(gunnerData);

    let ghostSprite = new Ghost(50, 50);
    ghostSprite.scale.set(0.6);
    ghostSprite.anchor.set(0.5);
    ghostSprite.x = sceneWidth / 4 - 80;
    ghostSprite.y = 360;
    enemyLayer.addChild(ghostSprite);

    let ghostData = new PIXI.Text("Ghosts that chase you down relentlessly. They get\nfaster as you go further, and they can come from\n all sides. Make sure to shoot them down first.");
    ghostData.anchor.set(0.5);
    ghostData.style = menuData;
    ghostData.x = 2 * sceneWidth / 3 - 60;
    ghostData.y = 360;
    enemyLayer.addChild(ghostData);

    let auraSprite = new Aura(50, 50);
    auraSprite.scale.set(0.6);
    auraSprite.anchor.set(0.5);
    auraSprite.x = sceneWidth / 4 - 80;
    auraSprite.y = 500;
    enemyLayer.addChild(auraSprite);

    let auraData = new PIXI.Text("Auras that warp the field around tham. They pull\nin nearby bullets shot by you and Gunners, and they\nhave sizeable health pools. They are slow though.");
    auraData.anchor.set(0.5);
    auraData.style = menuData;
    auraData.x = 2 * sceneWidth / 3 - 60;
    auraData.y = 500;
    enemyLayer.addChild(auraData);

    let enemyBackButtonBackground1 = new ButtonBackground(sceneWidth / 2 + 200, 80, 330, 120, 0x64805d);
    enemyLayer.addChild(enemyBackButtonBackground1);

    let enemyBackButtonBackground2 = new ButtonBackground(sceneWidth / 2 + 200, 80, 310, 100, 0xb5deab);
    enemyBackButtonBackground2.interactive = true;
    enemyBackButtonBackground2.buttonMode = true;
    enemyBackButtonBackground2.on("pointerup", mainMenu);
    enemyBackButtonBackground2.on('pointerover', e => e.target.alpha = 0.7);
    enemyBackButtonBackground2.on('pointerout', e => e.currentTarget.alpha = 1.0);
    enemyLayer.addChild(enemyBackButtonBackground2);

    let enemyBackButton = new PIXI.Text("Main Menu");
    enemyBackButton.anchor.set(0.5);
    enemyBackButton.style = smallButtonStyle;
    enemyBackButton.x = sceneWidth / 2 + 200;
    enemyBackButton.y = 80;
    enemyLayer.addChild(enemyBackButton);

    let controlsTitle = new PIXI.Text("Controls");
    controlsTitle.anchor.set(0.5);
    controlsTitle.style = menuTitles;
    controlsTitle.x = sceneWidth / 2 - 160;
    controlsTitle.y = 80;
    controlsLayer.addChild(controlsTitle);

    let controlsBackButtonBackground1 = new ButtonBackground(sceneWidth / 2 + 200, 80, 320, 120, 0x64805d);
    controlsLayer.addChild(controlsBackButtonBackground1);

    let controlsBackButtonBackground2 = new ButtonBackground(sceneWidth / 2 + 200, 80, 300, 100, 0xb5deab);
    controlsBackButtonBackground2.interactive = true;
    controlsBackButtonBackground2.buttonMode = true;
    controlsBackButtonBackground2.on("pointerup", mainMenu);
    controlsBackButtonBackground2.on('pointerover', e => e.target.alpha = 0.7);
    controlsBackButtonBackground2.on('pointerout', e => e.currentTarget.alpha = 1.0);
    controlsLayer.addChild(controlsBackButtonBackground2);

    let controlsBackButton = new PIXI.Text("Main Menu");
    controlsBackButton.anchor.set(0.5);
    controlsBackButton.style = smallButtonStyle;
    controlsBackButton.x = sceneWidth / 2 + 200;
    controlsBackButton.y = 80;
    controlsLayer.addChild(controlsBackButton);

    let controlsBackground1 = new ButtonBackground(sceneWidth / 2, 360, 760, 420, 0x64805d);
    controlsLayer.addChild(controlsBackground1);
    let controlsBackground2 = new ButtonBackground(sceneWidth / 2, 360, 740, 400, 0xb5deab);
    controlsLayer.addChild(controlsBackground2);

    let controlsHeader = new PIXI.TextStyle({
        fill: 0x57b041,
        fontSize: 30,
        fontFamily: "Press Start 2P",
        stroke: 0xFFFFFF,
        strokeThickness: 2,
        align: "center"
    });

    let controlsShoot = new PIXI.Text("Shoot");
    controlsShoot.anchor.set(0.5);
    controlsShoot.style = controlsHeader;
    controlsShoot.x = sceneWidth / 4 - 60;
    controlsShoot.y = 200;
    controlsLayer.addChild(controlsShoot);

    let shootData = new PIXI.Text("Left click to fire, aims at cursor");
    shootData.anchor.set(0.5);
    shootData.style = menuData;
    shootData.x = 2 * sceneWidth / 3 - 60;
    shootData.y = 198;
    controlsLayer.addChild(shootData);

    let controlsJump = new PIXI.Text("Jump");
    controlsJump.anchor.set(0.5);
    controlsJump.style = controlsHeader;
    controlsJump.x = sceneWidth / 4 - 60;
    controlsJump.y = 280;
    controlsLayer.addChild(controlsJump);

    let jumpData = new PIXI.Text("W, Up Arrow, or Space key to jump");
    jumpData.anchor.set(0.5);
    jumpData.style = menuData;
    jumpData.x = 2 * sceneWidth / 3 - 60;
    jumpData.y = 278;
    controlsLayer.addChild(jumpData);

    let controlsLeft = new PIXI.Text("Left");
    controlsLeft.anchor.set(0.5);
    controlsLeft.style = controlsHeader;
    controlsLeft.x = sceneWidth / 4 - 60;
    controlsLeft.y = 360;
    controlsLayer.addChild(controlsLeft);   
    
    let leftData = new PIXI.Text("Left Arrow or \"A\" Key to move left");
    leftData.anchor.set(0.5);
    leftData.style = menuData;
    leftData.x = 2 * sceneWidth / 3 - 60;
    leftData.y = 358;
    controlsLayer.addChild(leftData);

    let controlsRight = new PIXI.Text("Right");
    controlsRight.anchor.set(0.5);
    controlsRight.style = controlsHeader;
    controlsRight.x = sceneWidth / 4 - 60;
    controlsRight.y = 440;
    controlsLayer.addChild(controlsRight); 

    let rightData = new PIXI.Text("Right Arrow or \"D\" Key to move right");
    rightData.anchor.set(0.5);
    rightData.style = menuData;
    rightData.x = 2 * sceneWidth / 3 - 60;
    rightData.y = 438;
    controlsLayer.addChild(rightData);
    
    let controlsFall = new PIXI.Text("Fall");
    controlsFall.anchor.set(0.5);
    controlsFall.style = controlsHeader;
    controlsFall.x = sceneWidth / 4 - 60;
    controlsFall.y = 520;
    controlsLayer.addChild(controlsFall);

    let fallData = new PIXI.Text("Down Arrow or \"S\" Key to cause fast fall");
    fallData.anchor.set(0.5);
    fallData.style = menuData;
    fallData.x = 2 * sceneWidth / 3 - 60;
    fallData.y = 518;
    controlsLayer.addChild(fallData);
}

function enemyMenu() {
    startLayer.visible = false;
    enemyLayer.visible = true;
}

function controlsMenu() {
    startLayer.visible = false;
    controlsLayer.visible = true;
}

function mainMenu() {
    startLayer.visible = true;
    endLayer.visible = false;
    gameLayer.visible = false;
    controlsLayer.visible = false;
    enemyLayer.visible = false;
    paused = true;
}

function startGame() {
    // Sets layer visibility
    startLayer.visible = false;
    endLayer.visible = false;
    gameLayer.visible = true;
    enemyLayer.visible = false;
    controlsLayer.visible = false;
    // Adjusts EVERYTHING
    score = 0;
    life = 25; 
    timer = 0;
    increaseTimer(0);
    nextSpawnTime = 0;
    minSpawnDelay = 4;
    maxSpawnDelay = 7;
    stageSpeed = 300;
    stageDifficulty = 0;
    increaseScore(0);
    decreaseLife(0);
    player.x = 100;
    player.y = 300;
    spawnStartingPlatforms();
    platforms.forEach(c => gameLayer.addChild(c));
    player.velocity = 50;
    player.collided(true);
    paused = false;
}

function increaseScore(value) {
    score += value;
    scoreLabel.text = `Score ${score}`;
}

function increaseTimer(value) {
    timer += value;
    timerLabel.text = `Time elapsed ${timer.toFixed(2)}`;
}

function decreaseLife(value) {
    life -= value;
    lifeLabel.text = `Lifes remaining ${life}`;
}

function gameLoop() {
    if (paused) return;

    // Get delta time
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;
    increaseTimer(dt);

    // Using a logistic curve to increment speed based difficulty
    stageSpeed = logisticNum(timer, 50, 250, 300, 60, false);
    
    // Using a logistic curve to contorl the spawn time windows
    maxSpawnDelay = logisticNum(timer, 7, 5.5, 300, 60, true);
    minSpawnDelay = logisticNum(timer, 4, 3.5, 300, 60, true);

    // Capping stage difficulty at 5
    stageDifficulty = Math.floor(timer/60);
    if (stageDifficulty > 5) {
        stageDifficulty = 5;
    }
    
    // Player I-Frames
    if (player.invincible) {
        player.decrementInvincibility();
    }

    // Player Movement
    player.fastFall = false;
    if (movingLeftArrow || movingLeftKey) {
        player.move(false, stageSpeed, dt);
    }
    if (movingRightArrow || movingRightKey) {
        player.move(true, stageSpeed, dt);
    }
    let playerBounds = player.getBounds();
    if (playerBounds.x < 0) {
        player.x = playerBounds.width / 2;
    }
    else if (playerBounds.x + playerBounds.width > sceneWidth) {
        player.x = sceneWidth - (playerBounds.width / 2);
    }
    if (movingDownArrow || movingDownKey) {
        player.fastFall = true;
    }
    player.falling(dt);
    
    // Player Falling Death
    if (player.y > sceneHeight + 100) {
        end();
        return;
    }

    // Enemy Movement
    for (let gunner of gunners) {
        gunner.move(stageSpeed, dt);
        if (offScreen(gunner.x, gunner.y, 50)) {
            gunner.isAlive = false;
            increaseScore(-25);
        }
        if (gunner.decrementShot(dt)) {
            fireBulletGunner(gunner.x - 40, gunner.y + 25);
        }
    }
    for (let aura of auras) {
        aura.translate(stageSpeed, dt);
        if (offScreen(aura.x, aura.y, 100)) {
            aura.isAlive = false;
            increaseScore(-50);
        }
        //
        //  Bullet manipulation here
        //
        //
    }
    for (let ghost of ghosts) {
        ghost.chasePlayer(player, dt);
    }

    // Move Bullet
    for (let b of bullets) {
        // Aura maniplation
        let manipulation = {x:0, y:0};
        for (let a of auras) {
            let dist = distanceBetween(a.x, a.y, b.x, b.y);
            if (dist < 400) {
                let magDist = Math.sqrt(Math.abs(400 - dist));
                let dir = unitVectorFromPoints(b.x, b.y, a.x, a.y);
                manipulation.x += magDist * dir.x / 10;
                manipulation.y += magDist * dir.y / 10;
            }
        }
        b.accelX = manipulation.x;
        b.accelY = manipulation.y;
        b.accelerate(dt);
        b.move(dt);
        // Checks to see if b is out of bounds
        if (offScreen(b.x, b.y, 10)) {
            b.isAlive = false;
        }
    }


    // Move Platforms
    for (let plat of platforms) {
        plat.translate(stageSpeed, dt);
        if (offScreen(plat.x, plat.y, 175)) {
            plat.x = sceneWidth + 70;
        }
    }

    
    // Spawn handling
    // Max and min delay are decremented with time
    nextSpawnTime -= dt;
    if (nextSpawnTime < 0) {
        let monsterNum = randomInt(1,3);
        if (monsterNum == 1) {
            let gunner = new Gunner(sceneWidth, 0, 3 + stageDifficulty, stageSpeed - randomInt(10, 30));
            gunners.push(gunner);
            gameLayer.addChild(gunner);
        }
        else if (monsterNum == 2) {
            let ghostSpawnSide = randomInt(1,4);
            let ghost;
            // Left Side
            if (ghostSpawnSide == 1) {
                ghost = new Ghost(0, randomFloat(0, sceneHeight), 4, 200 + (25 * stageDifficulty));
            }
            // Top
            else if (ghostSpawnSide == 2) {
                ghost = new Ghost(randomFloat(0, sceneWidth), 0, 4, 200 + (25 * stageDifficulty));
            }
            // Right Side
            else if (ghostSpawnSide == 3) {
                ghost = new Ghost(sceneWidth, randomFloat(0, sceneHeight), 4, 200 + (25 * stageDifficulty));
            }
            // Bottom Side
            else if (ghostSpawnSide == 4) {
                ghost = new Ghost(randomFloat(0, sceneWidth), sceneHeight, 4, 200 + (25 * stageDifficulty));
            }
            ghosts.push(ghost);
            gameLayer.addChild(ghost);
        }
        else if (monsterNum == 3) {
            let aura = new Aura(sceneWidth, randomFloat(sceneHeight / 2 - 200, sceneHeight / 2 + 200), 8 + (stageDifficulty * 2));
            auras.push(aura);
            gameLayer.addChild(aura);
        }
        // Get next spawn of the enemy
        nextSpawnTime = CalcNextSpawn(minSpawnDelay, maxSpawnDelay);
    }

    // Check for player platform collisions
    player.collided(false);
    for (let plat of platforms) {
        platformIntersect(player, plat, dt);
    }

    // Check for standard bullet collisions
    for (let b of bullets) {
        if (b.enemy) {
            if (rectsIntersect(b, player)) {
                if (!player.invincible) {
                    decreaseLife(1);
                }
                gameLayer.removeChild(b);
                b.isAlive = false;
                hitSound.play();
            }
        }
        else {
            for (let g of gunners) {
                if (rectsIntersect(g, b)) {
                    g.takeDamage(1);
                    if (!g.isAlive) {
                        increaseScore(100);
                        gameLayer.removeChild(g);
                    }
                    b.isAlive = false;
                    gameLayer.removeChild(b);
                    hitSound.play();
                }
            }
            for (let g of ghosts) {
                if (rectsIntersect(g, b)) {
                    g.takeDamage(1);
                    if (!g.isAlive) {
                        increaseScore(300);
                        gameLayer.removeChild(g);
                    }
                    b.isAlive = false;
                    gameLayer.removeChild(b);
                    hitSound.play();
                }
            }
            for (let a of auras) {
                if (distanceBetween(a.x, a.y, b.x, b.y) < 50) {
                    a.takeDamage(1);
                    if (!a.isAlive) {
                        increaseScore(200);
                        gameLayer.removeChild(a);
                    }
                    b.isAlive = false;
                    gameLayer.removeChild(b);
                    hitSound.play();
                }
            }
        }
    }

    // Check for player and enemy collisions
    for (let g of gunners) {
        if (rectsIntersect(g, player)) {
            let direction = unitVectorFromPoints(player.x, player.y, g.x, g.y);
            g.x += direction.x * 50;
            g.y += direction.y * 50;
        }
    }
    for (let g of ghosts) {
        if (rectsIntersect(g, player)) {
            if (!player.invincible) {
                decreaseLife(3);
                player.setInvincible();
            }
            // Ghost is killed
            g.isAlive = false;
            gameLayer.removeChild(g);
        }
    }
    for (let a of auras) {
        if (rectsIntersect(a, player)) {
            if (!player.invincible) {
                decreaseLife(5);
                player.setInvincible();
            }
            let direction = unitVectorFromPoints(player.x, player.y, a.x, a.y);
            a.x += direction.x * 50;
            a.y += direction.y * 50;
        }
    }

    // Remove dead or astray objects
    bullets = bullets.filter(bullet => bullet.isAlive);
    gunners = gunners.filter(gunner => gunner.isAlive);
    ghosts = ghosts.filter(ghost => ghost.isAlive);
    auras = auras.filter(aura => aura.isAlive);

    // Check for game over
    if (life <= 0) {
        end();
        return; // return here so we skip #8 below
    }
}

// Function called when the player dies
function end() {
    paused = true;

    platforms.forEach(c => gameLayer.removeChild(c));
    platforms = [];

    gunners.forEach(c => gameLayer.removeChild(c));
    gunners = [];

    auras.forEach(c => gameLayer.removeChild(c));
    auras = [];

    ghosts.forEach(c => gameLayer.removeChild(c));
    ghosts = [];

    bullets.forEach(c => gameLayer.removeChild(c));
    bullets = [];

    finalScoreLabel.text = "Your final score: " + score;

    gameLayer.visible = false;
    endLayer.visible = true;
}

function fireBulletGunner(x, y) {
    if (paused) return;

    let b = new Bullet(x, y, {x:-1, y:0}, true);
    bullets.push(b);
    gameLayer.addChild(b);
    shootSound.play();
}

// Function to fire the player's bullet
function fireBulletPlayer(e) {
    if (paused) return;

    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    
    // Gets the direction vector of the bullet
    let direction = unitVectorFromPoints(player.x, player.y, mousePosition.x, mousePosition.y);

    // Creates the bullet
    let b = new Bullet((player.x + 30 * direction.x), (player.y + 30 * direction.y), direction, false);
    bullets.push(b);
    gameLayer.addChild(b);

    shootSound.play();
}

// Function to spawn the starting platforms. Will eventually be made to spawn in random designed sequences of platforms, but didn't get around to it yet
function spawnStartingPlatforms() {
    // Very simplified for now, supposed to be random generation
    for (let i = 0; i < 2; i++) {
        let plat = new Platform((i * 500 + 100), (Math.floor(Math.random() * 11) * 10 + 400));
        platforms.push(plat);
    }
}

// Directional collision detection parent function
// If the player lands on top of the platform, returns true
function platformIntersect(player, plat, dt) {
    var ab = player.getBounds();
    //var bb = plat.getBounds();
    
    let aCenter = ab.x + (ab.width / 2);
    let aTop = ab.y;
    let aBot = ab.y + ab.height;
    let aLeft = ab.x;
    let aRight = ab.x + ab.width;
    let bTop = plat.y;
    let bBot = plat.y + plat.height;
    let bLeft = plat.x;
    let bRight = plat.x + plat.width;

    // Player from above check
    if (aBot < bBot && aBot > bTop && aCenter + 10 > bLeft && aCenter - 10 < bRight) {
        player.y -= (aBot - bTop);
        player.velocity = 20;
        player.collided(true);
        player.x -= (stageSpeed * dt);
    }
}

function CalcNextSpawn(min, max) {
    return randomFloat(min, max);
}