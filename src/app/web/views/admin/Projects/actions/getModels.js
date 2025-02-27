"use server"
import z from 'zod'
import Model from '@/api/models/models'

//get all models from a project by id

export async function getModels(idProject) {

    try {
        const schema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId")
        const resultSchema = schema.safeParse(idProject)

        if (!resultSchema.success) {
            return { success: false, message: "Invalid ObjectId" }
        }

        //===========================================================

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
        
        return { success: true, data: plainModels }

    } catch (error) {
        return { success: false, message: "Error en el servidor." }
    }
}