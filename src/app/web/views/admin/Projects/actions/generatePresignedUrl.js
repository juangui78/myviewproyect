"use server";
import mongoose from "mongoose";
import { getUploadPresignedUrl } from "@/api/libs/s3";

export async function generatePresignedUrlAction(idProject, fileName) {
    try {
        const idModelCrated = new mongoose.Types.ObjectId(); // Create a new unique ID for the model
        const urlS3Key = `${idProject}/${idModelCrated}/3D/${fileName}`;
        
        const response = await getUploadPresignedUrl(urlS3Key);

        if (response.success) {
            return {
                success: true,
                idModel: idModelCrated.toString(),
                uploadUrl: response.uploadUrl,
                finalUrl: response.finalUrl,
            };
        } else {
            return {
                message: "Error generando la URL de subida",
                status: 500,
                success: false,
            };
        }
    } catch (error) {
        console.error("generatePresignedUrl error", error);
        return {
            message: "Error en el servidor al generar URL",
            status: 500,
            success: false,
        };
    }
}
