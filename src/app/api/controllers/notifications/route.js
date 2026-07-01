import { dbConnected } from "@/api/libs/mongoose";
import Model from "@/api/models/models";
import Proyect from "@/api/models/proyect";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

dbConnected();

export async function GET(request) {
  try {
    await dbConnected();
    const session = await getServerSession(AuthOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const idCompany = session?.user?.id_company;
    const isSuperadmin = session?.user?.email === "darksus78@gmail.com";

    let queryFilter = {};
    if (!isSuperadmin) {
      if (!idCompany) {
        return NextResponse.json([]);
      }
      // Buscar todos los proyectos de la compañía del usuario
      const projects = await Proyect.find({ idCompany }, { _id: 1 });
      const projectIds = projects.map(p => p._id);
      queryFilter = { idProyect: { $in: projectIds } };
    }

    // Obtener los modelos ordenados de forma descendente por actualización o creación
    const models = await Model.find(queryFilter)
      .populate("idProyect", "name")
      .sort({ updated_at: -1, creation_date: -1 })
      .limit(10)
      .lean();

    const notifications = models.map(model => {
      const createdTime = model.creation_date ? new Date(model.creation_date).getTime() : 0;
      const updatedTime = model.updated_at ? new Date(model.updated_at).getTime() : createdTime;
      const notesUpdatedTime = model.notes_updated_at ? new Date(model.notes_updated_at).getTime() : 0;

      let type = "new_model";
      let label = "Nuevo modelo subido:";

      if (notesUpdatedTime > createdTime + 5000) {
        type = "note_update";
        label = "Nueva nota de versión:";
      } else if (updatedTime > createdTime + 5000) {
        type = "model_update";
        label = "Modelo modificado:";
      }

      return {
        id: model._id.toString(),
        projectName: model.idProyect?.name || "Proyecto Desconocido",
        projectId: model.idProyect?._id?.toString(),
        modelName: model.name || "Sin nombre",
        versionNotes: model.version_notes || "",
        updatedBy: model.updated_by || "",
        date: model.updated_at || model.creation_date,
        type,
        label
      };
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error en GET /api/controllers/notifications:", error);
    return NextResponse.json(
      { message: "Error al obtener notificaciones", error: error.message },
      { status: 500 }
    );
  }
}
