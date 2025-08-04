import axios from "axios";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/api/auth/[...nextauth]/route";
import style from "./../styles/feed.module.css";
import Cards from "./../components/Cards";

export default async function CardsList({ searchParams }) {
  const session = await getServerSession(AuthOptions);
  let { search }= searchParams;
  const URL_PROJECT = process.env.URL_PROJECT;

  if (search === undefined) search = '';

  const data = [];
  const response = await axios.get(
    `${URL_PROJECT}api/controllers/proyects?id_company=${session?.user?.id_company}&search=${search}`,
  );

  if (response && response.data) data.push(...response.data); 
  
  return (
    <>
      <div className={`${style.fatherBoxes} min-h-[60vh]...`}>
        <Cards proyects={data} />
      </div>
    </>
  )
}