const io = require('socket.io')(process.env.PORT || 3000, {
    cors: {
        origin: '*',
    }
})
const { FPS } = require('./constants');
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');

const state = {};
const clientRooms = {};


io.on('connection', client => {

    client.on('keydown', handleKeydown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    client.on('spectateGame', handleSpectateGame);
    client.on('restartGame', handleRestartGame);

    function handleNewGame(playerName) {
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;

        client.join(roomName);
        client.emit('gameCode', roomName);
        client.number = 1;

        state[roomName] = initGame();
        state[roomName].players[0].name = playerName;
        client.emit('serverLog', playerName + " has joined the game");
    }

    function handleJoinGame(roomName, playerName) {
        const room = io.sockets.adapter.rooms[roomName];
        let allUsers;

        if (room) {
            allUsers = room.sockets;
        }
        let numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        if (numClients === 0) {
            client.emit('unknownCode');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = roomName;

        client.join(roomName);
        client.number = 2;
        client.emit('init', 2);
        io.sockets.in(roomName)
            .emit('serverLog', playerName + " has joined the game");

        state[roomName].players[1].name = playerName;

        io.sockets.in(roomName)
            .emit('serverLog', 'starting game');

        io.sockets.in(roomName)
            .emit('serverLog', 'Use W A S D keys to move');
        startGameInterval(roomName);

    }
    function handleSpectateGame(roomName, playerName) {
        const room = io.sockets.adapter.rooms[roomName];
        let allUsers;

        if (room) {
            allUsers = room.sockets;
        }
        let numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        if (numClients <= 1) {
            client.emit('unknownCode');
            return;
        }

        clientRooms[client.id] = roomName;

        client.join(roomName);
        io.sockets.in(roomName)
            .emit('serverLog', playerName + " is spectating the game");

        startGameInterval(roomName);

    }

    function handleRestartGame(roomName, p1Name, p2Name) {


        state[roomName] = initGame();

        state[roomName].players[0].name = p1Name;
        state[roomName].players[1].name = p2Name;

        startGameInterval(roomName);

    }

    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];
        if (!roomName) {
            return;
        }
        try {
            keyCode = parseInt(keyCode);
        } catch (e) {
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);

        if (vel && client) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    }

});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const result = gameLoop(state[roomName]);

        if (!result) {
            emitGameState(roomName, state[roomName])
        } else {

            emitGameOver(roomName, (result));
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FPS);
}

function emitGameState(room, gameState) {
    // Send this event to everyone in the room.
    io.sockets.in(room)
        .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, result) {
    io.sockets.in(room)
        .emit('gameOver', JSON.stringify(result));
    io.sockets.in(room)
        .emit('serverLog', 'game over');

}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}