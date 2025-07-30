"use server"
import z from "zod";
import Company from "@/api/models/company";
import Plans from "@/api/models/plansM";
import { dbConnected } from "@/api/libs/mongoose"
import { getPlanJson } from "@/api/others/plans"

dbConnected()

export async function getDataToEditInmo(_id) {

    try {
        const schema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId")
        const resultSchema = schema.safeParse(_id)

        if (!resultSchema.success) { //when the id is not a valid ObjectId
            return {
                message: "invalid id",
                status: 400,
                success: false
            }
        }

        const getCompany = await Company.findOne( // get info company
            { _id },
            { _id: 0, active: 0, __v: 0, creationDate: 0 }).lean()

        if (!getCompany) return {
            message: "Company not found",
            status: 404,
            success: false
        }


        const getTypeOfPlan = await Plans.findOne( // get type of plan
            { _id: getCompany.id_plan },
            { typeOfplan: 1, _id: 0 }
        )

        if (!getTypeOfPlan) return {
            message: "Plan not found",
            status: 404,
            success: false
        }

        const data = getCompany;
        data.typeOfPlan = getTypeOfPlan.typeOfplan;
        delete data.id_plan;

        return {
            message: "Company data retrieved successfully",
            status: 200,
            success: true,
            data: data
        }

    } catch (error) {
        return {
            message: "Server error",
            status: 500,
            success: false
        }
    }
}


export async function updateCompany(data, _id) {

    try {

        const schemaRequest = z.object({
            name: z.string()
                .min(3, 'El nombre debe tener al menos 3 caracteres')
                .max(100, 'El nombre debe tener máximo 100 caracteres'),
            department: z.string()
                .min(3, 'El departamento debe tener al menos 3 caracteres')
                .max(60, 'El departamento debe tener máximo 60 caracteres'),
            city: z.string()
                .min(3, 'La ciudad debe tener al menos 3 caracteres')
                .max(60, 'La ciudad debe tener máximo 60 caracteres'),
            address: z.string()
                .min(3, 'La dirección debe tener al menos 3 caracteres')
                .max(100, 'La dirección debe tener máximo 100 caracteres'),
            cell: z.string()
                .min(10, 'El celular debe tener mínimo 10 dígitos')
                .max(10, 'El celular debe tener máximo 10 dígitos')
                .regex(/^[0-9]+$/, 'El celular debe ser un número'),
            email: z.string().email("El email no es válido"),
            geographicScope: z.string()
                .min(1, 'El alcance geográfico es requerido'),
            propertyType: z.string()
                .min(1, 'El tipo de propiedad es requerido'),
            marketApproach: z.string()
                .min(1, 'El enfoque de mercado es requerido'),
            plan: z.string()
                .min(1, 'El plan es requerido'),
        })

        const resultSchemaRequest = schemaRequest.safeParse(data)

        if (!resultSchemaRequest.success) {
            return {
                message: "Tipo de datos incorrectos.",
                status: 400,
            }
        }

        //check if plan exists
        //================================================================
        let idPlan;
        const { plan } = resultSchemaRequest.data;

        const planExists = await Plans.findOne({ typeOfplan: plan });

        if (!planExists) {
            const jsonPlan = getPlanJson(plan); 
            const savePLan = await Plans.create(jsonPlan);

            if (!savePLan) {
                return {
                    message: "Error al crear el plan.",
                    status: false
                }
            }

            idPlan = savePLan._id;
        }
        else idPlan = planExists._id;

        resultSchemaRequest.data.id_plan = idPlan;


        const editCompany = await Company.findOneAndUpdate(
            { _id: _id },
            resultSchemaRequest.data,
        )

        if (!editCompany) {
            return {
                message: "Company not found",
                status: 404,
            }
        }

        return {
            message: "Company updated successfully",
            status: 200,
        }

    } catch (error) {
        console.log(error)
    }
}