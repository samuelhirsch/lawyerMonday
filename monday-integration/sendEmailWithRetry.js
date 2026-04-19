import sendEmail from "./sendEmail.js";
 export default async function sendEmailWithRetry(toEmail, pdfPath, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await sendEmail(toEmail, pdfPath);
            return;
        } catch (err) {
            if (attempt === retries) {
                throw err;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}