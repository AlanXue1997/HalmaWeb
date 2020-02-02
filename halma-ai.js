import {N_PIECES, SIZE, BLACK, WHITE, EMPTY, possiblePosition, opponent} from "./halma-tools.js";

let searchCount = 0;

function tableShow(player, depth, count, time) {
    document.getElementById("table-player").innerHTML = player === WHITE ? "&#9898;WHITE" : "&#9899;BLACK";
    document.getElementById("table-depth").innerText = depth;
    document.getElementById("table-count").innerText = count;
    document.getElementById("table-time").innerText = time.toFixed(4) + " ms";
}

function pointValue([x, y], color) {
    const maskValue = 2;
    const mask = [
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
    if (color === WHITE) {
        x = SIZE - x - 1;
        y = SIZE - y - 1;
    }
    return (x + y) * (mask[x][y] === 1 ? maskValue : 1);
}

function stepValue(origin, target, player, color) {
    let past = pointValue(origin, color);
    let now = pointValue(target, color);
    if (color === player) return now - past;
    else return past - now;
}

function minMaxSearch(depth, alpha, beta, past, board, blackPositions, whitePositions, player, findMax) {
    if (depth === 0) {
        searchCount++;
        return [past, null, null];
    }
    let v = findMax ? Number.NEGATIVE_INFINITY: Number.POSITIVE_INFINITY;
    let origin = [];
    let target = [];
    const positions = (player === BLACK && findMax) || (player === WHITE && !findMax) ? blackPositions : whitePositions;
    for (let i = 0; i < N_PIECES; ++i) {
        const queue = [positions[i]];
        possiblePosition(board, queue);
        for (let j = 1; j < queue.length; ++j) {
            let stepV = stepValue(queue[0], queue[j], player, findMax ? player : opponent(player));
            // change states before going down
            let [x, y] = queue[0];
            let [nx, ny] = queue[j];
            board[nx][ny] = board[x][y];
            board[x][y] = EMPTY;
            positions[i] = [nx, ny];
            let vPrime = minMaxSearch(
                depth-1,
                alpha, beta,
                past + stepV,
                board,
                blackPositions,
                whitePositions,
                player,
                !findMax)[0];
            board[x][y] = board[nx][ny];
            board[nx][ny] = EMPTY;
            positions[i] = [x, y];
            if ((findMax && vPrime > v) || (!findMax && vPrime < v)) {
                v = vPrime;
                origin = [x, y];
                target = [nx, ny];
            }
            if (findMax) {
                if (v > beta) return [v, origin, target];
                if (v > alpha) alpha = v;
            } else {
                if (v < alpha) return [v, origin, target];
                if (v < beta) beta = v;
            }
        }
    }
    return [v, origin, target];
}

export function getMove(board, player) {
    const blackPositions = [];
    const whitePositions = [];
    for (let i = 0; i < SIZE; ++i) {
        for (let j = 0; j < SIZE; ++j) {
            if (board[i][j] === BLACK) {
                blackPositions.push([i, j]);
            } else if (board[i][j] === WHITE) {
                whitePositions.push([i, j]);
            }
        }
    }
    searchCount = 0;
    let t0 = performance.now();
    let depth = document.getElementById("option-depth").value;
    let result = minMaxSearch(
        depth,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        0,
        board,
        blackPositions,
        whitePositions,
        player,
        true
    );
    let origin = result[1];
    let target = result[2];
    let t1 = performance.now();
    tableShow(player, depth, searchCount, t1-t0);
    return [origin, target];
}