const BOARD_WIDTH = 15;
class Game {
  constructor(setup) {
    this.setup = setup;
    this.grid = document.querySelector(".grid");
    this.startButton = document.querySelector("#start");
    this.restartButton = document.querySelector("#restart");
    this.isRunning = false
  }
  start() {
    let gameId = 0;
    let cleanId = 0;
    let start
    let restart
    let board = new Board(this.grid, BOARD_WIDTH, this.setup);
    this.startButton.addEventListener("mousedown", start = () => {
      if (gameId) {
        clearInterval(gameId);
        gameId = null;
        this.gamePause();
      } else {
          this.gameRun();
          gameId = setInterval(() => {
            if (board.noAliensLeft()){
              this.grid.innerHTML = '';
              this.grid.classList.add('youwin');
              clearInterval(gameId);
              this.gamePause();
            } 
            board.moveAliens();
          }, 500);
      }
    });
    board.draw(this.setup);
    this.controls(board);
    this.restartButton.addEventListener("mousedown", restart = () => {
      clearInterval(gameId)
      this.restart(board ,gameId, start, restart)
    })
  }
  restart(board, gameId, start, restart) {
    this.startButton.removeEventListener("mousedown", start)
    this.restartButton.removeEventListener("mousedown", restart)
    clearInterval(gameId);
    gameId = null;
    board = null
    this.grid.innerHTML = '';
    this.gamePause()
    this.start()
  }
  gamePause(){
    this.isRunning = false
  }
  gameRun() {
    this.isRunning = true
  }
  controls(board) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" && this.isRunning) {
        board.moveDefender("left");
      }
      if (e.key === "ArrowRight" && this.isRunning) {
        board.moveDefender("right");
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key === " " && this.isRunning) {
        board.shootRocket();
      }
    });
  }
}

class Setup {
  constructor(alienLocations, gameSpeed) {
    this.alienLocations = alienLocations;
    this.gameSpeed = gameSpeed;
  }
  getAlienLocations() {
    return this.alienLocations;
  }
  getGameSpeed() {
    return this.gameSpeed;
  }
  getMovementPattern() {
    return this.movementPattern;
  }
}

class Square {
  constructor(indexOnBoard, div, lineWidth, borders) {
    this.index = indexOnBoard;
    this.div = div;
    this.lineWidth = lineWidth;
    this.borders = borders;
  }
  isLeftBorder() {
    return this.borders.includes("left");
  }

  isRightBorder() {
    return this.borders.includes("right");
  }

  isGround() {
    return this.borders.includes("ground");
  }

  isTop() {
    return this.index < this.lineWidth;
  }

  setCharacter(character) {
    this.character = character;
    let cssClass = character.getCssClass();
    this.div.classList.clear;
    this.div.classList.add(cssClass);
  }
  setEmpty() {
    this.div.className = "";
    this.character = null;
  }

  setGround() {
    this.div.classList.add("ground");
  }
  hasAlien() {
    return this.character != null && this.character.type === "alien";
  }
  removeDeadAliens() {
    if (this.character != null && this.character.health === 0) {
      this.setEmpty();
    }
  }

  hasDefender() {
    return this.classList.contains("defender");
  }
  topOfBoard() {
    return this.indexOnBoard <= this.lineWidth;
  }
  pickCharacterUp() {
    let c = this.character;
    this.setEmpty();
    return c;
  }
  hasDeadAlien() {
    return this.character.type === "alien" && this.character.isDead();
  }
}

class Defender {
  constructor(imageCssClass, lineWidth) {
    this.imageCssClass = imageCssClass;
    this.lineWidth = lineWidth;
  }
  getCssClass() {
    return this.imageCssClass;
  }
}

class Rocket {
  constructor(imageCssClass, index, board) {
    this.imageCssClass = imageCssClass;
    this.index = index;
    this.board = board;
  }
  isAlien() {
    return false;
  }
  upTheBoard() {
    newIndex = this.indexOnBoard - this.board.width;
    return newIndex;
  }
  getCssClass() {
    return this.imageCssClass;
  }
  moveTo(square) {
    square.setCharacter(this);
  }
}

class Alien {
  constructor(health, square) {
    this.cssClassByHealth = ["dead", "invader", "intruder"];
    this.health = health;
    this.square = square;
    this.type = "alien";
  }
  getCssClass() {
    return this.cssClassByHealth[this.health];
  }
  isAlien() {
    return true;
  }
  moveTo(square) {
    square.setCharacter(this);
  }
  isDead() {
    return this.health === 0;
  }
}

