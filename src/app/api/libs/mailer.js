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

    // const HTML_RECURRENT = `
    //  <section style="width: 100%; height: 100%; display: flex; position: relative; justify-content: center; background-color: black;">
    //     <div style="width: 50%; position: relative; margin: auto;">
    //         <div style="padding-top: 10px; width: 100%; height: 10%; display: flex; justify-content: center;">
    //             <img style="height: 20vh; object-fit: cover; margin: auto;"
    //                 src="cid:logo" alt="logo my view_">
    //         </div>
    //         <div>

    //             ${html}

    //             <div style="width: 100%; display: flex; margin-top: 30px; color: white; margin-bottom: 20px; ">
    //                 <div style="margin: auto;">
    //                     <p style="font-size: 0.83em; margin: 0px;">¿Qué es My View_?. My View es una empresa enfocada en la fotogrametría. </p>
    //                     <p style="font-size: 0.83em; margin: 0px;">Si quieres conocer más al respecto, visita nuestra página web, <a href="#">link</a></p>
    //                 </div>
    //             </div>

    //             <div style="width: 100%; color: white; display: flex; margin-bottom: 40px;">
    //                 <h5 style="margin: auto;">&copy; 2025 My view_. Todos los derechos reservados.</h5>
    //             </div>
    //         </div>
    //     </div>
    //  </section>
    // `

    const HTML_RECURRENT = `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center">
      <!-- Contenedor principal -->
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 100%;">
        <tr>
          <td align="center">
            <!-- Contenedor interno que ocupa el 50% en PC y 100% en móviles -->
            <table width="50%" cellpadding="0" cellspacing="0" border="0" style="max-width: 100%; width: 100%;">
              <tr>
                <td style="padding: 20px; background-color: #f0f0f0; text-align: center;">
                  <h1 style="font-size: 24px; color: #333;">¡Hola!</h1>
                  <p style="font-size: 16px; color: #666;">
                    Este es un correo responsivo que ocupa el 50% en PC y el 100% en móviles.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table> 
    </td>
  </tr>
</table>
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