import { readFileSync } from 'fs'

export async function readPipState(path: string) {
    try {
        const data = readFileSync(path, 'utf-8');

        return JSON.parse(data);
    } catch (err) {
        console.log('file read failed: ' + err);
    }
}

function inRange(array: [], index: number) {
    return index >= 0 && index < array.length;
}

function propogateConstraint(pipState, index: number, color: string, constraint: string, visited: Set<number>) {
    if (pipState.cells[index].split("_").length < 2) {
        return;
    } else if (pipState.cells[index].split("_")[1] != color) {
        return;
    }

    visited.add(index);

    if (pipState.cells[index].split("_").length < 3) {
        pipState.cells[index] += "_" + constraint
    }

    if (inRange(pipState.cells, index - 1) && !visited.has(index - 1)) {
        propogateConstraint(pipState, index - 1, color, constraint, visited);
    }

    if (inRange(pipState.cells, index + 1) && !visited.has(index + 1)) {
        propogateConstraint(pipState, index + 1, color, constraint, visited);
    }

    if (inRange(pipState.cells, index - pipState.cols) && !visited.has(index - pipState.cols)) {
        propogateConstraint(pipState, index - pipState.cols, color, constraint, visited);
    }

    if (inRange(pipState.cells, index + pipState.cols) && !visited.has(index + pipState.cols)) {
        propogateConstraint(pipState, index + pipState.cols, color, constraint, visited);
    }
}

export function propogateConstraints(pipState) {
    const visited: Set<number> = new Set();

    for (let i = 0; i < pipState.cells.length; i++) {
        if (visited.has(i)) {
            continue;
        }

        let cellData = pipState.cells[i].split("_");

        if (cellData.length == 3) {
            let color = cellData[1];
            let constraint = cellData[2];

            propogateConstraint(pipState, i, color, constraint, visited);
        }
    }
}
