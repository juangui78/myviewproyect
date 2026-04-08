import { dbConnected } from "@/api/libs/mongoose";
import Proyect from "@/api/models/proyect";
import Model from "@/api/models/models";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/api/auth/[...nextauth]/route";
import style from "./../styles/feed.module.css";
import Cards from "./../components/Cards";

export default async function CardsList({ searchParams }) {
  const session = await getServerSession(AuthOptions);
  let { search }= searchParams;

  if (search === undefined) search = '';

  let data = [];

  try {
    const idCompany = session?.user?.id_company;
    
    if (idCompany) {
      await dbConnected();
      
      const searchParamas = {
        _id: 1,
        name: 1,
        state: 1,
        urlImage: 1,
        creation_date: 1,
      };

      let proyectsFromDB;
      if (search && search !== 'null' && search !== '' && search !== 'undefined') {
        proyectsFromDB = await Proyect.find(
          { idCompany, name: { $regex: search, $options: 'i' } },
          searchParamas
        ).lean();
      } else {
        proyectsFromDB = await Proyect.find({ idCompany }, searchParamas).lean();
      }

      data = await Promise.all(proyectsFromDB.map(async (proyect) => {
        const lastModel = await Model.findOne({ idProyect: proyect._id })
          .sort({ creation_date: -1 })
          .select('creation_date')
          .lean();
        
        return {
          ...proyect,
          _id: proyect._id.toString(),
          lastScanDate: lastModel?.creation_date || proyect.creation_date,
        };
      }));
    }
  } catch (err) {
    console.error("Error cargando proyectos directamente:", err);
    data = []; // fallback para que el render no rompa
  }

  return (
    <div className={`${style.fatherBoxes} min-h-[60vh]...`}>
      <Cards proyects={data} />
    </div>
  )
}