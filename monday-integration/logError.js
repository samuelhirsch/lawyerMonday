import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function logError(error, context = "") {
    const logsDir = path.join(__dirname, "logs");
    const logFile = path.join(logsDir, "errors.log");

    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    const timestamp = new Date().toISOString();

    const message = `
[${timestamp}]
Context: ${context}
Error: ${error.stack || error.message}

`;
    fs.appendFileSync(logFile, message);
}