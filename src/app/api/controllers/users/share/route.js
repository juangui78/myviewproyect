import { dbConnected } from '@/api/libs/mongoose';
import User from '@/api/models/users'
import Proyect from '@/api/models/proyect';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/api/auth/[...nextauth]/route';
import { encrypt } from '@/api/libs/crypto';
import z from 'zod';
import sendEmail from '@/api/libs/mailer';
import QRCode from 'qrcode';

dbConnected();

export async function POST(request) { // send data to share model to user at email
    try {

        //get data from request and validate
        //=======================================================================================
        const requestData = await request.json();
        const schemaRequest = z.object({
            email: z.string().email(),
            permissions: z.array(z.string()),
            idProyect: z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId")
        })

        const resultSchemaRequest = schemaRequest.safeParse(requestData)
        
        if (!resultSchemaRequest.success){
            return NextResponse.json({ message: "Tipo de datos incorrectos." }, { status: 500 })
        }

        const { email, permissions, idProyect } = requestData

        //get data from session
        //=======================================================================================
        const session = await getServerSession(AuthOptions)
        if (!session){
            return NextResponse.json({ message: "Usuario no autenticado." }, { status: 500 })
        }
        const { user } = session
        const { _id, name, lastName } = user
        const fullName = name + " " + lastName

        //get name's proyect
        //=======================================================================================
        const proyect = await Proyect.findById(idProyect, { name: 1 })
        if (!proyect){
            return NextResponse.json({ message : "Proyecto no encontrado." }, { status: 404 })
        }

        const nameProyect = proyect.name

        //save info in database, info from the user who invited
        //=======================================================================================
        const getInfoUser = await User.findById(_id, { usersInvited: 1 }).lean()

        if (!getInfoUser){
            return NextResponse.json({ message: "Usuarios no encontrados." }, { status: 404 })
        }

        const { usersInvited } = getInfoUser
        const findEmail = usersInvited.find((item) => item.email === email)

        if (findEmail) { //the user exist

            const updatedUserInvited = { ...findEmail };

            for (const key in updatedUserInvited){
                if (permissions.includes(key)) updatedUserInvited[key] = true
                else if (key != 'email') updatedUserInvited[key] = false
            }

            const update = await User.updateOne(
                { _id : _id, "usersInvited.email" : email },
                { $set : { "usersInvited.$" : updatedUserInvited } }
            )

            if (update.matchedCount === 0){
                return NextResponse.json({ message: "Se ha producido un error al actualizar los permisos." }, { status: 500 })
            }

        }else {
            let newUser = {
                email: email,
                cadastralFile: false,
                writing: false,
                certificateOfFreedom: false,
                landUse: false,
                topographicalPlan: false
            }

            for (const key in newUser) if (permissions.includes(key)) newUser[key] = true

            const add = await User.updateOne(
                { _id: _id },
                { $addToSet: { usersInvited: newUser } }
            )

            if (add.matchedCount === 0){
                return NextResponse.json({ message: "Se ha producido un error al guardar el usuario." }, { status: 500 }) 
            }
        }


        //generate url to share visualizer
        //=======================================================================================
        const baseUrl = process.env.URL_PROJECT
        const url = "web/views/visualizer"
        const idProyectEncrypted = encrypt(idProyect)
        const emailEncrypted = encrypt(email)
        const params = `?id=${idProyectEncrypted}&email=${emailEncrypted}`
        const urlShare = baseUrl + url + params
    
        const HTML = `
            <div style="width: 100%; height: 10%; display: flex; justify-content: center;">
                <h5 style="margin: auto; color: white;">Bienvenido a My View_</h5>
            </div>
            <div style="width: 100%; height: 10%; display: flex; justify-content: center; margin-top: 20px;">
                <h2 style="margin: auto; color: white;">${fullName} te ha invitado a visualizar en el modelo del proyecto</h2>
            </div>
            <div style="width: 100%; height: 10%; display: flex; justify-content: center;">
                <h1 style="margin: auto; color: white;">${nameProyect}</h1>
            </div>
            <div style="width: 100%; height: 10%; display: flex; justify-content: center; margin-top: 20px;">
                <h5 style="margin: auto; color: white;">Para visualizar el modelo, únete mediante el siguiente botón</h5>
            </div>
            <div style="width: 100%; height: 10%; display: flex; justify-content: center; margin-top: 10px; margin-bottom: 10px;">
                <button style="margin: auto; padding: 10px; border-radius: 10px; width: 30%; outline: none; cursor: pointer; background-color: #0CDBFF;">
                    <a href="${urlShare}" style="text-decoration: none; color: black;">Ver modelo</a>
                </button>
            </div>
            `
        const SUBJECT = "Invitación a visualizar modelo"
        const sendToEmail = await sendEmail(email, SUBJECT, SUBJECT, HTML)

        if (!sendToEmail){
            return NextResponse.json({ message: "Error al enviar al correo." }, { status: 500 })
        }

        return NextResponse.json({ message: "El correo se ha enviado con éxito." }, { status : 200 })

    } catch (error) {
        return NextResponse.json({ message: "Error del servidor, vuelva a intentar." }, { status: 500 })
    }
}     

export async function GET(request){
    try{
        //get parameters from request and validate
        //=======================================================================================
        const { searchParams } = new URL(request.url)
        const idProyect = searchParams.get('idProyect')

        const schemaId = z.object({
            idProyect: z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId")
        })

        const validationResult = schemaId.safeParse({ idProyect })

        if (!validationResult.success){
            return NextResponse.json({ message: "Tipo de datos incorrectos." }, { status: 500 })
        }

        const encryptId = encrypt(idProyect)

        //generate url to share visualizer
        const baseUrl = process.env.URL_PROJECT
        const url = "web/views/visualizer"
        const params = `?id=${encryptId}`
        const urlShare = baseUrl + url + params

        //generate qr code
        const qrCode = await QRCode.toDataURL(urlShare)

        return NextResponse.json({ qrCode }, { status: 200 })

    }catch(error){
        return NextResponse.json({ message: "Error del servidor, vuelva a intentar." }, { status: 500 })
    }
}