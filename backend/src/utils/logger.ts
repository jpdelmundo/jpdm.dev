import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import util from 'util';

dotenv.config();

const logDir = process.env.LOG_DIR || '.';
const logFile = process.env.LOG_FILE || 'app.log';
const trace = process.env.DEBUG_TRACE === '1';
const debug = process.env.DEBUG === '1';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logStream = fs.createWriteStream(path.join(logDir, logFile), { flags: 'a' });

function logToFile(...args: unknown[]) {
    const message = util.format(...args) + '\n';
    logStream.write(message);
}

console.log = (...args) => {
    const ts = new Date().toISOString();
    logToFile(`[${ts}]`, ...args);
    process.stdout.write(util.format(`[${ts}]`, ...args) + '\n');
};

console.trace = (...args) => {
    if (!trace) return;
    const ts = new Date().toISOString();
    const msg = util.format(...args);
    const err = new Error();
    const stack = err.stack
        ?.split('\n')
        .slice(1)
        .join('\n');

    logToFile(`[${ts}] TRACE: ${msg}\n${stack}`);
    process.stdout.write(`[${ts}] TRACE: ${msg}\n${stack}\n`);
};

console.debug = (...args) => {
    if (!debug) return;
    console.log('DEBUG:', ...args);
}

console.error = (...args) => {
    const ts = new Date().toISOString();
    logToFile(`[${ts}] [ERROR]`, ...args);
    process.stdout.write(util.format(`[${ts}] [ERROR]`, ...args) + '\n');
}