function createInvader(health, indexOnBoard) {
  let alien = new Alien(health, indexOnBoard);
  return alien;
}

const DIRECTION_LEFT = -1;
const DIRECTION_RIGHT = 1;
const DIRECTION_NON = 0;

class Board {
  constructor(parent, width, setup) {
    this.parent = parent;
    this.width = width;
    this.aliens = [];
    this.squares = [];
    this.setupObject = setup.getAlienLocations();
    this.alienLocations = Object.keys(this.setupObject).map(Number);
    this.initialAlienLocations = this.alienLocations;
    this.alienHealthLevels = Object.values(this.setupObject);
    this.direction = DIRECTION_RIGHT;
    this.previousDirection = DIRECTION_RIGHT;
    this.defenderLocation = this.defenderStartPosition();
    this.movementCounter = 0;
  }

  createChildSquareAddToSquares(index) {
    let div = document.createElement("div");
    this.parent.appendChild(div);
    const borders = [];
    if (index >= this.bottomRow()) {
      borders.push("ground");
    } else if (index % this.width === 0) {
      borders.push("left");
    } else if (index % this.width === this.width - 1) {
      borders.push("right");
    }
    this.squares.push(new Square(index, div, this.width, borders));
  }
  bottomRow() {
    return this.width * this.width - this.width;
  }
  defenderStartPosition() {
    return (
      this.width * this.width - (this.width + Math.floor(this.width / 2) + 1)
    );
  }

  draw() {
    for (let i = 0; i < this.width * this.width; i++) {
      this.createChildSquareAddToSquares(i);
      if (this.alienLocations.includes(i)) {
        let health = this.alienHealthLevels.shift();
        let invader = createInvader(health, this.squares[i].index);
        this.squares[i].setCharacter(invader);
      }
      if (i >= this.bottomRow()) {
        this.squares[i].setGround();
      }
    }
    let defender = new Defender("defender", this.width);
    this.squares[this.defenderLocation].setCharacter(defender);
  }

  moveAliens() {
    this.determineDirection();
    this.alienLocations = this.calculateAlienLocations();
    for (let i = 0; i < this.squares.length - 1; i++) {
      if (this.squares[i].hasAlien()) {
        let c = this.squares[i].pickCharacterUp();
        this.aliens.push(c);
      }
    }

    for (let i = 0; i < this.squares.length; i++) {
      if (this.alienLocations.includes(i)) {
        let c = this.aliens.shift();
        this.squares[i].setCharacter(c);
      }
    }
  }

  calculateAlienLocations() {
    return this.squares
      .filter((square) => square.hasAlien())
      .map((square) => square.index + this.direction);
  }

  noAliensLeft() {
    return this.calculateAlienLocations().length === 0 
  }

  determineDirection() {
    let nextMove = calcNextAlienMove(
      this.previousDirection,
      this.movementCounter,
      5,
      this.directionDown()
    );
    this.direction = nextMove.direction;
    this.previousDirection = nextMove.previousDirection;
    this.movementCounter = nextMove.movementCounter;
  }

  directionDown() {
    return this.width;
  }

  moveDefender(direction) {
    let defender = this.pickDefenderUp();
    let nextMove = this.calculateNextDefenderMove(direction);
    this.defenderMove(nextMove);
    this.putDown(defender);
  }
  calculateNextDefenderMove(direction) {
    if (this.defenderCanMoveLeft(direction)) {
      return DIRECTION_LEFT;
    }
    if (this.defenderCanMoveRight(direction)) {
      return DIRECTION_RIGHT;
    }
    return DIRECTION_NON;
  }
  defenderMove(nextMove) {
    return (this.defenderLocation = this.defenderLocation + nextMove);
  }
  defenderCanMoveRight(direction) {
    return direction === "right" && this.defenderNotAtRightBorder();
  }
  defenderCanMoveLeft(direction) {
    return direction === "left" && this.defenderNotAtLeftBorder();
  }
  pickDefenderUp() {
    return this.squares[this.defenderLocation].pickCharacterUp();
  }
  putDown(defender) {
    return this.squares[this.defenderLocation].setCharacter(defender);
  }
  defenderNotAtLeftBorder() {
    return !this.squares[this.defenderLocation].isLeftBorder();
  }
  defenderNotAtRightBorder() {
    return !this.squares[this.defenderLocation].isRightBorder();
  }

