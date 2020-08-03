// TODO How to make number => DiceNumber in types?
function rollDie(sides = 6) {
    return Math.ceil(Math.random() * sides);
}
export class Dice {
    constructor(color, diceIndex) {
        this.assigned = false;
        this.selected = false;
        this.number = rollDie();
        this.color = color;
        this.position = diceIndex % 2 === 0 ? "left" : "right";
        let parentDivId = this.position === "left" ? "die1-div" : "die2-div";
        this.parentDiv = document.getElementById(parentDivId);
    }
    setBackground(targetColor = "#A3A3A3") {
        this.parentDiv.style.backgroundColor = targetColor;
    }
    render() {
        this.setBackground();
        let dieImg = document.createElement("img");
        dieImg.id = "die-" + this.position.toString();
        dieImg.className = "die-image";
        dieImg.src = "assets/dice/" + this.color + "-" + this.number.toString() + ".png";
        if (this.parentDiv.hasChildNodes()) {
            this.parentDiv.replaceChild(dieImg, this.parentDiv.firstChild);
        }
        else {
            this.parentDiv.appendChild(dieImg);
        }
    }
    clear() {
        let oldChild = this.parentDiv.childNodes[0];
        this.parentDiv.removeChild(oldChild);
    }
}
