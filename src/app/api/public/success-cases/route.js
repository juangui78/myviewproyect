import { dbConnected } from "@/api/libs/mongoose";
import Proyect from "@/api/models/proyect";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnected();
    
    // Buscar proyectos en la base de datos cuyos nombres contengan "Laurum" o "Aldana"
    const projects = await Proyect.find(
      { name: { $regex: /laurum|aldana/i } },
      { _id: 1, name: 1, description: 1, urlImage: 1 }
    ).lean();

    return NextResponse.json(
      {
        success: true,
        projects: projects.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          description: p.description,
          urlImage: p.urlImage || ""
        }))
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
        }
      }
    );
  } catch (error) {
    console.error("Error fetching success cases projects from DB:", error);
    return NextResponse.json(
      { success: false, message: "Error loading project images from DB" },
      { status: 500 }
    );
  }
}
