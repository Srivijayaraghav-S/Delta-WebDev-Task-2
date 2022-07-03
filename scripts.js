let listOfObject = []
let ballItem
let spikes = []
let originalValues = {
    spikeHeight: 30,
    spikeWidth: 30,
    platformWidth: 320,
    platformThick: 16,
    ballRadius: 30,
    score: 0,
    health: 0,
    respawnFlag: 0,
}
var ansArray = []
var arrayOfScores = []
let spikeHeight = 30
let spikeWidth = 30
let platformWidth = 320
let platformThick = 16
let ballRadius = 30
let score = 0;
//let health = 0;
let respawnFlag = 0;
var hsc = 0
localStorage.setItem("hsc", 0)
let frame;
let healthOrbs = []
let gs = document.getElementById("GameStuff")
let m2 = document.getElementById("myModal2")
class HealthPowerUpP {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.dy = -0.2
        this.radius = ballRadius
    }
    checkBall() {
        if (((ballItem.x - this.x) ** 2 + (ballItem.y - this.y) ** 2) <= (ballRadius + ballRadius) ** 2) {
            if (health < 3) {
                health++
            }
            removeBallFromList(this)
        }
    }
}
class PlatformObject {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.dx = 0.1
        this.dy = -0.4
        this.col = true
    }
    checkBall() {
        if ((this.y - (ballItem.y + ballItem.dy) <= ballRadius)
            && (0 < (this.y - (ballItem.y + ballItem.dy)))
            && this.x <= (ballItem.x + ballItem.dx)
            && (ballItem.x + ballItem.dx) <= this.x + platformWidth) {
            ballItem.reverseVeloTop()
        } if ((((ballItem.y + ballItem.dy - this.y) <= ballRadius)
            && (0 < (ballItem.y + ballItem.dy - this.y)))
            && (this.x <= ballItem.x && ballItem.x <= this.x + platformWidth)) {
            ballItem.reverseVeloBottom()
        }
        if (((Math.abs(this.x - ballItem.x - ballItem.dx) < ballRadius) || ((Math.abs(this.x + platformWidth - ballItem.x - ballItem.dx) < ballRadius)))
            && (!((this.x + 4 < ballItem.x) && (ballItem.x < (this.x + platformWidth))))
            && ((this.y - ballRadius * 0.4) < (ballItem.y) && (ballItem.y) < (this.y + platformThick + ballRadius * 0.4))
            && (this.col)
            && (Math.abs(ballItem.dx) > 1)) {
            this.col = false
            ballItem.reverseVeloSide()
        }
        if (Math.abs(this.x - ballItem.x) > ballRadius * 1.2) {
            this.col = true;
        }
    }
    upwardplatform() {
        this.y += this.dy
    }
}
class BallObject {
    constructor(x, y, radius) {
        this.x = x
        this.y = y
        this.dx = 0
        this.dy = .1
        this.radius = radius
        this.pause = false
    }
    update() {
        if (!this.pause) {
            this.x += this.dx
            this.y += this.dy
            this.dy += 0.1
        }
    }
    reverseVeloBottom() {
        if (!(this.pause)) {
            this.dy = -(this.dy) * .9
        }
    }
    reverseVeloTop() {
        if (!(this.pause)) {
            this.dy = -(this.dy) * .6 - .4 - .25
        }
    }
    reverseVeloSide() {
        if (!(this.pause)) {
            this.dx = -(this.dx)
        }
    }
    horizontalVelo(left) {
        if (!(this.pause)) {
            if (1.3 < this.dx < 1.3) {
                if (left) {
                    this.dx -= .5
                } else {
                    this.dx += .5
                }
            }
        }
    }
    resetVelo() {
        this.dx = 0
    }
    updateScore() {
        if (!this.pause) {
            score += Math.floor(((this.dx * this.dx) + (this.dy * this.dy)) / 10)
        }
    }
    respawnBall() {
        const canvas = document.getElementById('canvasTag')
        if (respawnFlag == 0) {
            respawnFlag++
            setTimeout(() => {
                health--;
                this.x = canvas.width / 2;
                this.y = canvas.height / 8;
                this.dx = 0;
                this.dy = 0;
                this.pause = false
                respawnFlag = 0
            }, 100)
        }
    }
    deadBall() {
        let canvas = document.getElementById('canvasTag')
        if (this.y <= spikeHeight) {
            this.pause = true
            this.respawnBall()
        }
        if (this.x >= canvas.width || this.x <= 0) {
            this.pause = true
            this.respawnBall()
        }
        if (this.y >= canvas.height) {
            this.pause = true
            this.respawnBall()
        }
    }
}
const removeBallFromList = (object) => {
    let finalObject = healthOrbs.filter((b) => b.x != object.x || b.y != object.y)
    healthOrbs = finalObject
    if (health < 5) {
        health++
    }
}
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
const animateSpikes = () => {
    const canvas = document.getElementById('canvasTag')
    let ctx = canvas.getContext('2d')
    let height = spikeHeight
    let width = spikeWidth
    for (let i = 0; i < (canvas.width / width); i++) {
        ctx.beginPath()
        ctx.moveTo(i * width + 0.1, 0)
        ctx.lineTo(i * width + width / 2 + 0.1, height);
        ctx.lineTo((i + 1) * width + 0.1, 0)
        ctx.fillStyle = "red"
        ctx.fill()
    }
}
const shiftAndFixPlatform = () => {
    listOfObject.shift()
    const canvas = document.getElementById('canvasTag')
    let depth = randomIntFromInterval((canvas.height / 7) * (6), (canvas.height) - 10)
    let start = randomIntFromInterval(0, canvas.width - platformWidth);
    let healthPoint = Math.random() < 0.2 ? true : false
    let platform = new PlatformObject(start, depth, healthPoint);
    listOfObject.push(platform)
}
const inScreenTile = (Tile) => {
    if (Tile.y < spikeHeight) {
        return false
    } else {
        return true;
    }
}
const animatePlatforms = () => {
    const canvas = document.getElementById('canvasTag')
    let ctx = canvas.getContext('2d')
    for (let i = 0; i < 6; i++) {
        let platform = listOfObject[i]
        if (inScreenTile(platform)) {
            ctx.fillStyle = "gray"
            ctx.fillRect(platform.x, platform.y, platformWidth, platformThick)
            platform.checkBall()
            platform.upwardplatform()
        } else {
            shiftAndFixPlatform()
            i--;
        }
    }
}
const animateUserBall = () => {
    const canvas = document.getElementById('canvasTag')
    let ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.arc(ballItem.x, ballItem.y, ballRadius, 0, Math.PI * 2, true)
    ctx.fillStyle = "blue";
    ctx.fill()
    ballItem.update()
    ballItem.deadBall()
    ballItem.updateScore()
}
const clearScreen = () => {
    const canvas = document.getElementById('canvasTag')
    let context = canvas.getContext('2d')
    context.fillStyle = "pink"
    context.clearRect(0, 0, canvas.width, canvas.height);
}
const makeBall = () => {
    const canvas = document.getElementById('canvasTag')
    ballItem = new BallObject(canvas.width / 2, canvas.height / 8, 30)
}
const makePlatforms = () => {
    const canvas = document.getElementById('canvasTag')
    for (let i = 0; i < 6; i++) {
        let depth = randomIntFromInterval((canvas.height / 7) * (i + 1), (canvas.height / 7) * (i + 2) - 10)
        let start = randomIntFromInterval(0, canvas.width - platformWidth);
        let healthPoint = Math.random() < 0.2 ? true : false
        let platform = new PlatformObject(start, depth, healthPoint);
        listOfObject.push(platform)
    }
}
const moveMobileBall = (e) => {
    console.log(e)
}
const movesidewaysBall = (e) => {
    if (e.key == 'ArrowLeft') {
        ballItem.horizontalVelo(true)
    } else if (e.key == 'ArrowRight') {
        ballItem.horizontalVelo(false)
    }
}
const ballControll = () => {
    window.addEventListener('keydown', movesidewaysBall)
    if (screen.orientation) {
        console.log(screen.orientation)
    }
}
const animateHeart = () => {
    const canvas = document.getElementById('canvasTag')
    let ctx = canvas.getContext('2d')
    let width = canvas.width / 6
    for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.arc((width / 4) * (i + 1), spikeHeight * 2, ballRadius / 3, 0, Math.PI * 2, true)
        if (i < health) {
            ctx.fillStyle = 'orange'
        } else {
            ctx.fillStyle = 'lightblue'
        }
        ctx.fill()
    }
}
const updateUserScore = () => {
    document.getElementById('ScorePTag').innerText = `Score: ${score}`
}
const removeAllEventListeners = () => {

}

