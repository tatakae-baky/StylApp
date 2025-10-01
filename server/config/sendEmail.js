import { sendEmail } from "./emailService.js";

const sendEmailFun = async ({sendTo, subject, text, html}) => {
    try {
        const result = await sendEmail(sendTo, subject, text, html);
        if (result.success) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}


export default sendEmailFun;