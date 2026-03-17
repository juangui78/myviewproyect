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

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();

        const schemaId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
        const resultSchemaId = schemaId.safeParse(id);

        if (!resultSchemaId.success) {
            return NextResponse.json({ message: 'Invalid Id' }, { status: 400 });
        }

        const updateSchema = z.object({
            name: z.string().max(100).optional(),
            address: z.string().max(300).optional(),
            description: z.string().max(500).optional(),
        });

        const resultUpdate = updateSchema.safeParse(body);
        if (!resultUpdate.success) {
            return NextResponse.json({ message: 'Invalid data', errors: resultUpdate.error.errors }, { status: 400 });
        }

        const updatedProyect = await Proyect.findByIdAndUpdate(id, body, { new: true });

        if (!updatedProyect) {
            return NextResponse.json({ message: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(updatedProyect, { status: 200 });

    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json({ message: 'Error', error: error.message }, { status: 500 });
    }
}