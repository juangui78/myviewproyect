import { dbConnected } from '@/api/libs/mongoose';
import Model from '@/api/models/models'
import Proyect from "@/api/models/proyect";
import { NextResponse } from 'next/server';
import { decrypt } from '@/api/libs/crypto';


dbConnected();

// Obtener proyecto
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

// Actualizar terrenos de un Modelo
export async function POST(request, { params }) {
    const { id } = params;
    try {
        
        
        const { terrains, modelID } = await request.json();
        console.log('aqui llega el ID: ', modelID);
        console.log('Terrains received:', terrains);

        // Encuentra el proyecto y actualiza los terrenos
        const model = await Model.findById(modelID);
        if (!model) {
            console.log('Model not found');
            return NextResponse.json({ message: 'Model not found' }, { status: 404 });
        }

        model.terrains = terrains;
        await model.save();

        console.log('Terrains saved successfully');
        return NextResponse.json({ message: 'Terrains saved successfully', model });
    } catch (error) {
        console.error('Error en POST:', error);
        return NextResponse.json({ message: 'Error saving terrains', error }, { status: 500 });
    }
}