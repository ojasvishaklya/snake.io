
const bg_canvas = '#282828';
const snake_color1 = 'white';
const snake_color2 = 'cyan';
const food_color = 'yellow'

let canvas, ctx;
let playerNumber;
let gameActive = false;
let isSpectating = false;

const socket = io('https://sheltered-falls-45456.herokuapp.com/')


socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('serverLog', serverLog);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const spectateGameBtn = document.getElementById('spectateGameButton');
const restartGameBtn = document.getElementById('restartGameButton');
const quitGameBtn = document.getElementById('quitGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const playerNameInput = document.getElementById('playerNameInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const p1Score = document.getElementById('p1Score');
const p2Score = document.getElementById('p2Score');
const p1Name = document.getElementById('p1Name');
const p2Name = document.getElementById('p2Name');
const ul = document.querySelector('ul');
const gameAlert = document.querySelector('#game-alert');


newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
spectateGameBtn.addEventListener('click', spectateGame);
restartGameBtn.addEventListener('click', restartGame);
quitGameBtn.addEventListener('click', reset);

const player = {};

function newGame() {

    if (playerNameInput.value) {
        player.name = playerNameInput.value;
    } else {
        player.name = 'Player 1';
    }
    socket.emit('newGame', player.name);
    p1Name.innerText = player.name;
    serverAlert("Share the game code, given at the bottom of the screen");
    init();

}

function joinGame() {
    const code = gameCodeInput.value;
    if (playerNameInput.value) {
        player.name = playerNameInput.value;
    } else {
        player.name = 'Player 2';
    }
    socket.emit('joinGame', code, player.name);
    handleGameCode(code);

    init();

}

function spectateGame() {
    const code = gameCodeInput.value;
    if (playerNameInput.value) {
        player.name = playerNameInput.value;
    } else {
        player.name = 'Friend';
    }
    socket.emit('spectateGame', code, player.name);
    handleGameCode(code);
    isSpectating=true;
    init();
}


function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function restartGame() {
    if (!isSpectating) {
        const code = gameCodeDisplay.innerText;
        socket.emit('restartGame', code, p1Name.innerText, p2Name.innerText);
    }else{
        serverAlert("Spectators can't restart the game")
    }
}



function init() {
    console.log("initializing game..");

    initialScreen.style.display = "none";
    gameScreen.style.display = "block";

    canvas = document.querySelector('#canvas');
    ctx = canvas.getContext('2d');

    canvas.height = canvas.width = 600;
    ctx.fillStyle = bg_canvas;
    ctx.fillRect(0, 0, canvas.height, canvas.width);
    document.addEventListener('keydown', keydown);
    gameActive = true;
}

function keydown(e) {
    if (!isSpectating)
        socket.emit('keydown', e.keyCode);
}


function paintGame(state) {
    ctx.fillStyle = bg_canvas;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;


    ctx.fillStyle = food_color;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.players[0], size, snake_color1);
    paintPlayer(state.players[1], size, snake_color2);
}

function paintPlayer(playerState, size, color) {

    for (let c of playerState.snake) {
        ctx.fillStyle = color;
        ctx.fillRect(c.x * size, c.y * size, size, size);
    }
    return;
}

function handleInit(number) {
    player.number = number;
}


function handleGameState(gameState) {

    if (!gameActive)
        return;

    gameState = JSON.parse(gameState);
    p1Score.innerText = gameState.players[0].score;
    p2Score.innerText = gameState.players[1].score;
    p1Name.innerText = gameState.players[0].name;
    p2Name.innerText = gameState.players[1].name;

    requestAnimationFrame(() => {
        paintGame(gameState);
    })
}


function handleUnknownCode() {
    reset();
    serverAlert('Unknown Game Code')
}

function handleTooManyPlayers() {
    reset();
    serverAlert('This game is already in progress');
}

function handleGameOver(data) {
    data = JSON.parse(data);

    serverLog(data.reason);
    serverLog(data.winner);
    serverAlert(data.winner + " has won the game !!");
}

function serverLog(log) {
    let li = document.createElement('li');
    li.innerText = '> ' + log;
    ul.append(li)
}

function serverAlert(alert) {
    gameAlert.innerText = alert;
    setTimeout(() => {
        gameAlert.innerText = "";
    }, 3000);
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = '';
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
    // location.reload();
}

