class Game {
    constructor(setup) {
        this.setup = setup
    }
    start() {
        let alienMovementId
        let grid = document.querySelector('.grid')
        let board = new Board(grid, 15, this.setup)
        board.draw(this.setup)
        this.controls(board)
        alienMovementId = setInterval(() => { board.moveAliens() }, 500000)
        const startButton = document.querySelector('#level1')
        startButton.addEventListener('mousedown', () => {
            board.moveAliens()
        })
    }
    controls(board) {
        document.addEventListener('keydown', (e) => {
            if (e.keyCode === 37) {
                board.moveDefender('left')
            }
            if (e.keyCode === 39) {
                board.moveDefender('right')
            }

        })
        document.addEventListener('keyup', (e) => {
            if (e.keyCode === 32) {
                board.shootRocket()
            }
        })
    }

}

class Setup {
    constructor(alienLocations, gameSpeed) {
        this.alienLocations = alienLocations
        this.gameSpeed = gameSpeed
    }
    getAlienLocations() {
        return this.alienLocations
    }
    getGameSpeed() {
        return this.gameSpeed
    }
    getMovementPattern() {
        return this.movementPattern
    }
}

class Square {
    constructor(indexOnBoard, div, lineWidth, borders) {
        this.index = indexOnBoard
        this.div = div
        this.lineWidth = lineWidth
        this.borders = borders
    }
    isLeftBorder() {
        return this.borders.includes('left')
    }

    isRightBorder() {
        return this.borders.includes('right')
    }

    isGround() {
        return this.borders.includes('ground')
    }

    isTop() {
        return this.index < this.lineWidth
    }

    setCharacter(character) {
        this.character = character
        let cssClass = character.getCssClass()
        this.character.square = this.index
        this.div.classList.clear
        this.div.classList.add(cssClass)
    }
    setEmpty() {
        this.div.className = ""
        this.character = null
    }

    setGround() {
        this.div.classList.add('ground')
    }
    hasAlien() {
        return (this.character != null && this.character.type === 'alien')
    }
    hasDefender() {
        return (this.classList.contains('defender'))
    }
    topOfBoard() {
        return (this.indexOnBoard <= this.lineWidth)
    }
    pickCharacterUp() {
        let c = this.character
        this.setEmpty()
        return c
    }
    hasDeadAlien() {
        return (this.character.type === 'alien' && this.character.isDead())
    }
}

class Defender {
    constructor(imageCssClass, lineWidth) {
        this.imageCssClass = imageCssClass
        this.lineWidth = lineWidth
    }
    getCssClass() {
        return this.imageCssClass
    }
    moveTo(square) {
        square.setCharacter(this)
    }
}

class Rocket {
    constructor(imageCssClass, index, board) {
        this.imageCssClass = imageCssClass
        this.index = index
        this.board = board
    }
    fly() {
        let x = this.board.squares[this.indexOnBoard].pickCharacterUp()
        this.indexOnBoard = this.upTheBoard()
        this.board.squares[this.indexOnBoard].setCharacter(x)

    }
    upTheBoard() {
        newIndex = this.indexOnBoard - this.board.width
        return newIndex
    }
    getCssClass() {
        return this.imageCssClass
    }
    moveTo(square) {
        square.setCharacter(this)
    }
}

class Alien {
    constructor(name, health, square, lineWidth) {
        this.name = name
        this.imageCssClass = ['dead', 'invader', 'intruder']
        this.health = health
        this.square = square
        this.lineWidth = lineWidth
        this.type = 'alien'
    }
    getCssClass() {
        return this.imageCssClass[this.health]
    }
    moveTo(square) {
        square.setCharacter(this)
    }
    isDead() {
        return this.health === 0
    }
}

function createInvader(health, indexOnBoard, lineWidth) {
    let alien = new Alien('invader', health, indexOnBoard, lineWidth)
    return alien
}

function createIntruder(indexOnBoard, lineWidth) {
    return new Alien('intruder', 2, indexOnBoard, lineWidth)
}
const DIRECTION_LEFT = -1
const DIRECTION_RIGHT = 1
const DIRECTION_NON = 0

