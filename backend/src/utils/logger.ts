import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import util from 'util';

dotenv.config();

const logDir = process.env.LOG_DIR || '.';
const logFile = process.env.LOG_FILE || 'app.log';

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

console.error = (...args) => {
    const ts = new Date().toISOString();
    logToFile(`[${ts}] [ERROR]`, ...args);
    process.stdout.write(util.format(`[${ts}] [ERROR]`, ...args) + '\n');
}