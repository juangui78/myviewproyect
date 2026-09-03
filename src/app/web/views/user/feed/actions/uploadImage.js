"use server";
import { uploadFile } from "@/api/libs/s3";
import { dbConnected } from "@/api/libs/mongoose";

export async function uploadProjectImageAction(projectId, formData) {
  try {
    await dbConnected();
    const file = formData.get("image");
    if (!file) {
      return { success: false, message: "No se proporcionó ningún archivo" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const urlS3 = `${projectId}/landscape/${Date.now()}_${file.name}`;
    const response = await uploadFile(buffer, urlS3);

    if (response.success) {
      return { success: true, url: response.url };
    } else {
      return { success: false, message: "Error al subir la imagen a S3" };
    }
  } catch (error) {
    console.error("Error uploadProjectImageAction:", error);
    return { success: false, message: error.message };
  }
}

export async function upload360PhotoAction(projectId, formData) {
  try {
    await dbConnected();
    const file = formData.get("image");
    if (!file) {
      return { success: false, message: "No se proporcionó ningún archivo" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const urlS3 = `${projectId}/3D/360_${Date.now()}_${file.name}`;
    const response = await uploadFile(buffer, urlS3);

    if (response.success) {
      return { success: true, url: response.url };
    } else {
      return { success: false, message: "Error al subir la imagen 360 a S3" };
    }
  } catch (error) {
    console.error("Error upload360PhotoAction:", error);
    return { success: false, message: error.message };
  }
}
