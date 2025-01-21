import { dbConnected } from "@/api/libs/mongoose";
import Model from "@/api/models/models";
import { NextResponse } from "next/server";
import { decrypt } from "@/api/libs/crypto";
import unzipper from "unzipper";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { uploadToS3, getS3File, deleteTempFile } from "@/api/libs/aws";

dbConnected();

const BUCKET_NAME = "myview-models-demo";
const TEMP_FOLDER = "temp/";

export async function POST(request) {
  try {
    const uuid = uuidv4();
    const form = await request.formData();
    const idProyect = decrypt(form.get("idProyect"));
    const file = form.get("file");

    const fileName = file.name;
    const fileSize = file.size;
    const fileExtension = "zip";

    // Subir archivo a S3
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const key = `${TEMP_FOLDER}${idProyect}/${uuid}/${fileName}`;
    const s3Upload = await uploadToS3(BUCKET_NAME, key, buffer, "application/zip");

    // Descargar el archivo desde S3 para descomprimir
    const s3File = await getS3File(BUCKET_NAME, key);
    console.log('archivo descargado');
    

    // Descomprimir con unzipper
    const zipBuffer = s3File.Body;
    const directory = await unzipper.Open.buffer(zipBuffer);

    const extractedFiles = [];
    for (const file of directory.files) {
      if (!file.path.endsWith("/")) {
        const fileBuffer = await file.buffer();
        const fileKey = `${idProyect}/${uuid}/${file.path}`;

        // Subir los archivos descomprimidos a S3
        await uploadToS3(BUCKET_NAME, fileKey, fileBuffer, "application/octet-stream");
        extractedFiles.push({
          name: file.path,
          url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
        });
      }
    }

    

    // Registrar información del modelo
    const modelInfo = {
      name: form.get("name"),
      description: form.get("description"),
      thumbnail: extractedFiles[0]?.url || "", // Asumiendo que el primer archivo es el thumbnail
      model: {
        name: fileName,
        size: fileSize,
        extension: fileExtension,
        files: extractedFiles,
      },
      idProyect: idProyect,
    };

    const newModel = new Model(modelInfo);
    const saved = await newModel.save();

    const formatDate = (date) => {
      const opciones = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      return new Date(date).toLocaleString("es-ES", opciones);
    };

    const response = {
      title: formatDate(saved.creation_date),
      cardTitle: saved.name,
      cardSubtitle: saved.description,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    console.log('no esta funcionando S3');
    
    return NextResponse.json({
      error: error.message,
    });
  }
}