class Board {
    constructor(parent, width, setup) {
        this.parent = parent
        this.width = width
        this.aliens = []
        this.squares = []
        this.setup = setup
        this.setupObject = setup.getAlienLocations()
        this.alienLocations = Object.keys(this.setupObject).map(Number)
        this.alienHealthLevels = Object.values(this.setupObject)
        this.direction = 1
        this.defenderLocation = this.defenderStartPosition()

    }

    createChildSquareAddToSquares(index) {
        let div = document.createElement('div')
        this.parent.appendChild(div)
        const borders = []
        if (index >= this.bottomRow()) {
            borders.push('ground')
        } else if (index % this.width === 0) {
            borders.push('left')
        } else if (index % this.width === this.width - 1) {
            borders.push('right')
        }
        this.squares.push(new Square(index, div, this.width, borders))
    }
    bottomRow() {
        return (this.width * this.width - this.width)
    }
    defenderStartPosition() {
        return this.width * this.width - (this.width + Math.floor(this.width / 2) + 1)
    }

    draw() {
        for (let i = 0; i < this.width * this.width; i++) {
            this.createChildSquareAddToSquares(i)
            if (this.alienLocations.includes(i)) {
                let health = this.alienHealthLevels.shift()
                let invader = createInvader(health, this.squares[i].index, this.width)
                this.squares[i].setCharacter(invader)
            }
            if (i >= this.bottomRow()) {
                this.squares[i].setGround()
            }
        }
        let defender = new Defender('defender', this.width)
        this.squares[this.defenderLocation].setCharacter(defender)
    }

    moveAliens() {
        this.direction = this.determineDirection()
        this.alienLocations = this.calculateAlienLocations()
        for (let i = 0; i < this.squares.length - 1; i++) {
            if (this.squares[i].hasAlien()) {
                let c = this.squares[i].pickCharacterUp()
                this.aliens.push(c)
            }
        }
        for (let i = 0; i < this.squares.length - 1; i++) {
            if (this.alienLocations.includes(i)) {
                let c = this.aliens.shift()
                this.squares[i].setCharacter(c)
            }
        }
    }

    calculateAlienLocations() {
        return this.squares
            .filter(square => square.hasAlien())
            .map(square => square.index + this.direction)
    }

    determineDirection() {
        let direction = this.direction
        if (this.aliensHitBorder()) {
            return this.directionDown()
        }
        if (this.aliensMovingDown()) {
            if (this.aliensAtLeftBorder()) {
                return DIRECTION_RIGHT
            }
            return DIRECTION_LEFT
        }
        return direction
    }

    directionDown() {
        return this.width
    }

    aliensHitBorder() {
        return (this.aliensAtLeftBorder() && this.aliensMovingLeft()) || (this.aliensAtRightBorder() && this.aliensMovingRight())
    }

    aliensAtLeftBorder() {
        const leftMostAlien = this.alienLocations[0]
        return this.squares[leftMostAlien].isLeftBorder()
    }

    aliensMovingLeft() {
        return this.direction === DIRECTION_LEFT
    }

    aliensAtRightBorder() {
        const rightMostAlien = this.alienLocations[this.alienLocations.length - 1]
        return this.squares[rightMostAlien].isRightBorder()
    }

    aliensMovingRight() {
        return this.direction === DIRECTION_RIGHT
    }

    aliensMovingDown() {
        return this.direction === this.directionDown()
    }

    moveDefender(direction) {
        let defender = this.pickDefenderUp()
        let nextMove = this.calculateNextDefenderMove(direction)
        this.defenderMove(nextMove)
        this.putDown(defender)
    }
    calculateNextDefenderMove(direction) {
        if (this.defenderCanMoveLeft(direction)) {
            return DIRECTION_LEFT
        }
        if (this.defenderCanMoveRight(direction)) {
            return DIRECTION_RIGHT
        }
        return DIRECTION_NON
    }
    defenderMove(nextMove) {
        return this.defenderLocation = this.defenderLocation + nextMove
    }
    defenderCanMoveRight(direction) {
        return direction === 'right' && this.defenderNotAtRightBorder()
    }
    defenderCanMoveLeft(direction) {
        return direction === 'left' && this.defenderNotAtLeftBorder()
    }
    pickDefenderUp() {
        return this.squares[this.defenderLocation].pickCharacterUp()
    }
    putDown(defender) {
        return this.squares[this.defenderLocation].setCharacter(defender)
    }
    defenderNotAtLeftBorder() {
        return !this.squares[this.defenderLocation].isLeftBorder()
    }
    defenderNotAtRightBorder() {
        return !this.squares[this.defenderLocation].isRightBorder()
    }

