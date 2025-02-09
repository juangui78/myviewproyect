import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})


const sendEmail = async (to, subject, text, html) => {


    try {
        await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject,
            text,
            html
        })
    } catch (error) {
        console.error(error)
    }

}

export default  sendEmail