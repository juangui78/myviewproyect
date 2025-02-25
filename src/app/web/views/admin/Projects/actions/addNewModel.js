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

        const files = {
            bin: formData.get('bin'),
            gltf: formData.get('gltf'),
            textures: formData.getAll('textures'),
        }

        if (!files.bin || !files.gltf || !files.textures) { //validate data from frontend
            return {
                message: "Debe seleccionar todos los archivos",
                status: 400,
                success: false
            }
        }

        const uploadedFiles = {}

        const uploadPromies = Object.entries(files).map(async ([key, file]) => { //iterate over files and upload to s3
            if (key === "textures"){
                const texturesUrl = await Promise.all(file.map(async (texture) => { //iterate over the textures and upload to s3
                    const urlS3 = `${idProject}/${idModelCrated}/3D/textures/${texture.name}`
                    const buffer = Buffer.from(await texture.arrayBuffer())
                    const response = await uploadFile(buffer, urlS3)

                    if (response.success) return response.url
                }))
                uploadedFiles[key] = texturesUrl

            }else{ // upload bin and gltf to s3 in a folder called 3D
                const urlS3 = `${idProject}/${idModelCrated}/3D/${file.name}`
                const buffer = Buffer.from(await file.arrayBuffer())
                const response = await uploadFile(buffer, urlS3)
               uploadedFiles[key] = response.success ? response.url : ''
            }
        })

        await Promise.all(uploadPromies) // wait for all the files to be uploaded

        //=========================================================================================================

        if (uploadedFiles.bin && uploadedFiles.gltf && uploadedFiles.textures){ // validate if all files were uploaded
            // save the model in the database
            const description = "descripcion de prueba"
            const name = "nombre de prueba"
            const newModel = new Model({
                _id: idModelCrated,
                name: name,
                description: description,
                model: {
                    url : uploadedFiles.gltf,
                },
                idProyect: idProject,
                terrains: []
            })

            const modelCreated = await newModel.save()

            if (!modelCreated){
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