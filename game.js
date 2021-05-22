const { GRID_SIZE, FPS } = require('./constants');

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity
}

function initGame() {

    const state = createGameState();
    randomFood(state);
    return state;
}

function createGameState() {
    return {
        players: [{
            pos: {
                x: 3,
                y: 10,
            },
            vel: {
                x: 0,
                y: 0,
            },
            snake: [
                { x: 1, y: 10 },
                { x: 2, y: 10 },
                { x: 3, y: 10 },
            ],
            score: 0,
            name:'Player 1'
        }, {
            pos: {
                x: 18,
                y: 20,
            },
            vel: {
                x: 0,
                y: 0,
            },
            snake: [
                { x: 20, y: 20 },
                { x: 19, y: 20 },
                { x: 18, y: 20 },
            ],
            score: 0,
            name:'Player 2'
        }],
        food: {},
        gridsize: GRID_SIZE,
    };
}

function gameLoop(state) {
    if (!state) {
        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        return {
            winner: `${playerTwo.name}`,
            reason:`${playerOne.name} bumped their head in the wall !!`
        };
    }

    if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
        return {
            winner: `${playerOne.name}`,
            reason:`${playerTwo.name} bumped their head in the wall !!`
        };
    }

    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;
        playerOne.score++;

        if (playerOne.score >= 10) {
            return {
                winner: `${playerOne.name}`,
                reason:`${playerOne.name} has scored 10 points !!`
            };
        }
        randomFood(state);


    }

    if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;
        playerTwo.score++;

        if (playerTwo.score >= 10) {
            return {
                winner: `${playerTwo.name}`,
                reason:`${playerTwo.name} has scored 10 points !!`
            };
        }

        randomFood(state);
    }

    if (playerOne.vel.x || playerOne.vel.y) {
        for (let cell of playerOne.snake) {
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                return {
                    winner: `${playerTwo.name}`,
                    reason:`${playerOne.name} bit itself !!`
                };

            }
        }

        playerOne.snake.push({ ...playerOne.pos });
        playerOne.snake.shift();
    }

    if (playerTwo.vel.x || playerTwo.vel.y) {
        for (let cell of playerTwo.snake) {
            if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                return {
                    winner: `${playerOne.name}`,
                    reason:`${playerTwo.name} bit itself !!`
                };

            }
        }

        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.snake.shift();
    }

    return;
}

function randomFood(state) {
    let x = Math.floor(Math.random() * GRID_SIZE);
    let y = Math.floor(Math.random() * GRID_SIZE);

    for (let player of state.players) {
        for (let c of player.snake) {
            if (x == c.x && y == c.y)
                return randomFood(state);
        }
    }
    state.food = {
        x: x,
        y: y
    }
    return;
}

function getUpdatedVelocity(keyCode) {
    switch (keyCode) {
        case 65: { // left
            return { x: -1, y: 0 };
        }
        case 87: { // down
            return { x: 0, y: -1 };
        }
        case 68: { // right
            return { x: 1, y: 0 };
        }
        case 83: { // up
            return { x: 0, y: 1 };
        }
    }
    return;
}