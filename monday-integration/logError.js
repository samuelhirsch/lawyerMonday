import fs from "fs";

export default function logError(error, context = "") {
    if (!fs.existsSync("./logs")) {
        fs.mkdirSync("./logs");
    }

    const timestamp = new Date().toISOString();

    const message = `
[${timestamp}]
Context: ${context}
Error: ${error.stack || error.message}

`;

    fs.appendFileSync("./logs/errors.log", message);
}