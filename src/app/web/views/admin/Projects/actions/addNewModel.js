"use server"
import { uploadFile } from "@/api/libs/s3";
import mongoose from "mongoose";
import { dbConnected } from "@/api/libs/mongoose";
import Model from "@/api/models/models";

export async function addNewModel(formData) {

    try {

        dbConnected() // connect to the database

        const idModelCrated = new mongoose.Types.ObjectId() //create _id object from moongose
        const idProject = formData.get('idProject')

        const file = formData.get('glb')

        if (!file) { //validate data from frontend
            return {
                message: "Debe seleccionar el archivo .glb",
                status: 400,
                success: false
            }
        }

        const urlS3 = `${idProject}/${idModelCrated}/3D/${file.name}`
        const buffer = Buffer.from(await file.arrayBuffer())
        const response = await uploadFile(buffer, urlS3)

        if (response.success) { // validate if all files were uploaded
            // save the model in the database
            const description = "descripcion de prueba"
            const name = file.name
            const newModel = new Model({
                _id: idModelCrated,
                name: name,
                description: description,
                model: {
                    url: response.url,
                },
                idProyect: idProject,
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
                message: "Modelo subido correctamente",
                status: 200,
                success: true
            }
        }

        return {
            message: "Error al subir modelo",
            status: 500,
            success: false
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