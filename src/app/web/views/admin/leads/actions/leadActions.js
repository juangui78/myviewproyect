"use server"
import { dbConnected } from "@/api/libs/mongoose";
import Leads from "@/api/models/leads";
import Proyect from "@/api/models/proyect"; // ensure model is registered
import Company from "@/api/models/company"; // ensure model is registered
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/api/auth/[...nextauth]/route";

export async function getLeads(filterCompanyId = null) {
  try {
    await dbConnected();
    const session = await getServerSession(AuthOptions);
    if (!session) {
      return { success: false, message: "No autenticado" };
    }

    const isSuperadmin = session.user?.email === "darksus78@gmail.com";
    const rol = session.user?.rol;

    let query = {};
    if (isSuperadmin || rol === "company") {
      if (filterCompanyId) {
        query = { idCompany: filterCompanyId };
      }
    } else if (rol === "admin") {
      const userCompanyId = session.user.id_company;
      if (!userCompanyId) {
        return { success: false, message: "El usuario no tiene una inmobiliaria asociada." };
      }
      query = { idCompany: userCompanyId };
    } else {
      return { success: false, message: "Acceso no autorizado" };
    }

    const leads = await Leads.find(query)
      .populate("idProyect", "name")
      .populate("idCompany", "name")
      .sort({ creation_date: -1 })
      .lean();

    const serializedLeads = leads.map(lead => ({
      ...lead,
      _id: lead._id.toString(),
      idProyect: lead.idProyect ? { ...lead.idProyect, _id: lead.idProyect._id.toString() } : null,
      idCompany: lead.idCompany ? { ...lead.idCompany, _id: lead.idCompany._id.toString() } : null,
      creation_date: lead.creation_date.toISOString()
    }));

    return { success: true, data: serializedLeads };
  } catch (error) {
    console.error("Error in getLeads action:", error);
    return { success: false, message: "Error al obtener la lista de prospectos." };
  }
}

export async function updateLeadStatus(leadId, newStatus) {
  try {
    await dbConnected();
    const session = await getServerSession(AuthOptions);
    if (!session) {
      return { success: false, message: "No autenticado" };
    }

    const lead = await Leads.findById(leadId);
    if (!lead) {
      return { success: false, message: "Prospecto no encontrado." };
    }

    const isSuperadmin = session.user?.email === "darksus78@gmail.com";
    const rol = session.user?.rol;

    if (!isSuperadmin && rol !== "company" && lead.idCompany.toString() !== session.user.id_company) {
      return { success: false, message: "No tienes permiso para modificar este prospecto." };
    }

    lead.status = newStatus;
    await lead.save();

    return { success: true, message: "Estado del prospecto actualizado con éxito." };
  } catch (error) {
    console.error("Error in updateLeadStatus action:", error);
    return { success: false, message: "Error al actualizar el estado del prospecto." };
  }
}
