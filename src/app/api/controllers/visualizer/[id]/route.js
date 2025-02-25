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

export async function POST(request, { params }) {
    const { id } = params;
    try {
        const { terrains } = await request.json();
        console.log('Terrains received:', terrains);

        // Encuentra el proyecto y actualiza los terrenos
        const project = await Model.findOne({ idProyect: id });
        if (!project) {
            console.log('Project not found');
            return NextResponse.json({ message: 'Project not found' }, { status: 404 });
        }

        project.terrains = terrains;
        await project.save();

        console.log('Terrains saved successfully');
        return NextResponse.json({ message: 'Terrains saved successfully', project });
    } catch (error) {
        console.error('Error en POST:', error);
        return NextResponse.json({ message: 'Error saving terrains', error }, { status: 500 });
    }
}