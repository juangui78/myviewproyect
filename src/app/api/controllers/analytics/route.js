import { dbConnected } from "@/api/libs/mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from '@/api/auth/[...nextauth]/route';
import Analytics from "@/api/models/analytics";
import { z } from "zod";

dbConnected();

export async function POST(request) {
    try {
        //====================================================
        //get data from request and validate
        const requestData = await request.json();
        const schemaRequest = z.object({
            idProyect: z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId")
        })

        const resultSchemaRequest = schemaRequest.safeParse(requestData)
        if (!resultSchemaRequest.success){
            return NextResponse.json({ message: "Tipo de datos incorrectos." }, { status: 500 })
        }

        //===============================================
        //get header info
        const headers = request.headers
        const userAgent = headers.get("user-agent")
        const secChUaMobile = headers.get("sec-ch-ua-mobile") === '?1'
        const ip = headers.get("x-forwarded-for") || headers.get("remoteAddress")

        //shape of the schema
        const infoToSave = {
            withSession: false,
            projectId : requestData.idProyect,
            ip: ip,
            userAgent: userAgent,
            secChUaMobile: secChUaMobile,
        }

        //===============================================
        //get info session

        const session = await getServerSession(AuthOptions)
        if (session) infoToSave.withSession = true

        //===============================================
        //save info in database
        const newAnalytics = new Analytics(infoToSave)
        const saveNewAnalytics = await newAnalytics.save()

        if (!saveNewAnalytics) {
            return NextResponse.json({ message: "No se pudo guardar la información." }, { status: 500 })
        }

        return NextResponse.json({ message: "Información guardada correctamente." }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            message: "Error al guardar la información.",
        }, { status: 500 })
    }
}