import dotenv from "dotenv";
import fs from "fs";
import logError from "./logError.js";
import getColumns from "./getColumns.js";
import sendEmailWithRetry from "./sendEmailWithRetry.js";
import generatePDF from "./generatePDF.js";
import updateEmailStatus from "./updateEmailStatus.js";
import getColumnIdByName from "./getColumnIdByName.js";
import express from "express";

dotenv.config();

const requiredEnvVars = [
    "MONDAY_API_TOKEN",
    "EMAIL_USER",
    "EMAIL_PASS",
    "USER_TOKEN"
];

const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
}

const app = express();

let cachedStatusColumnId = null;

app.post("/webhook/:token", express.json(), async (req, res) => {
    console.log("Webhook received", {
        hasChallenge: Boolean(req.body?.challenge),
        pulseId: req.body?.event?.pulseId ?? "unknown",
    });

    if (req.params.token !== process.env.USER_TOKEN) {
        return res.sendStatus(200);
    }

    if (req.body.challenge) {
        return res.status(200).json({
            challenge: req.body.challenge
        });
    }
    let logContext = "initial step";
    const pulseId = req.body?.event?.pulseId;
    const boardId = req.body?.event?.boardId;

    let pdfPath;
    let statusColumnId;

    try {
        if (!pulseId) {
            throw new Error("Webhook request is missing event.pulseId");
        }

        if (!boardId) {
            throw new Error("Webhook request is missing event.boardId");
        }

        if (!cachedStatusColumnId) {
            cachedStatusColumnId = await getColumnIdByName(boardId,"Email Status");
        }
        statusColumnId = cachedStatusColumnId;

        logContext = `loading item ${pulseId}`;

        const cleanData = await getColumns(pulseId);

        // prevent duplicate sends
        if (cleanData["email status"] === "Sent") {
            console.log("Already processed, skipping");
            return res.sendStatus(200);
        }
        const contactLabel =
            cleanData.email ||
            cleanData.name ||
            `pulse ${pulseId}`;

        logContext = `validating email for ${contactLabel}`;

        if (!cleanData.email || !cleanData.email.includes("@")) {
            logError(new Error(`Invalid email for ${contactLabel}`),logContext);

            if (statusColumnId) {
                await updateEmailStatus(boardId,pulseId,statusColumnId,"Email Failed");
            }

            return res.sendStatus(200);
        }
        logContext = `generating PDF for ${contactLabel}`;
        pdfPath = await generatePDF(cleanData);

        logContext = `sending email to ${contactLabel}`;
        await sendEmailWithRetry(cleanData.email, pdfPath);

        if (statusColumnId) {
            await updateEmailStatus(boardId,pulseId,statusColumnId,"Sent");
        }

        return res.sendStatus(200);

    } catch (err) {
        logError(err, `Webhook failed: ${logContext}`);
        if (statusColumnId) {
            await updateEmailStatus(boardId,pulseId,statusColumnId,"Email Failed");
        }

        const isPermanent =
            err.message.includes("Invalid email") ||
            err.message.includes("Column") ||
            err.message.includes("not found");
        if (isPermanent) {
            return res.sendStatus(200);
        }

        return res.sendStatus(500);
    } finally {
        if (pdfPath && fs.existsSync(pdfPath)) {
            try {
                fs.unlinkSync(pdfPath);
            } catch (cleanupError) {
                logError(
                    cleanupError,
                    `Failed to remove PDF: ${pdfPath}`
                );
                console.error(cleanupError);
            }
        }
    }
});

app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
