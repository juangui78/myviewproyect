import { dbConnected } from "@/api/libs/mongoose";
import Proyect from "@/api/models/proyect";
import Model from "@/api/models/models";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/api/auth/[...nextauth]/route";
import { encrypt } from "@/api/libs/crypto";
import style from "./../styles/feed.module.css";
import Cards from "./../components/Cards";

export default async function CardsList({ searchParams }) {
  const session = await getServerSession(AuthOptions);
  let { search }= searchParams;

  if (search === undefined) search = '';

  let data = [];
  let totalProyects = 0;

  try {
    const idCompany = session?.user?.id_company;
    const isSuperadmin = session?.user?.email === "darksus78@gmail.com";
    
    if (idCompany || isSuperadmin) {
      await dbConnected();
      
      const queryFilter = isSuperadmin ? {} : { idCompany };
      totalProyects = await Proyect.countDocuments(queryFilter);
      
      const searchParamas = {
        _id: 1,
        name: 1,
        description: 1,
        city: 1,
        department: 1,
        state: 1,
        urlImage: 1,
        creation_date: 1,
      };

      let proyectsFromDB;
      if (search && search !== 'null' && search !== '' && search !== 'undefined') {
        const searchRegex = { $regex: search, $options: 'i' };
        const orConditions = [
          { name: searchRegex },
          { city: searchRegex },
          { department: searchRegex },
        ];

        const regexFilter = isSuperadmin 
          ? { $or: orConditions }
          : { idCompany, $or: orConditions };

        proyectsFromDB = await Proyect.find(
          regexFilter,
          searchParamas
        ).sort({ creation_date: -1 }).lean();
      } else {
        proyectsFromDB = await Proyect.find(queryFilter, searchParamas).sort({ creation_date: -1 }).lean();
      }

      const projectIds = proyectsFromDB.map(p => p._id);
      const projectIdsString = projectIds.map(id => id.toString());

      // Consulta en lote única para obtener las fechas del último escaneo sin waterfall N+1
      const lastModels = await Model.aggregate([
        {
          $match: {
            $or: [
              { idProyect: { $in: projectIds } },
              { idProyect: { $in: projectIdsString } }
            ]
          }
        },
        { $sort: { creation_date: -1 } },
        {
          $group: {
            _id: "$idProyect",
            creation_date: { $first: "$creation_date" }
          }
        }
      ]);

      const lastModelMap = new Map();
      lastModels.forEach(m => {
        if (m._id) lastModelMap.set(m._id.toString(), m.creation_date);
      });

      data = proyectsFromDB.map((proyect) => {
        const pId = proyect._id.toString();
        return {
          ...proyect,
          _id: pId,
          encryptedId: encrypt(pId),
          lastScanDate: lastModelMap.get(pId) || proyect.creation_date,
        };
      });
    }
  } catch (err) {
    console.error("Error cargando proyectos directamente:", err);
    data = []; // fallback para que el render no rompa
  }

  return (
    <div className={`${style.fatherBoxes} min-h-[60vh]`}>
      <Cards proyects={data} totalProyects={totalProyects} />
    </div>
  )
}