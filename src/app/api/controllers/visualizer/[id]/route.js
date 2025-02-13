import { dbConnected } from '@/api/libs/mongoose';
import Model from '@/api/models/models'
import Proyect from "@/api/models/proyect";
import { NextResponse } from 'next/server';
import { decrypt } from '@/api/libs/crypto';


dbConnected();

export async function GET(request, {params}) {
    const { id } = params;
    try {
        const findProyect = await Proyect.findById(id);
        

        if (findProyect) {
            const idProyect = findProyect?._id;
            const findModels = await Model.findOne({idProyect: idProyect}).sort({ creation_date : -1 });
            console.log(findModels);
            return NextResponse.json(findModels);
        } else {
            console.log('no ha encontrado proyecto del query');
        }
    } catch (error) {
        return NextResponse.json({message: 'Invalid Id'}, { status: 500 })
    }
}