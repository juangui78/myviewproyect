"use server"
import { dbConnected } from "@/api/libs/mongoose";
import Leads from "@/api/models/leads";

export async function createLead(leadData) {
  try {
    await dbConnected();
    const { name, email, phone, message, idProyect, idCompany, terrainId, terrainName } = leadData;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !idProyect || !idCompany) {
      return { 
        success: false, 
        message: "¡Hola! Por favor indícanos tu nombre, correo y teléfono para poder brindarte una atención personalizada." 
      };
    }

    const newLead = new Leads({
      name: name.trim(),
      email: email.trim(),
      phone,
      message,
      idProyect,
      idCompany,
      terrainId,
      terrainName
    });

    await newLead.save();
    return { 
      success: true, 
      message: "¡Tus datos de contacto han sido registrados correctamente! Un asesor de ventas se comunicará contigo pronto." 
    };
  } catch (error) {
    console.error("Error in createLead Server Action:", error);
    return { success: false, message: "Error interno al procesar el registro de contacto. Inténtalo de nuevo." };
  }
}
