import * as Yup from 'yup';

export const validationSchemaInmo = Yup.object({
    name: Yup.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre debe tener máximo 100 caracteres')
    .required('El nombre es requerido'),
    department: Yup.string()
    .min(3, 'El departamento debe tener al menos 3 caracteres')
    .max(60, 'El departamento debe tener máximo 60 caracteres')
    .required('El departamento es requerido'),
    city: Yup.string()
    .min(3, 'La ciudad debe tener al menos 3 caracteres')
    .max(60, 'La ciudad debe tener máximo 60 caracteres')
    .required('La ciudad es requerida'),
    address: Yup.string()
    .min(3, 'La dirección debe tener al menos 3 caracteres')
    .max(100, 'La dirección debe tener máximo 100 caracteres')
    .required('La dirección es requerida'),
    cell: Yup.string()
    .matches(/^[0-9]+$/, 'El celular debe ser un número')
    .max(10, 'El celular debe tener máximo 10 dígitos')
    .min(10, 'El celular debe tener mínimo 10 dígitos')
    .required('El celular es requerido'),
    email: Yup.string()
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'El email no es válido')
    .required('El email es requerido'),
    geographicScope: Yup.string()
    .required('El alcance geográfico es requerido'),
    propertyType: Yup.string()
    .required('El tipo de propiedad es requerido'),
    marketApproach: Yup.string()
    .required('El enfoque de mercado es requerido')
})

