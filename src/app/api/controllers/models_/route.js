import { dbConnected } from "@/api/libs/mongoose";
import Model from "@/api/models/models";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { decrypt } from "@/api/libs/crypto";
import fs from "fs";
import path from "path";
import unzipper from 'unzipper';
import { v4 as uuidv4 } from "uuid";
import {z} from 'zod';


dbConnected();

const modelSchemaZod = z.object({ //schema of zod to validate data
  texture_length: z.string(),
  length_files: z.string(),
  id_user: z.string(),
  length_textures: z.string(),
  name: z.string(),
  description: z.string(),
  address: z.string(),
  city: z.string(),
  m2: z.string()
});


//====================================================================//
// METHODS

export async function POST(request) { //method post width model data
  //save and create a new model 
  try {
    const uuid = uuidv4();
    const form = await request.formData(); // get formdata
    const idProyect = decrypt(form.get('idProyect'));
    const file = form.get("file");

    const fileName = file.name;
    const fileSize = file.size;
    const fileExtension = "gltf";
    const folder = "/"+idProyect+"/" + uuid + "";

    const urlModels = path.join(process.cwd(),"/public/modelers/"+idProyect+"/" + uuid + "");
    const urlCompresed = path.join(process.cwd(),"/public/compresed/"+idProyect+"/" + uuid + "");

    await fs.promises.mkdir(urlCompresed, {recursive: true}); //create folder for the moment

    const bytes = await file.arrayBuffer(); //transform to bytes the file
    const buffer = Buffer.from(bytes); // buffered the bytes

    writeFile(urlCompresed + "/" + fileName, buffer); //add the compresed file to a folder
    
    //descompres the file to order the data
    const directory = await unzipper.Open.file(urlCompresed + "/" + fileName);
    await directory.extract({path : urlModels});

    //Delete the folders compresed
    await fs.promises.rm(path.join(process.cwd(),"/public/compresed/"+idProyect+"/"), {recursive : true, force: true});

    const modelInfo = {
      name : form.get("name"),
      description : form.get("description"),
      thumbnail : "",
      model : {
        name : fileName,
        size : fileSize,
        extension : fileExtension,
        folder : folder
      },
      idProyect : idProyect
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
        hour12: true, // Para formato de 24 horas
      };
      return new Date(date).toLocaleString("es-ES", opciones);
    };

    const response = {
        title:  formatDate(saved.creation_date),
        cardTitle: saved.name,
        cardSubtitle : saved.description
    }

    return NextResponse.json(response);
  
  } catch (error) {
    console.log(error)
    return NextResponse.json({
      error,
    });
  }
}
