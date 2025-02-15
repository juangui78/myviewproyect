"use server"
import { dbConnected } from "@/api/libs/mongoose"
import Company from "@/api/models/company"
import z from "zod"

dbConnected()

export async function getPagination(page) {

    try {
        const schemaInt = z.number()
        const resultSchemaInt = schemaInt.safeParse(page)

        if (!resultSchemaInt.success) {
            return { 
                message: "Tipo de datos incorrectos.",
                success: false
            }
        }

        const skip = (page - 1) * 10
        const limit = 10
    
        const companies = await Company.find().skip(skip).limit(limit).lean()
    
        const serializedCompanies = companies.map(company => ({
            ...company,
            _id: company._id.toString(),
          }));
        
        return {
            data: serializedCompanies,
            success: true
        }
    } catch (error) {
        return {
            message: "Error en el servidor.",
            success: false
        }
    }
 
}