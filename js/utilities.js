// Jack Doyle - utilities.js
// utilities for the game go in here

// From Paul Brooke
function lerp(start, end, amt) {
    return start * (1 - amt) + amt * end;
}

// From Paul Brooke
function cosineInterpolate(y1, y2, amt) {
    let amt2 = (1 - Math.cos(amt * Math.PI)) / 2;
    return (y1 * (1 - amt2)) + (y2 * amt2);
}

// Standard clamp function
function clamp(val, min, max) {
    return val < main ? min : ( val > max ? max : val);
}

function rectsIntersect(a, b) {
    var ab = a.getBounds();
	var bb = b.getBounds();
	return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

// From KittyKatAttack
function keyboard(value) {
    const key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = (event) => {
        if (event.key === key.value) {
            if (key.isUp && key.press) {
                key.press();
            }
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };
  
    //The `upHandler`
    key.upHandler = (event) => {
        if (event.key === key.value) {
            if (key.isDown && key.release) {
                key.release();
            }
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };
  
    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);
    
    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };
    
    return key;
}

// Function that gets a unit vector based on the x y values of two points
function unitVectorFromPoints(ax, ay, bx, by) {
    let x_diff = bx - ax;
    let y_diff = by - ay;
    let length = Math.sqrt(x_diff * x_diff + y_diff * y_diff);
    return {x:x_diff/length, y:y_diff/length};
}

// Helper function for checking if objects are off of the screen
function offScreen(x, y, buffer = 30) {
    if (x < -buffer) {
        return true;
    }
    else if (x > sceneWidth + buffer) {
        return true;
    }
    else if (y < -buffer) {
        return true;
    }
    else if (y > sceneHeight + buffer) {
        return true;
    }
    else {
        return false;
    }
}

// Helper function that gives an inclusive bounded int
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Helper function that gives a bounded random number
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// Helper function for distance between two 2D points
function distanceBetween(ax, ay, bx, by) {
    let Xdiff = bx - ax;
    let Ydiff = by - ay;
    return Math.sqrt(Xdiff * Xdiff + Ydiff * Ydiff);
}

// Helper function for a logistic curve
function logisticNum(time, verticalOffset, verticalScale, horizontalOffset, horizontalScale, negative = false) {
    let base = 1 + Math.exp(-(time - horizontalOffset) / horizontalScale);
    if (negative) {
        return (-1 / base) * verticalScale + verticalOffset
    }
    else {
        return (1 / base) * verticalScale + verticalOffset;
    }
}