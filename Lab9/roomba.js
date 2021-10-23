var isOn = false;
var isVacuumOn = false;
var isFacingWall = false;
var numTurns = 0;

function turnLeft() {
    //Code to turn the Room 90 Degrees to the Left
}
function move() {
    //Code to move the Roomba 1 unit forward
}

if (!isVacuumOn) {
    isVacuumOn = true;
}

isVacuumOn = true;

while (numTurns < 4) {
    if (isFacingWall) {
        numTurns++;
        turnLeft();
    }
    else {
        move();
        numTurns = 0;
    }
}

isVacuumOn = false;
isOn = false;