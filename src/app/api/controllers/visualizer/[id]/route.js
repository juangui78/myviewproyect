import { dbConnected } from '@/api/libs/mongoose';
import Model from '@/api/models/models'
import Proyect from "@/api/models/proyect";
import { NextResponse } from 'next/server';

dbConnected();

// get model by id
export async function GET(request, {params}) {
    const { id } = params;
    try {
        const findProyect = await Proyect.findById(id);

        if (findProyect) {
            const idProyect = findProyect?._id;
            const getModel = await Model.findOne({idProyect: idProyect},  { __v : 0, idProyect: 0}).sort({ creation_date : -1 });
            const getProject = await Proyect.findById(idProyect, { __v : 0, _id: 0, state: 0, creation_date: 0});
            
            const data = {
                model: getModel,
                proyect: getProject
            }

            return NextResponse.json(data, { status: 200 });
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