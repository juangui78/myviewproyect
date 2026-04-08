"use server"
import z from 'zod'
import Model from '@/api/models/models'
import Proyect from '@/api/models/proyect'
import Plan from '@/api/models/plansM'
//get all models from a project by id

export async function getModels(idProject) {

    try {
        const schema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId")
        const resultSchema = schema.safeParse(idProject)

        if (!resultSchema.success) {
            return { success: false, message: "Invalid ObjectId" }
        }

        //===========================================================
        //search plan to know the max number of models

        const getIdCompany = await Proyect.findById(idProject).populate('idCompany');
        const idPlan = getIdCompany.idCompany.id_plan;
        const additionalProyect = getIdCompany.idCompany.additionalProyect;

        const getPlan = await Plan.findById(idPlan, 
            { _id: 0, __v : 0}
        ).lean();

        const models = await Model.find({ idProyect: idProject }, {
            terrains: 0,
            model: 0,
            __v: 0,
            idProyect: 0
        }).sort({ creation_date: -1 })

        if (!models) {
            return { success: false, message: "Error al consultar los datos" }
        }

        //serializate data to plain object
        //neccesary to convert return from server action

        const plainModels = models.map((model) => {
            return {
                ...model.toObject(),
                _id: model._id.toString(),
                creation_date: model.creation_date.toISOString()
            }
        })
        
        return { success: true, 
            status: 200,
            data: {
                plainModels,
                getPlan,
                additionalProyect
            }
        }

    } catch (error) {
        return { success: false, message: "Error en el servidor." }
    }
}