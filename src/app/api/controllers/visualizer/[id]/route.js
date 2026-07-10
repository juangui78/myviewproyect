import { dbConnected } from '@/api/libs/mongoose';
import Model from '@/api/models/models'
import Proyect from "@/api/models/proyect";
import Company from "@/api/models/company";
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

dbConnected();

// get model by id
export async function GET(request, {params}) {
    const { id } = params;
    try {
        await dbConnected();
        const findProyect = await Proyect.findById(id);

        if (findProyect) {
            const idProyect = findProyect?._id;
            let getModel = await Model.findOne({idProyect: idProyect},  { __v : 0, idProyect: 0}).sort({ creation_date : -1 });
            if (getModel && (getModel.background360Rotation === undefined || getModel.background360Rotation === 0)) {
                // Buscar si algún otro modelo del proyecto tiene calibración
                const calibratedModel = await Model.findOne({ 
                    idProyect: idProyect, 
                    background360Rotation: { $exists: true, $ne: 0 } 
                });
                if (calibratedModel) {
                    getModel = getModel.toObject();
                    getModel.background360Rotation = calibratedModel.background360Rotation;
                    getModel.background360RotationX = calibratedModel.background360RotationX || 0;
                    if (!getModel.background360) {
                        getModel.background360 = calibratedModel.background360;
                    }
                }
            }
            const getProject = await Proyect.findById(idProyect, { __v : 0, _id: 0, state: 0, creation_date: 0}).populate("idCompany", "name cell email");
            
            const data = {
                model: getModel,
                proyect: getProject
            }

            return NextResponse.json(data, { 
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
            });
        } else {
            console.log('no ha encontrado proyecto del query');
            return NextResponse.json({ message: 'Project not found' }, { status: 404 });
        }
    } catch (error) {
        console.error("Error en GET /api/controllers/visualizer/[id]:", error);
        return NextResponse.json({message: 'Invalid Id'}, { status: 500 })
    }
}

// Actualizar terrenos de un Modelo
export async function POST(request, { params }) {
    const { id } = params;
    try {
        await dbConnected();
        
        const { terrains, modelID, view360Markers, version_notes, updated_by, defaultCamera, background360Rotation, background360RotationX } = await request.json();
        console.log('aqui llega el ID: ', modelID);
        console.log('Terrains received:', terrains);
        console.log('aqui llegan los markers 360: ', view360Markers);
        console.log('Version notes received:', version_notes);
        console.log('Updated by:', updated_by);
        console.log('Default camera received:', defaultCamera);
        console.log('Background 360 rotation received:', background360Rotation);
        console.log('Background 360 rotation X received:', background360RotationX);
        
        // Encuentra el proyecto y actualiza los terrenos
        const model = await Model.findById(modelID);
        if (!model) {
            console.log('Model not found');
            return NextResponse.json({ message: 'Model not found' }, { status: 404 });
        }

        if (terrains) model.terrains = terrains;
        if (view360Markers) {
            model.markers = view360Markers;
            model.markModified('markers'); // Force Mongoose to save deep changes (yawOffset) in markers array
        }
        if (defaultCamera) {
            model.defaultCamera = defaultCamera;
            model.markModified('defaultCamera');
        }
        if (background360Rotation !== undefined) {
            model.background360Rotation = background360Rotation;
        }
        if (background360RotationX !== undefined) {
            model.background360RotationX = background360RotationX;
        }
        if (version_notes !== undefined) {
            model.version_notes = version_notes;
            if (updated_by) model.updated_by = updated_by;
            model.notes_updated_at = new Date();
        }
        model.updated_at = new Date();
        await model.save();

        // Propagar background360 y sus rotaciones a todos los modelos del proyecto
        if (background360Rotation !== undefined || background360RotationX !== undefined) {
            const updateFields = {};
            if (background360Rotation !== undefined) {
                updateFields.background360Rotation = background360Rotation;
            }
            if (background360RotationX !== undefined) {
                updateFields.background360RotationX = background360RotationX;
            }
            if (model.background360) {
                updateFields.background360 = model.background360;
            }

            if (Object.keys(updateFields).length > 0) {
                await Model.updateMany(
                    { idProyect: model.idProyect },
                    { $set: updateFields }
                );
                console.log(`Propagated background settings to all models of project ${model.idProyect}`);
            }
        }

        console.log('Terrains saved successfully');
        return NextResponse.json({ message: 'Terrains saved successfully', model });
    } catch (error) {
        console.error('Error en POST:', error);
        return NextResponse.json({ message: 'Error saving terrains', error }, { status: 500 });
    }
}