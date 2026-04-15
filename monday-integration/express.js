import dotenv from "dotenv";
import fs from "fs";
import logError from "./logError.js";
import getColumns from "./getColumns.js";
import sendEmailWithRetry from "./sendEmailWithRetry.js";
import generatePDF from "./generatePDF.js";

import express from "express";
dotenv.config();
const app = express();


app.post("/webhook", express.json(), async (req, res) => {
    console.log("Webhook received:");
    console.dir(req.body);

    // Challenge verification
    if (req.body.challenge) {
        return res.status(200).json({
            challenge: req.body.challenge,
        });
    }
    let pdfPath;
    try {
        const cleanData = await getColumns(req.body.event.pulseId);
        //console.log(cleanData);
        pdfPath = await generatePDF(cleanData);
        try {
            await sendEmailWithRetry(cleanData.email, pdfPath);
        } catch (err) {
            logError(err, `Email failed for ${cleanData.email}`);
            throw err;
        }

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
    finally {
        fs.unlinkSync(pdfPath);
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
