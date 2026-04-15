import puppeteer from "puppeteer";
import fs from "fs";
import crypto from "crypto"
export default async function generatePDF(data) {
    const htmlTemplate = fs.readFileSync(
        "./templates/contractTemplate.html",
        "utf-8"

    );
    console.log(htmlTemplate);
    let html = htmlTemplate;
    Object.keys(data).forEach(key => {
        html = html.replaceAll(`{{${key}}}`, data[key] || "");
    });
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const filename = `contract-${crypto.randomUUID()}.pdf`;

    await page.pdf({
        path: filename,
        format: "A4",
    });
    await browser.close();
    return filename;
};
