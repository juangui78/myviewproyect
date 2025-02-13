import nodemailer from 'nodemailer';
import path from 'path';

const ROOT_LOGO = "completo-fullblanco.png"

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

    const HTML_RECURRENT = `
     <section style="width: 100%; height: 100%; display: flex; position: relative; justify-content: center; background-color: black;">
        <div style="width: 50%; position: relative; margin: auto;">
            <div style="padding-top: 10px; width: 100%; height: 10%; display: flex; justify-content: center;">
                <img style="height: 20vh; object-fit: cover; margin: auto;"
                    src="cid:logo" alt="logo my view_">
            </div>
            <div>

                ${html}

                <div style="width: 100%; display: flex; margin-top: 30px; color: white; margin-bottom: 20px; ">
                    <div style="margin: auto;">
                        <p style="font-size: 0.83em; margin: 0px;">¿Qué es My View_?. My View es una empresa enfocada en la fotogrametría. </p>
                        <p style="font-size: 0.83em; margin: 0px;">Si quieres conocer más al respecto, visita nuestra página web, <a href="#">link</a></p>
                    </div>
                </div>

                <div style="width: 100%; color: white; display: flex; margin-bottom: 40px;">
                    <h5 style="margin: auto;">&copy; 2025 My view_. Todos los derechos reservados.</h5>
                </div>
            </div>
        </div>
     </section>
    `


    const currentDir = __dirname
    const rootDir = path.resolve(currentDir, '../../../../../../../') //app root 
    const publicDir = path.join(rootDir, 'public', 'logos') //root of logos
    const logoPath = path.join(publicDir, ROOT_LOGO) //logo path

    const mailOptions = {
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        html: HTML_RECURRENT,
        attachments: [
            {
                filename: 'image.png',
                path: logoPath,
                cid: 'logo'
            }
        ]
    }

    try {
        const response = await transporter.sendMail(mailOptions)
        return true
    } catch (error) {
        return false    
    }
}

export default sendEmail