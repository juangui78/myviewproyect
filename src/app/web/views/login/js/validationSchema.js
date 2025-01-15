//you also can use import * as Yup from 'yup'
//you have to instead Yup before any function

import { string, object } from 'yup';

export const validationSchemaLogin = object({
    email: 
        string()
        .email("Por favor ingresa un correo válido")
        .required("Correo es requerido"),
    password:
        string()
        .required("Contraseña es requerida")
        // .min(8, 'La contraseña debe tener al menos 8 caracteres')
        // .matches(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
        // .matches(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
        // .matches(/[0-9]/, 'La contraseña debe contener al menos un número')
        // .matches(/[\W_]/, 'La contraseña debe contener al menos un carácter especial')
        // .matches(/^\S*$/, 'La contraseña no puede contener espacios')
})
