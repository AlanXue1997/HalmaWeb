import {BLACK, EMPTY, SIZE, WHITE, possiblePosition, initBoard} from "./halma-tools.js";
import {getMove} from "./halma-ai.js";

class BoardBack{
    constructor(id) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext("2d");
        this.gap = 60;
        this.chartBoard = [];
        for (let i = 0; i < SIZE; i++) {
            const row = [];
            this.chartBoard.push(row);
            for (let j = 0; j < SIZE; j++) {
                const col = {};
                row.push(col);
            }
        }
    }

    drawBoard(){
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = "black";
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(j * this.gap, i * this.gap, this.gap, this.gap);
                this.ctx.closePath();
            }
        }
        this.ctx.beginPath();
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(2, 2, SIZE * this.gap - 4, SIZE * this.gap - 4);
        this.ctx.closePath();
    }
}

class BoardLogic {
    constructor() {
        this.board = Array(SIZE).fill(0).map(() => new Array(SIZE).fill(EMPTY));
        // assign init black pieces
        for (let i = 0; i < 2; ++i) {
            for (let j = 0; j < 5; ++j) {
                this.board[i][j] = BLACK;
                this.board[SIZE-i-1][SIZE-j-1] = WHITE;
            }
        }
        for (let j = 0; j < 4; ++j) {
            this.board[2][j] = BLACK;
            this.board[SIZE-3][SIZE-j-1] = WHITE;
        }
        for (let j = 0; j < 3; ++j) {
            this.board[3][j] = BLACK;
            this.board[SIZE-4][SIZE-j-1] = WHITE;
        }
        for (let j = 0; j < 2; ++j) {
            this.board[4][j] = BLACK;
            this.board[SIZE-5][SIZE-j-1] = WHITE;
        }
    }

    possiblePosition(positions) {
        for (let i = 0; i < positions.length; ++i) {
            let x = positions[i][0];
            let y = positions[i][1];
            for (let j = 0; j < RULES.length; ++j) {
                let nx = x + RULES[j][0];
                let ny = y + RULES[j][1];
                let nnx = nx + RULES[j][0];
                let nny = ny + RULES[j][1];
                if (nnx >= 0 && nnx < SIZE && nny >= 0 && nny < SIZE
                    && this.board[nx][ny] !== EMPTY && this.board[nnx][nny] === EMPTY) {
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
            if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && this.board[nx][ny] === EMPTY) {
                positions.push([nx, ny]);
            }
        }
    }
}

class Selector {
    constructor() {
        this.canvas = document.getElementById("selector");
        this.ctx = this.canvas.getContext("2d");
        this.gap = 60;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    place(x, y, color) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        // this.ctx.arc(x * this.gap + this.gap / 2, y * this.gap + this.gap / 2, this.gap / 4, 0, 2 * Math.PI);
        this.ctx.moveTo(x * this.gap + this.gap / 8, y * this.gap + this.gap / 3);
        this.ctx.lineTo(x * this.gap + this.gap / 8, y * this.gap + this.gap / 8);
        this.ctx.lineTo(x * this.gap + this.gap / 3, y * this.gap + this.gap / 8);
        this.ctx.moveTo(x * this.gap + this.gap * 2 / 3, y * this.gap + this.gap / 8);
        this.ctx.lineTo(x * this.gap + this.gap * 7 / 8, y * this.gap + this.gap / 8);
        this.ctx.lineTo(x * this.gap + this.gap * 7 / 8, y * this.gap + this.gap / 3);
        this.ctx.moveTo(x * this.gap + this.gap * 7 / 8, y * this.gap + this.gap * 2 / 3);
        this.ctx.lineTo(x * this.gap + this.gap * 7 / 8, y * this.gap + this.gap * 7 / 8);
        this.ctx.lineTo(x * this.gap + this.gap * 2 / 3, y * this.gap + this.gap * 7 / 8);
        this.ctx.moveTo(x * this.gap + this.gap / 3, y * this.gap + this.gap * 7 / 8);
        this.ctx.lineTo(x * this.gap + this.gap / 8, y * this.gap + this.gap * 7 / 8);
        this.ctx.lineTo(x * this.gap + this.gap / 8, y * this.gap + this.gap * 2 / 3);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    update(positions, lastMove) {
        this.clear();
        for (let i = 0; i < positions.length; ++i) {
            let y = positions[i][0];
            let x = positions[i][1];
            let color = i === 0 ? "orange" : "green";
            this.place(x, y, color);
        }
        for (let i = 0; i < lastMove.length; ++i) {
            this.place(lastMove[i][1], lastMove[i][0], "gray");
        }
    }
}

const STATE = {
    IDLE: 0,
    SELECT: 1,
};

class BoardFront {
    constructor(id) {
        this.canvas = document.getElementById(id);
        this.canvas.addEventListener('click', (e) => this.click(e));
        document.getElementById("auto-step").addEventListener('click', () => this.autoStep());
        this.ctx = this.canvas.getContext("2d");
        this.gap = 60;
        this.board = initBoard();
        this.selector = new Selector();
        this.state = STATE.IDLE;
        this.player = BLACK;
        this.positions = [];
        this.lastMove = [];
        this.update();
    }

    place(x, y, color) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 4;
        this.ctx.arc(x * this.gap + this.gap / 2, y * this.gap + this.gap / 2, this.gap / 3, 0, 2 * Math.PI);
        if (color === BLACK) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
        this.ctx.closePath();
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < SIZE; ++i) {
            for (let j = 0; j < SIZE; ++j) {
                if (this.board[i][j] !== EMPTY) {
                    this.place(j,i,this.board[i][j]);
                }
            }
        }
    }

    move(origin, target) {
        this.board[target[0]][target[1]] = this.board[origin[0]][origin[1]];
        this.board[origin[0]][origin[1]] = EMPTY;
        this.lastMove = [origin, target];
        this.update();
        this.player = this.player === WHITE ? BLACK : WHITE;
        this.positions.length = 0;
        this.selector.update(this.positions, this.lastMove);
        this.state = STATE.IDLE;
    }

    autoStep() {
        let [origin, target] = getMove(this.board, this.player);
        this.move(origin, target);
    }

    click(e) {
        const rect = this.canvas.getBoundingClientRect();
        const y = Math.floor((e.clientX - rect.left)*2 / this.gap);
        const x = Math.floor((e.clientY - rect.top)*2 / this.gap);
        if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
        if (this.state === STATE.SELECT) {
            for (let i = 1; i < this.positions.length; ++i) {
                if (this.positions[i][0] === x && this.positions[i][1] === y) {
                    this.move(this.positions[0], this.positions[i]);
                    return;
                }
            }
        }
        this.state = STATE.IDLE;
        this.positions.length = 0;
        if (this.board[x][y] === this.player) {
            this.positions.push([x, y]);
            possiblePosition(this.board, this.positions);
            this.selector.update(this.positions, this.lastMove);
            this.state = STATE.SELECT;
        }
        else {
            this.selector.update(this.positions, this.lastMove);
        }
    }
}

export {BoardBack, BoardFront};