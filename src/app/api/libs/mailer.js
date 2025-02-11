import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true
})


const sendEmail = async (to, subject, text, html) => {

    console.log(process.env.EMAIL_PASS, process.env.EMAIL)

    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject,
        text,
        html
    }, (error, info) => {
        console.log(error, info)
    })
}

export default sendEmail