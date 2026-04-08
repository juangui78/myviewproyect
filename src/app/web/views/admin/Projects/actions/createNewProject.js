"use server";
import { dbConnected } from "@/api/libs/mongoose";
import mongoose from "mongoose";
import { uploadFile } from "@/api/libs/s3";
import { decrypt } from "@/api/libs/crypto";
import Proyect from "@/api/models/proyect";
import z from "zod";

const projectSchema = z.object({
  name: z.string().min(0).max(60),
  description: z.string().min(1).max(300),
  department: z.string().min(2).max(60),
  city: z.string().min(2).max(60),
  address: z.string().min(2).max(300),
  areaOfThisproyect: z.number().min(100),
  notes: z.string().max(500),
  linkWeb: z.string(),
});

export async function createNewProject(formData) {
  try {
    dbConnected();

    const idCompanyEncrypt = formData.get("idCompany");
    const idCompany = decrypt(idCompanyEncrypt); // decrypt the idCompany
    const idOfThisProject = new mongoose.Types.ObjectId(); // create a new ObjectId for the project

    // Validate form data
    const data = {
      _id: idOfThisProject,
      name: formData.get("name"),
      description: formData.get("description"),
      department: formData.get("department"),
      city: formData.get("city"),
      address: formData.get("address"),
      areaOfThisproyect: parseFloat(formData.get("areaOfThisproyect")),
      dateInit: formData.get("dateInit"),
      dateFinish: formData.get("dateFinish"),
      notes: formData.get("notes"),
      linkWeb: formData.get("linkWeb"),
      idCompany: idCompany,
    };

    const parseData = projectSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      department: formData.get("department"),
      city: formData.get("city"),
      address: formData.get("address"),
      areaOfThisproyect: parseFloat(formData.get("areaOfThisproyect")),
      linkWeb: formData.get("linkWeb"),
      notes: formData.get("notes"),
    });

    if (!parseData.success) {
      return {
        message: "Datos del proyecto no válidos",
        status: 400,
      };
    }

    // upload the image to S3
    //=========================================================================================================
    const File = formData.get("urlImage");

    const buffer = Buffer.from(await File.arrayBuffer());
    const urlS3 = `${idOfThisProject}/landscape/${File.name}`;
    const response = await uploadFile(buffer, urlS3);

    if (response.success) data.urlImage = response.url;
    else data.urlImage = "";

    //create a new project
    //=========================================================================================================
    const newProject = new Proyect(data);
    const savedProject = await newProject.save();

    if (!savedProject) {
      return {
        message: "Error al crear el proyecto",
        status: 500,
      };
    }

    return {
      message: "Proyecto creado correctamente",
      status: 200,
    };
  } catch (error) {
    return {
      message: "Error al crear el proyecto",
      status: 500,
      error: error.message,
    };
  }
}
