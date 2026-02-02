import { readFileSync } from 'fs'

// Returns pipState data in JSON form from the specified file path
export async function readPipState(path: string) {
    try {
        const data = readFileSync(path, 'utf-8');

        return JSON.parse(data);
    } catch (err) {
        console.log('file read failed: ' + err);
    }
}

// Predicate that checks that an index is in range for an array
function inRange(array: [], index: number) {
    return index >= 0 && index < array.length;
}

// Recursively propogates a constraint to all neighboring cells of the same color that is passed in as an arg
function propogateConstraint(pipState, index: number, color: string, constraint: string, visited: Set<number>) {
    const cellConstituents = pipState.cells[index].split("_");

    if (cellConstituents.length < 2) {
        // The cell is not a colored cell and thus should have no constraints
        visited.add(index);

        return;
    } else if (cellConstituents[1] != color) {
        return;
    }

    visited.add(index);

    if (cellConstituents.length < 3) {
        pipState.cells[index] += "_" + constraint
    }

    const neighborCells = [index - 1, index + 1, index - pipState.cols, index + pipState.cols];

    for (let i = 0; i < neighborCells.length; i++) {
        if (inRange(pipState.cells, neighborCells[i]) && !visited.has(neighborCells[i])) {
            propogateConstraint(pipState, neighborCells[i], color, constraint, visited);
        }
    }
}

// Iterates over the pipState cells and initiates constrain propogation
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