    shootRocket() {
        let rocketId
        let rocket = new Rocket('rocket', this.defenderLocation - this.width, this)
        let rocketLocation = rocket.index
        let nextRocketLocation = rocket.index - this.width
        let deadAlien
        this.squareAt(rocketLocation).setCharacter(rocket)
        rocketId = setInterval(() => {
            let rocketInFlight = this.squareAt(rocketLocation).pickCharacterUp()
            if (deadAlien) {
                console.log(`deadAlien= ${deadAlien.square}`)
                this.squares[deadAlien.square].setCharacter(deadAlien)
            }
            rocketLocation -= this.width
            nextRocketLocation -= this.width
            if (this.squareAt(rocketLocation).isTop()) {
                clearInterval(rocketId)
                setTimeout(() => { this.squareAt(rocketLocation).pickCharacterUp() }, 100)
            }
            if (this.squareAt(nextRocketLocation)) {
                if (this.squareAt(nextRocketLocation).hasAlien()) {
                    if (!this.squareAt(nextRocketLocation).character.isDead()) {
                        setTimeout(() => { this.squareAt(rocketLocation).pickCharacterUp() }, 200)
                        clearInterval(rocketId)
                        this.squareAt(nextRocketLocation).character.health -= 1
                        let alienHit = this.squareAt(nextRocketLocation).pickCharacterUp()
                        this.squareAt(nextRocketLocation).setCharacter(alienHit)
                    } else if (this.squareAt(nextRocketLocation).character.isDead()) {
                        // deadAlien = this.squareAt(nextRocketLocation).pickCharacterUp()
                        // let newDeadAlien = new Alien('invader', 0, 0, 0)
                        // setTimeout(() => { this.squareAt(nextRocketLocation).setCharacter(newDeadAlien) }, 100)
                        // setTimeout(() => { console.log(this.squareAt(nextRocketLocation).character) }, 190)
                        // console.log('here')
                    }
                }
            }
            // if (this.squareAt(rocketLocation).character) {
            //     console.log(`this.squareAt(rocketLocation).character = ${this.squareAt(rocketLocation).hasDeadAlien()}`)
            //     if (this.squareAt(rocketLocation).hasDeadAlien()) {
            //         let anotherDeadAlien = this.squareAt(rocketLocation).pickCharacterUp()
            //         this.squareAt(rocketLocation).setCharacter(rocketInFlight)
            //         setTimeout(() => { this.squareAt(rocketLocation).setCharacter(anotherDeadAlien) }, 100)
            //     }
            // }
            this.squareAt(rocketLocation).setCharacter(rocketInFlight)



        }, 100);
    }

    squareAt(rocketLocation) {
        return this.squares[rocketLocation]
    }


    directionUp() {
        return -this.width
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // let grid = document.querySelector('.grid')
    let alienInvaders = {
        0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1,
        15: 1, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2, 23: 2, 24: 2,
        30: 1, 31: 1, 32: 1, 33: 2, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1,
    }
    setup = new Setup(alienInvaders, [])
    // board = new Board(grid, 15, setup)
    // board.draw(setup)
    const startButton = document.querySelector('#start')
    startButton.addEventListener('mousedown', () => {
        board.moveAliens()
    })
    game = new Game(setup)
    game.start()
    // game.controls()



})





            // let rocketInFlight = this.squareAt(rocketLocation).pickCharacterUp()
            // console.log(rocketInFlight)
            // if (this.squareAt(nextRocketLocation).hasAlien()) {
            //     clearInterval(rocketId)
            // }
            // if(this.squareAt(nextRocketLocation).isTop()) {
            //     clearInterval(rocketId)
            // }
            // this.squareAt(nextRocketLocation).setCharacter(rocketInFlight)
            // rocketLocation -= this.width
