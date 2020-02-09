export const SIZE = 16;
export const N_PIECES = 19;
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;
export const RULES = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
export const MASK = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]
];

export function opponent(player) {
    return 3 - player;
}

function boardMap(func) {
    for (let i = 0; i < 2; ++i) {
        for (let j = 0; j < 5; ++j) {
            func(i, j);
        }
    }
    for (let j = 0; j < 4; ++j) {
        func(2, j);
    }
    for (let j = 0; j < 3; ++j) {
        func(3, j);
    }
    for (let j = 0; j < 2; ++j) {
        func(4, j);
    }
}

export function initBoard() {
    let board = Array(SIZE).fill(0).map(() => new Array(SIZE).fill(EMPTY));
    boardMap((i, j) => {
        board[i][j] = BLACK;
        board[SIZE-i-1][SIZE-j-1] = WHITE;
    });
    return board;
}

export function possiblePosition(board, positions) {
    for (let i = 0; i < positions.length; ++i) {
        let x = positions[i][0];
        let y = positions[i][1];
        for (let j = 0; j < RULES.length; ++j) {
            let nx = x + RULES[j][0];
            let ny = y + RULES[j][1];
            let nnx = nx + RULES[j][0];
            let nny = ny + RULES[j][1];
            if (nnx >= 0 && nnx < SIZE && nny >= 0 && nny < SIZE
                && board[nx][ny] !== EMPTY && board[nnx][nny] === EMPTY) {
                let repeat = false;
                for (let k = 0; k < positions.length; ++k) {
                    if (positions[k][0] === nnx && positions[k][1] === nny) {
                        repeat = true;
                        break;
                    }
                }
                if (!repeat) {
                    positions.push([nnx, nny]);
                }
            }
        }
    }
    for (let j = 0; j < RULES.length; ++j) {
        let nx = positions[0][0] + RULES[j][0];
        let ny = positions[0][1] + RULES[j][1];
        if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && board[nx][ny] === EMPTY) {
            positions.push([nx, ny]);
        }
    }
}

export function isOverByBoard(board) {
    let finishedBlack = true;
    let finishedWhite = true;
    boardMap((i, j) => {
        if (board[i][j] !== WHITE){
            finishedWhite = false;
        }
        if (board[SIZE-i-1][SIZE-j-1] !== BLACK) {
            finishedBlack = false;
        }
    });
    return finishedWhite || finishedBlack;
}

export function isOverByPositions(positions, player) {
    let getMask;
    if (player === BLACK) {
        getMask = (p) => { return MASK[p[0]][p[1]]; };
    } else {
        getMask = (p) => { return MASK[SIZE-p[0]-1][SIZE-p[1]-1]; };
    }
    for (let k = 0; k < positions.length; ++k) {
        if (getMask(positions[k]) !== 1) {
            return false;
        }
    }
    return true;
}