import puppeteer from "puppeteer";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function generatePDF(data) {
    const templatePath = path.join(__dirname, "templates", "contractTemplate.html");

    const htmlTemplate = fs.readFileSync(templatePath, "utf-8");

    let html = htmlTemplate;
    Object.keys(data).forEach(key => {
        html = html.replaceAll(`{{${key}}}`, data[key] || "");
    });
    let browser;
    try {
        browser = await puppeteer.launch(
            process.env.CHROME_EXECUTABLE_PATH
                ? {
                    executablePath: process.env.CHROME_EXECUTABLE_PATH,
                    headless: true
                }
                : {
                    headless: true,
                    args: ["--no-sandbox", "--disable-setuid-sandbox"]
                }
        );

        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: "domcontentloaded",timeout: 15000 });

        const filename = `contract-${crypto.randomUUID()}.pdf`;
        const pdfPath = path.join(__dirname, filename);
        await page.pdf({
            path: pdfPath,
            format: "A4",
        });
        return pdfPath;
    } finally {
        if (browser) {
            await browser.close();
        }
    }


};
