"use server"
import { uploadFile } from "@/api/libs/s3";
import mongoose from "mongoose";
import { dbConnected } from "@/api/libs/mongoose";
import Model from "@/api/models/models";

export async function addNewModel(idProject, idModel, name, finalUrl, version_notes) {

    try {

        dbConnected() // connect to the database

        if (!name || !finalUrl || !idModel) {
            return {
                message: "Faltan datos para guardar el modelo",
                status: 400,
                success: false
            }
        }

        // save the model in the database
        const description = "descripcion de prueba"
        const newModel = new Model({
            _id: idModel,
            name: name,
            description: description,
            model: {
                url: finalUrl,
            },
            idProyect: idProject,
            version_notes: version_notes,
            terrains: []
        })

        const modelCreated = await newModel.save()

        if (!modelCreated) {
            return {
                message: "Error al crear el modelo",
                status: 500,
                success: false
            }
        }

        return {
            message: "Modelo guardado correctamente",
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