const checkGameOver = () => {
    if (health == 0) {
        removeAllEventListeners()
        console.log(health)
        console.log("now2")
        console.log(["score", score])
        window.cancelAnimationFrame(frame)
        var sc1 = document.getElementById('ys')
        sc1.innerText = `Your Score: ${score}`
        var hs2 = parseInt(highestScore())
        console.log(["highscore", hs2])
        var hs3 = document.getElementById('hs')
        hs3.innerText = `Highest Score: ${hs2}`
        m2.style.visibility = "visible"
        gs.style.display = "none"
        var b1 = document.getElementById("playOnceMore")
        b1.addEventListener("click", () => {
            //setInterval(draw(), 10);
            m2.style.visibility = "hidden";
            gs.style.display = "block"
            startGame();
            //play2();
            //makePlatforms();
        })
    }
}
const highestScore = () => {
    let localHostScore = localStorage.getItem('hsc')
    if (localHostScore == null) {
        localHostScore = score
        localStorage.setItem('hsc', localHostScore)
    }
    if (localHostScore <= score) {
        localStorage.setItem('hsc', score)
        return score
    }
    else {
        return localHostScore
    }
}
const gameOverScreen = () => {
    const MainPage = document.getElementById("MainPage")
    const sc = document.getElementById("ScorePTag")
    let hs = localStorage.getItem("hs")
    MainPage.innerHTML = ""
    MainPage.innerHTML = `
    <div class="resultDivAndContent">
        <div class="GameOverTitle">
            Game Over
        </div>
        <div class="GameOverStats">
            <p class="userscore">Your Score: ${score} </p>
            <p class="HighScore">The Highest Score: ${highestScore()}</p>
            <button id="SAButton" class="SAButtonClass">Start Again</button>
        </div>
    </div>
    `
    const gameButton = document.getElementById('SAButton')
    gameButton.addEventListener('click', startGame)
}
const animateHealthBalls = () => {
    const canvas = document.getElementById('canvasTag')
    let ctx = canvas.getContext('2d')
    for (let i = 0; i < healthOrbs.length; i++) {
        let hB = healthOrbs[i]
        ctx.beginPath()
        ctx.arc(hB.x, hB.y, hB.radius, 0, Math.PI * 2, true)
        ctx.strokeStyle = "white"
        ctx.fillStyle = 'cadetblue'
        ctx.fill()
        ctx.stroke()
        hB.checkBall()
    }
}
const moveableStuff = () => {
    updateUserScore()
    clearScreen()
    animateHeart()
    animateSpikes()
    animatePlatforms()
    animateUserBall()
    animateHealthBalls()
    frame = window.requestAnimationFrame(moveableStuff)
    checkGameOver()
}
const makeHearts = () => {
    let canvas = document.getElementById('canvasTag')
    setInterval(() => {
        if (health != 0 && (healthOrbs.length < 5)) {
            let depth = randomIntFromInterval((canvas.height / 7) * (1), (canvas.height) * (6 / 7))
            let start = randomIntFromInterval(0, canvas.width - platformWidth);
            let ballDesc = new HealthPowerUpP(start, depth)
            healthOrbs.push(ballDesc)
        }
    }, 10000)
}
const makeStuff = () => {
    makeBall()
    makePlatforms()
    makeHearts()
}
const addEventListenerToStuff = () => {
    ballControll()
}
const initialiseGame = () => {
    const canvas = document.getElementById('canvasTag')
    let ctx = canvas.getContext('2d')
    canvas.width = parent.innerWidth
    canvas.height = parent.innerHeight
    ctx.fillStyle = "blue"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    makeStuff()
    moveableStuff()
    addEventListenerToStuff()
}
const updateCanvas = () => {
    let canvas = document.getElementById('canvasTag')
    canvas.width = parent.innerWidth
    canvas.height = parent.innerHeight
    spikeHeight = (parent.innerWidth / 1900) * (originalValues.spikeHeight)
    spikeWidth = (parent.innerWidth / 1900) * (originalValues.spikeWidth)
    platformWidth = (parent.innerWidth / 1900) * (originalValues.platformWidth)
    platformThick = (parent.innerWidth / 1900) * (originalValues.platformThick)
    ballRadius = (parent.innerWidth / 1900) * (originalValues.ballRadius)
}
const addResizeWindow = () => {
    window.onresize = updateCanvas()
}
const gameLayout = () => {
    /*const MainPage = document.getElementById("MainPage")
    MainPage.innerHTML = ""
    MainPage.innerHTML =
        `
    
    `*/
    addResizeWindow()
}
const startGame = () => {
    listOfObject = []
    healthOrbs = []
    score = 0
    health = 5
    gameLayout()
    initialiseGame()
}
const addHPEventListener = () => {
    let button = document.getElementById("play")
    let modal = document.getElementById("myModal")
    console.log("try")
    //button.addEventListener('click', startGame)
    button.addEventListener("click", () => {
        //setInterval(draw(), 10);
        modal.style.display = "none";
        gs.style.display = "block"
        startGame();
        //play2();
        //makePlatforms();
    })
}
const makeHomePage = () => {
    //const root = document.getElementById("root")
    /*root.innerHTML =
        `
    <div id="Header" class="Header">
        <p id="TI" class="HeaderText">
            Blue Ball Game
        </p>
    </div>
    <div id="MainPage" class="MainDivContent">
        <h2 id="Rules Header" class="RulesHeader" >Rules</h2>
        <p id="Rules Content" class="RulesContent">
            A spiked ceiling is moving down and the user controls the moving ball. The user has to move the ball and land on the spawning platforms to get away from the spikes. At the same time, the ball shouldn't fall without any platform to support it.
        </p>
        <button id="gameButton" class="gameButton" >Go to the game</button>
    </div>
    `*/
}
const main = () => {
    makeHomePage()
    addHPEventListener()
}
main()