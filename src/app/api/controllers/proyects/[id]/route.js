import { dbConnected } from "@/api/libs/mongoose";
import { NextResponse } from "next/server";
import Proyect from "@/api/models/proyect";

import { z } from "zod";

dbConnected();

export async function GET(request, {params}) { 

    try {
        const { id } = params

        const schema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId")
        const resultSchema = schema.safeParse(id)

        if (!resultSchema.success){ //when the id is not a valid ObjectId
            return NextResponse.json({message: 'Invalid Id'}, { status: 400 })
        }

        //all its right
        const proyect = await Proyect.findById(id, { __v: 0, idCompany: 0 })
        return NextResponse.json(proyect, { status: 200 })

    } catch (error) {
        return NextResponse.json({message: 'Error'}, { status: 500 })
    }
}