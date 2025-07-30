"use server"
import { dbConnected } from "@/api/libs/mongoose";

export async function createNewProject(formData) {

    try {
        dbConnected()

        const data = {
            name: formData.get("name"),
            description: formData.get("description"),
            department: formData.get("department"),
            city: formData.get("city"),
            address: formData.get("address"),
            areaOfThisproyect: formData.get("areaOfThisproyect"),
            dateInit: formData.get("dateInit"),
            dateFinish: formData.get("dateFinish"),
            urlImage: formData.get("urlImage"),
            notes: formData.get("notes"),
            linkWeb: formData.get("linkWeb"),
        }


        console.log(data)


    } catch (error) {
        console.log(error)
    }
}