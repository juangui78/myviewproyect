import * as Yup from 'yup';

export const validationSchemaNewProject = Yup.object({
    name: Yup.string().min(0).max(60).required("El nombre es requerido"),
    description: Yup.string().min(1).max(300).required("La descripción es requerida"),
    department: Yup.string().min(2).max(60).required("El departamento es requerido"),
    city: Yup.string().min(2).max(60).required("La ciudad es requerida"),
    address: Yup.string().min(2).max(300).required("La dirección es requerida"),
    areaOfThisproyect: Yup.number().min(100).required("El área del proyecto es requerida"),
    notes: Yup.string().max(500).optional(),
    linkWeb: Yup.string().url("El enlace debe ser una URL válida").optional(),
})