// Jack Doyle - classes.js
// classes for the game go in here

class Player extends PIXI.Sprite {
    // Constructor
    constructor(x = 0, y = 0, horizontal = 100, gravity = 100, jumpPower = -400) {
        super(app.loader.resources["media/assets/Player.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.6);      // Adjust later
        this.x = x;
        this.y = y;
        this.speedHorizontal = horizontal;
        this.colliding = true;
        this.secondJump = true;
        this.gravity = gravity;
        this.velocity = 50;
        this.jumpPower = jumpPower;
        this.invincible = false;
        this.fastFall = false;
        this.invincibleTime = 0;
        Object.seal(this);
    }

    // Movement methods
    collided(state = true) {
        this.colliding = state;
        if (state) {
            this.secondJump = true;
        }
    }
    jump() {
        if (this.colliding) {
            this.velocity += this.jumpPower;
            this.y -= 5;
        }
        else if (this.secondJump) {
            this.velocity = this.jumpPower;
            this.secondJump = false;
            this.y -= 5;
        }
    }
    falling(dt = 1/60) {
        if (this.fastFall) {
            if (this.velocity < 0) {
                this.velocity = 0;
            }
            this.y += dt * 200;
        }
        this.velocity += this.gravity * dt;
        if (this.velocity > 600) {
            this.velocity = 600;
        }
        else if (this.velocity < -1000) {
            this.velocity = -1000;
        }
        this.y += this.velocity * dt;
    }
    // True for right, false for left
    move(right, stageSpeed, dt = 1/60) {
        if (right) {
            if (this.colliding) {
                this.x += (this.speedHorizontal + stageSpeed) * dt; 
            }
            else {
                this.x += this.speedHorizontal * dt;
            }
        }
        else {
            this.x -= this.speedHorizontal * dt;
        }
    }

    // I-Frame handling
    decrementInvincibility(dt = 1/60) {
        this.invincibleTime -= dt;
        if (this.invincibleTime <= 0) {
            this.invincible = false;
        }
    }
    setInvincible() {
        this.invincibleTime = 0.5;
        this.invincible = true;
    }
}

// Deal with gun later
/* 
class Gun extends PIXI.Sprite {
    // Constructor
    constructor(x = 0, y = 0, horizontal = 100, gravity = -100, jumpPower = 400) {
        super(app.loader.resources["media/assets/Player.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.5);      // Adjust later
        this.x = x;
        this.y = y;
        this.speedHorizontal = horiztonal;
        this.colliding = true;
        this.secondJump = true;
        this.gravity = gravity;
        this.velocity = -200;
        this.jumpPower = jumpPower;
        Object.seal(this);
    }
}
*/

class Bullet extends PIXI.Sprite {
    // Constructor
    constructor(x = 0, y = 0, vector = {x:1, y:0}, enemy = false) {
        super(app.loader.resources["media/assets/Bullet.png"].texture);
        this.anchor.set(0, 0);
        this.scale.set(0.4);      // Adjust later
        this.x = x;
        this.y = y;
        this.speed = 200;
        this.fwd = vector;
        this.speed = 200;
        this.accelX = 0;
        this.accelY = 0;
        this.isAlive = true;
        this.enemy = enemy;
        Object.seal(this);
    }

    // Getting methods
    get velocity() {
        return {x:this.fwd.x, y:this.fwd.y, speed:this.speed};
    }

    // Movement Methods
    accelerate(dt = 1/60) {
        this.fwd.x += this.accelX * dt;
        this.fwd.y += this.accelY * dt;
    }
    move(dt = 1/60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

class Platform extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["media/assets/Platform.png"].texture);
        this.anchor.set(0, 0);
        this.scale.set(0.6);      // Adjust later
        this.x = x;
        this.y = y;
        this.isAlive = true;
        Object.seal(this);
    }

    translate(stageSpeed, dt = 1/60) {
        this.x -= stageSpeed * dt;
    }
}

class Gunner extends PIXI.Sprite {
    constructor(x = 0, y = 0, health = 3, velocity = 20) {
        super(app.loader.resources["media/assets/Gunner.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.6);        // Adjust later
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.velocity = velocity;
        this.health = health;
        this.shotTimer = 2;
    }

    takeDamage(value) {
        this.health -= value;
        if (this.health <= 0) {
            this.isAlive = false;
        }
    }

    move(stageSpeed, dt = 1/60) {
        this.y += this.velocity * dt;
        this.x -= stageSpeed * dt;
    }

    // Shotting
    resetShot() {
        this.shotTimer = 0.3;
    }
    decrementShot(dt = 1/60) {
        this.shotTimer -= dt;
        if (this.shotTimer <= 0) {
            this.resetShot();
            return true;
        }
        else {
            return false;
        }
    }
}

class Ghost extends PIXI.Sprite {
    constructor(x = 0, y = 0, health = 4, speed = 200) {
        super(app.loader.resources["media/assets/Ghost.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.4);        // Adjust later
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.health = health;
        this.speed = speed;
    }

    takeDamage(value) {
        this.health -= value;
        if (this.health <= 0) {
            this.isAlive = false;
        }
    }

    chasePlayer(player, dt = 1/60) {
        let playerDir = unitVectorFromPoints(this.x, this.y, player.x, player.y);
        this.x += dt * this.speed * playerDir.x;
        this.y += dt * this.speed * playerDir.y;
    }
}

class Aura extends PIXI.Sprite {
    constructor(x = 0, y = 0, health = 8) {
        super(app.loader.resources["media/assets/Aura.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.7);        // Adjust later
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.health = health;
    }

    takeDamage(value) {
        this.health -= value;
        if (this.health <= 0) {
            this.isAlive = false;
        }
    }

    translate(stageSpeed, dt = 1/60) {
        this.x -= stageSpeed * dt;
    }
}

class ButtonBackground extends PIXI.Graphics {
    constructor(x, y, width, height, color = 0xaedea2) {
        super();
        this.beginFill(color);
        this.drawRect(x - width / 2, y - height / 2, width, height);
        this.endFill();
    }
}