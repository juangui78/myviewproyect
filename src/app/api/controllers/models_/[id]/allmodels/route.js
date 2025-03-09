import { dbConnected } from '@/api/libs/mongoose';
import Model from '@/api/models/models';
import { NextResponse } from 'next/server';

dbConnected();

// Obtener todos los modelos de un proyecto específico
export async function GET(request, { params }) {
    const { id } = await params;
    
    try {
        console.log('entro al endpoint de modelos');
        
        // Encuentra todos los modelos que coincidan con el idProyect
        const models = await Model.find({ idProyect: id }).sort({ creation_date: -1 });
        
        if (models && models.length > 0) {
            return NextResponse.json(models);
        } else {
            return NextResponse.json({ message: 'No models found for this project' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error getting models:', error);
        return NextResponse.json({ message: 'Error fetching models', error: error.message }, { status: 500 });
    }
}