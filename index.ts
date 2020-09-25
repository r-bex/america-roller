import {Dice, DiceColor} from "./dice.js"
import {validateNewValue, submitStateValue, canPlaceDie} from "./rules.js"
import {strikeRound, annotateState, annotatePowerUp, clearAnnotations, annotateXCount, confirmPowerups, revertPowerups} from "./annotation.js"
import {GameState} from "./gameState.js"
import {notify, clearNotifications} from "./notifications.js"

const NUM_ROUNDS = 8;
const NUM_TURNS = 3;

let activeDie = null;

function activateDie(leftOrRight: string) {
  if (activeDie !== null) {
    activeDie.setBackground();
  }
  activeDie = gameState.currentDice()[leftOrRight];
  activeDie.setBackground("#FF7216");
}

function deactivateDie(targetColor="#A3A3A3") {
  if (activeDie !== null) {
    activeDie.setBackground(targetColor);
    if (gameState.xActive) {
      deactivateX();
    }
    revertPowerups(gameState);
  }
  activeDie = null;
}

function activateX() {
  gameState.xActive = true;
  document.getElementById('x-button').style.borderColor = 'red';
}

function deactivateX() {
  gameState.xActive = false;
  document.getElementById('x-button').style.borderColor = 'white';
}

export function toggleXActive() {
  if (gameState.xActive) {
    deactivateX();
  } else if (activeDie != null) {
    activateX();
  }
}

function activatePowerUp(powerupClass: string) {
  if (powerupClass.includes("color")) {
    gameState.colorChangeActive = true;
    annotatePowerUp("color", gameState.colorChangesUsed, false);
    console.log("color change on");
  } else if (powerupClass.includes("guard")) {
    gameState.guardActive = true;
    annotatePowerUp("guard", gameState.guardsUsed, false);
    console.log("guard on");
  } else if (powerupClass.includes("dupe")) {
    gameState.dupeActive = true;
    annotatePowerUp("dupe", gameState.dupesUsed, false);
    console.log("dupe on");
  }
}

function deactivatePowerUp(powerupClass: string) {
  if (powerupClass.includes("color")) {
    gameState.colorChangeActive = false;
    clearAnnotations("potential-color-powerup-annotation");
    console.log("color change off");
  } else if (powerupClass.includes("guard")) {
    gameState.guardActive = false;
    clearAnnotations("potential-guard-powerup-annotation");
    console.log("guard off");
  } else if (powerupClass.includes("dupe")) {
    gameState.dupeActive = false;
    clearAnnotations("potential-dupe-powerup-annotation");
    console.log("dupe off");
  }
}

function togglePowerUp(powerupClass: string) {
  if (powerupClass.includes("color")) {
    if (gameState.colorChangeActive) {
      deactivatePowerUp(powerupClass);
    } else {
      activatePowerUp(powerupClass);
    }
  } else if (powerupClass.includes("guard")) {
    if (gameState.guardActive) {
      deactivatePowerUp(powerupClass);
    } else {
      activatePowerUp(powerupClass);
    }
  } else if (powerupClass.includes("dupe")) {
    if (gameState.dupeActive) {
      deactivatePowerUp(powerupClass);
    } else {
      activatePowerUp(powerupClass);
    }
  }
};

function updateRollButton(canRoll: boolean) {
  let canRollColor = "red";
  let noRollColor = "rosybrown";
  if (canRoll) {
    document.getElementById("roll-button").style.backgroundColor = canRollColor;
  } else {
    document.getElementById("roll-button").style.backgroundColor = noRollColor;
  }
}

// ----- the main game loop -----

let gameState = new GameState(NUM_ROUNDS, NUM_TURNS);
document.body.addEventListener('click', function() {
  var target = event.target as HTMLElement; 
  if (activeDie === null && target.className === "die-image") {
    // no currently active die so activate one just selected
    var leftOrRight = target.id === "die-left" ? "left" : "right";
    activateDie(leftOrRight);
  } else if (activeDie !== null && target.className === "die-image") {
    // there is a currently active die but a die has been clicked
    var targetLeftOrRight = target.id === "die-left" ? "left" : "right";
    if (targetLeftOrRight === activeDie.position) {
      // if it's the same one that's currently active then deactivate it
      deactivateDie();
    } else {
      // if it's the other one then switch which die is active
      deactivateDie();
      activateDie(targetLeftOrRight);
    }
  } else if (activeDie !== null && target.className === "state-area") {
    // assign die to state
    let validPlacement = submitStateValue(target.title.toString(), activeDie, gameState.xActive);
    if (validPlacement) {
      activeDie.drawOnMap(target.title, gameState.xActive);
      confirmPowerups(gameState);
      deactivateDie("green");
      if (gameState.xActive) {
        gameState.incrementX();
        deactivateX();
      }
      updateRollButton(gameState.canRoll());
    } else {
      notify("INVALID", 1000);
    }
  } else if (target.className.includes("helper-area")) {
    if (activeDie == null) {
      notify("No die selected", 1000);
    } else {
      togglePowerUp(target.className);
    }
  } else if (activeDie !== null && target.id == "x-button") {
    // x should have been activated
    console.log("Either valid locations or X toggled");
  } else {
    deactivateDie();
  }
}, true); 

// ----- key button functionality -----

export function roll() {
  if (gameState.isGameOver()) {
    reset();
  }
  if (gameState.canRoll()) {
    gameState.newTurn();
  }
  updateRollButton(gameState.canRoll());
}

export function reset() {
  gameState.currentDice().left.clear();
  gameState.currentDice().right.clear();
  clearAnnotations();

  gameState = new GameState(NUM_ROUNDS, NUM_TURNS);
  gameState.render();
}

document.getElementById('roll-button').addEventListener('click', function() {roll();});
document.getElementById('reset-button').addEventListener('click', function() {reset();});
document.getElementById('x-button').addEventListener('click', function() {
  if (activeDie == null) {
    // there is a valid location for the die
    notify("No die selected", 1000);
  } else if (!gameState.xActive && canPlaceDie(activeDie)) {
    notify("Valid locations exist", 1000);
  } else {
    toggleXActive();
  }
});





