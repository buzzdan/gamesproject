document.addEventListener('DOMContentLoaded', () => {
    const squares = document.querySelectorAll('.grid div')
    const resultDisplay = document.querySelector('#result')
    const timeDisplay = document.querySelector('#time')
    const startButton = document.querySelector('#start')
    const reStartButton = document.querySelector('#restart')
    let width = 15
    let currentShooterIndex = 202
    let currentInvaderIndex = 0
    let alienInvadersTakenDown = []
    let result = 0
    let time = 0
    let direction = 1
    let invaderId = 0
    let timerId

    disablePlayer()

    reStartButton.addEventListener('mousedown', () => {
        restart()
    })

    startButton.addEventListener('mousedown', () => {
            if (timerId && invaderId) {
                clearInterval(timerId)
                clearInterval(invaderId)
                timerId = null
                disablePlayer(shoot,moveShooter)
            } else {
                timerId = setInterval(addTime, 1000)
                invaderId = setInterval(moveInvaders, 500)
                document.addEventListener('keyup', shoot )
                document.addEventListener('keydown', moveShooter)
            }
        })

    function restart() {
        for (let i = 0; i <= alienInvaders.length -1; i++) {
            squares[alienInvaders[i]].classList.remove('invader')
        }
        for (let i = 0; i <= alienInvaders.length -1; i++) {
            alienInvaders[i] = restartInvaders[i]
        }
        // alienInvaders.forEach( invader => squares[invader].classList.remove('invader'))
        clearInterval(invaderId)
        clearInterval(timerId)
        disablePlayer(shoot,moveShooter)
        width = 15
        currentShooterIndex = 202
        currentInvaderIndex = 0
        alienInvadersTakenDown = []
        result = 0
        time = 0
        invaderId = 0
        timerId = 0
        resultDisplay.innerHTML = 0
        timeDisplay.innerHTML = 0
        draw()
    }

    function addTime() {
        time += 1
        timeDisplay.innerHTML = time
    }

    // timerId = setInterval(addTime, 1000)

    // define the alien invaders
    const alienInvaders = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39 
    ]

    let restartInvaders = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39 
    ]

    function draw() {
        // draw bthe alien invaders
        alienInvaders.forEach( invader => squares[currentInvaderIndex + invader].classList.add('invader'))
        // draw the shooter
        squares[currentShooterIndex].classList.add('shooter')
    }
    draw()

    // move the shooter along a line
    function moveShooter(e) {
        squares[currentShooterIndex].classList.remove('shooter')
        switch(e.keyCode) {
            case 37:
                if(currentShooterIndex % width !== 0) currentShooterIndex -=1
                break
            case 39:
                if(currentShooterIndex % width < width - 1) currentShooterIndex +=1
                break
        }
        squares[currentShooterIndex].classList.add('shooter')
    }
    // document.addEventListener('keydown', moveShooter)

    // move the alien invaders
    function moveInvaders() {
        const leftEdge = alienInvaders[0] % width === 0
        const rightEdge = alienInvaders[alienInvaders.length -1] % width === width -1

        if ((leftEdge && direction === -1) || (rightEdge && direction === 1)) {
            direction = width
        } else if (direction === width) {
            if (leftEdge) direction = 1
            else direction = -1
        }
        for (let i = 0; i <= alienInvaders.length -1; i++) {
            squares[alienInvaders[i]].classList.remove('invader')
        }
        for (let i = 0; i <= alienInvaders.length -1; i++) {
            alienInvaders[i] += direction
        }
        for (let i = 0; i <= alienInvaders.length -1; i++) {
            if (!alienInvadersTakenDown.includes(i)) {
                squares[alienInvaders[i]].classList.add('invader')
            }
            
        }

        // decide a game over
        if (squares[currentShooterIndex].classList.contains('invader', 'shooter')) {
            resultDisplay.textContent = 'Game Over'
            squares[currentShooterIndex].classList.add('boom')
            clearInterval(invaderId)
            clearInterval(timerId)
            disablePlayer(shoot, moveShooter)
        }

        for (let i = 0; i <= alienInvaders.length -1; i++) {
            if (alienInvaders[i] > squares.length - (width-1)) {
                resultDisplay.textContent = 'Game Over'
                clearInterval(invaderId)
                clearInterval(timerId)
                disablePlayer(shoot, moveShooter)

            }
        }
        
        // declare a win
        if (alienInvadersTakenDown.length === alienInvaders.length) {
            clearInterval(invaderId)
            clearInterval(timerId)
            disablePlayer(shoot, moveShooter)
        }
    }
    // invaderId = setInterval(moveInvaders, 500)

    // Shoot at aliens
    function shoot(e) {
        let laserId
        let currentLaserIndex = currentShooterIndex
        // Move the laser from the shooter to the alien invaders
        function moveLaser() {
            squares[currentLaserIndex].classList.remove('laser')
            currentLaserIndex -= width
            squares[currentLaserIndex].classList.add('laser')
            if (squares[currentLaserIndex].classList.contains('invader')) {
                clearInterval(laserId)
                squares[currentLaserIndex].classList.remove('laser')
                squares[currentLaserIndex].classList.remove('invader')
                squares[currentLaserIndex].classList.add('boom')

                setTimeout(() => squares[currentLaserIndex].classList.remove('boom'), 250)
                

                const alienTakenDown = alienInvaders.indexOf(currentLaserIndex)
                alienInvadersTakenDown.push(alienTakenDown)
                result++
                resultDisplay.textContent = result
            }

            if (currentLaserIndex < width) {
                clearInterval(laserId)
                setTimeout(() => squares[currentLaserIndex].classList.remove('laser'), 100)
            }
        }

        switch(e.keyCode) {
            case 32:
                laserId = setInterval(moveLaser, 100)
                break
        }
    }
    // document.addEventListener('keyup', shoot )
})

function disablePlayer(shoot, moveShooter) {
    document.removeEventListener('keyup', shoot)
    document.removeEventListener('keydown', moveShooter)
}

