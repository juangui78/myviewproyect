import { dbConnected } from "@/api/libs/mongoose";
import Model from "@/api/models/models";
import { NextResponse } from "next/server";
import { decrypt } from "@/api/libs/crypto";
import unzipper from "unzipper";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

dbConnected();

const BUCKET_NAME = "myview-models-demo";
const TEMP_FOLDER = "temp/";

export async function POST(request) {
  try {
    const uuid = uuidv4();
    const form = await request.formData();
    const idProyect = decrypt(form.get("idProyect"));
    const file = 'https://myview-models-demo.s3.sa-east-1.amazonaws.com/Conception/'



    const fileName = file.name;
    const fileSize = file.size;
    const fileExtension = "zip";

  
    
    

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
    
    
    return NextResponse.json({
      error: error.message,
    });
  }
}
