"use server"
import Company from "@/api/models/company"
import Plans from "@/api/models/plansM"
import { getPlanJson } from "@/api/others/plans"
import z from 'zod'

export async function saveCompany(data) {
    try {
        //schema to validate data
        //================================================================
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
                status: false
            }
        }

        //check if plan exists
        //================================================================
        const { plan } = resultSchemaRequest.data;
        let idPlan;

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

        //save data
        //================================================================

        resultSchemaRequest.data.id_plan = idPlan;
        const saveCompany = await Company.create(resultSchemaRequest.data)
        const dataResponse = {
            ...saveCompany.toObject(),
            _id: saveCompany._id.toString(),
            id_plan: saveCompany.id_plan.toString()
        }
        
        return {
            message: "Guardado correctamente.",
            status: true,
            data: dataResponse
        }

    } catch (error) {
        return {
            message: "Error en el servidor.",
            status: false
        }
    }
}
