import { readFileSync } from 'fs'

export async function readPipState(path: string) {
    try {
        const data = readFileSync(path, 'utf-8');

        return JSON.parse(data);
    } catch (err) {
        console.log('file read failed: ' + err);
    }
}