  shootRocket() {
    let rocketId;
    let rocket = this.createRocket();
    let rocketLocation = this.getIndexOf(rocket);
    let nextRocketLocation = this.getNextIndexOf(rocket);
    this.squareAt(rocketLocation).setCharacter(rocket);
    rocketId = setInterval(() => {
      let rocketInFlight = this.liftRocketAt(rocketLocation);
      // Sometimes if the interval is just right an alien gets picked up
      // instead of the rocket, the following if statement takes care of
      // this situation by setting the square back to rocket if it is an alien
      if (rocketInFlight && rocketInFlight.isAlien()) {
        this.squareAt(rocketLocation).setCharacter(rocket);
        rocketInFlight = this.liftRocketAt(rocketLocation);
      }
      this.updateIndexOf(rocket);
      rocketLocation = this.getIndexOf(rocket);
      nextRocketLocation = this.update(nextRocketLocation);
      if (this.boardTopIs(rocketLocation)) {
        clearInterval(rocketId);
        this.waitAndEraseRocketAt(rocketLocation);
      }
      // if there is a next square remove dead alien on it if there is one
      // and if it is an alien erase the rocket, reduce the aliens health by
      // one and set the square's css according to the new alien's health level
      if (this.squareAt(nextRocketLocation)) {
        this.squareAt(nextRocketLocation).removeDeadAliens();
        if (this.squareAt(nextRocketLocation).hasAlien()) {
          clearInterval(rocketId);
          this.waitAndEraseRocketAt(rocketLocation);
          this.reduceAlienHealthByOneAt(nextRocketLocation);
          this.updateAlienHitAt(nextRocketLocation);
        }
      }
      // After checking and preparing all conditions we put down the rocket in the
      // next location up the board whic after update is rocketLocation
      this.squareAt(rocketLocation).setCharacter(rocketInFlight);
    }, 100);
  }
  updateAlienHitAt(nextRocketLocation) {
    let alienHit = this.squareAt(nextRocketLocation).pickCharacterUp();
    if (alienHit)
      this.squareAt(nextRocketLocation).setCharacter(alienHit);
  }
  reduceAlienHealthByOneAt(nextRocketLocation) {
    this.squareAt(nextRocketLocation).character.health -= 1;
    this.squareAt(nextRocketLocation).removeDeadAliens()
  }
  waitAndEraseRocketAt(rocketLocation) {
    setTimeout(() => {
      this.liftRocketAt(rocketLocation);
    }, 100);
  }
  boardTopIs(rocketLocation) {
    return this.squareAt(rocketLocation).isTop();
  }
  update(nextRocketLocation) {
    return nextRocketLocation + this.directionUp();
  }
  updateIndexOf(rocket) {
    rocket.index = rocket.index + this.directionUp();
  }
  liftRocketAt(rocketLocation) {
    return this.squareAt(rocketLocation).pickCharacterUp();
  }
  getNextIndexOf(rocket) {
    return rocket.index + this.directionUp();
  }
  getIndexOf(rocket) {
    return rocket.index;
  }
  createRocket() {
    return new Rocket("rocket", this.squareAboveDefender(), this);
  }

  squareAboveDefender() {
    return this.defenderLocation - this.width;
  }

  squareAt(rocketLocation) {
    return this.squares[rocketLocation];
  }

  directionUp() {
    return -this.width;
  }
}
function calcNextAlienMove(
  previousDirection,
  movementCounter,
  numberOfMoves,
  down
) {
  if (movementCounter < numberOfMoves) {
    return {
      movementCounter: increaseByOne(movementCounter),
      previousDirection: previousDirection,
      direction: previousDirection,
    };
  }
  if (movementCounter === numberOfMoves) {
    return {
      movementCounter: zero(),
      previousDirection: getTheOppositeOf(previousDirection),
      direction: down,
    };
  }
}

function increaseByOne(movementCounter) {
  return movementCounter + 1;
}

function zero() {
  return 0;
}

function getTheOppositeOf(direction) {
  return direction * -1;
}

document.addEventListener("DOMContentLoaded", () => {
  let alienInvaders = {
    0: 2, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1,
    // 15: 2, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1, 21: 1, 22: 1, 23: 1, 24: 1,
    // 30: 2, 31: 2, 32: 2, 33: 2, 34: 2, 35: 2, 36: 2, 37: 2, 38: 2, 39: 2,
  };
  setup = new Setup(alienInvaders, []);
  game = new Game(setup);
  game.start();
});
