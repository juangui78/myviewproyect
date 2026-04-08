"use server"
import project from "@/api/models/proyect";
import { dbConnected } from "@/api/libs/mongoose";
import { decrypt } from "@/api/libs/crypto";

dbConnected();

export async function getAllProjects(id) {
    try {
        const idDecrypted = decrypt(id);
        const projects = await project.find({ idCompany: idDecrypted }, { idCompany: 0,  creation_date: 0, __v : 0 }).lean();
        const plainProjects = projects.map(proj => ({
            ...proj,
            _id: proj._id.toString(),
        }));

        return {
            success: true,
            data: plainProjects
        }

    } catch (error) {
        console.log(error)
        return {
            message: "Error en el servidor.",
            success: false
        }
    }
}