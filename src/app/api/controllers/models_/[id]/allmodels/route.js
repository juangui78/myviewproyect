import { dbConnected } from '@/api/libs/mongoose';
import Model from '@/api/models/models';
import { NextResponse } from 'next/server';

dbConnected();

export const dynamic = 'force-dynamic';

// Obtener todos los modelos de un proyecto específico
export async function GET(request, { params }) {
    const { id } = await params;
    
    try {
        await dbConnected();
        console.log('entro al endpoint de modelos');
        
        // Encuentra todos los modelos que coincidan con el idProyect
        const models = await Model.find({ idProyect: id }).sort({ creation_date: -1 });
        
        if (models && models.length > 0) {
            // Buscar si alguno tiene calibración
            const calibratedModel = models.find(m => m.background360Rotation !== undefined && m.background360Rotation !== 0);
            if (calibratedModel) {
                const rotation = calibratedModel.background360Rotation;
                const rotationX = calibratedModel.background360RotationX || 0;
                const bg360 = calibratedModel.background360;

                models.forEach(m => {
                    if (m.background360Rotation === undefined || m.background360Rotation === 0) {
                        m.background360Rotation = rotation;
                    }
                    if (m.background360RotationX === undefined || m.background360RotationX === 0) {
                        m.background360RotationX = rotationX;
                    }
                    if (!m.background360) {
                        m.background360 = bg360;
                    }
                });
            }

            return NextResponse.json(models, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
            });
        } else {
            return NextResponse.json({ message: 'No models found for this project' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error getting models:', error);
        return NextResponse.json({ message: 'Error fetching models', error: error.message }, { status: 500 });
    }
}