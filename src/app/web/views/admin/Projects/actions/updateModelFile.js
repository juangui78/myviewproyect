"use server"
import mongoose from "mongoose";
import { dbConnected } from "@/api/libs/mongoose";
import Model from "@/api/models/models";

export async function updateModelFile(idProject, idModel, name, finalUrl, version_notes) {

    try {

        dbConnected() // connect to the database

        if (!name || !finalUrl || !idModel) {
            return {
                message: "Faltan datos para actualizar el modelo",
                status: 400,
                success: false
            }
        }

        const modelUpdated = await Model.findOneAndUpdate(
            { _id: idModel, idProyect: idProject },
            { 
                $set: {
                    name: name,
                    "model.url": finalUrl,
                    version_notes: version_notes,
                    update_date: new Date()
                }
            },
            { new: true }
        )

        if (!modelUpdated) {
            return {
                message: "Error al actualizar el modelo o no encontrado",
                status: 404, // Not Found or Error
                success: false
            }
        }

        return {
            message: "Modelo actualizado correctamente",
            status: 200,
            success: true
        }

    } catch (error) {
        console.log(error)

        return {
            message: "Error en el servidor",
            status: 500,
            success: false
        }

    }


}
