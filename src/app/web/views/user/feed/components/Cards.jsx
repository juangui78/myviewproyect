'use client'
import { Image } from "@nextui-org/react";
import axios from "axios";
import { Tooltip } from "@nextui-org/react";
import Eye from "@/web/global_components/icons/Eye.jsx";
import  NoteText  from "@/web/global_components/icons/NoteText";
import { Share } from "@/web/global_components/icons/Share";
import { Ban } from "@/web/global_components/icons/Ban";
import { encrypt } from "@/api/libs/crypto";
import Link from 'next/link';
import {  useEffect, useState } from "react";
import { useSession} from "next-auth/react";
import { useDisclosure } from "@nextui-org/react";
import DrawerInfo from "./DrawerInfo";

export default function Cards({ search, changeStatus}) { 
  
  const { data: session, status } = useSession();
  const [proyects, setProyects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_id, setId] = useState('');
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  useEffect(()  => { 
    const fetchData = async () => {

      if (status !== 'authenticated') return;

      try {
        const response = await axios.get(`/api/controllers/proyects?id_company=${session?.user?.id_company}&search=${search}`);
        setProyects(response.data);
        setLoading(false)
        console.log(response.data)
      } catch (error) {
        console.log(error, 'error con el fetch');
      } finally {
        setLoading(false);
        changeStatus()
      }
    };

    fetchData();
    
  }, [session, status]);


  const handleOpen = (id) => {
      setId(id);
      onOpen()
  }

  return (
      <div className="grid  2xl:grid-cols-4 gap-[60px] w-[70%] m-auto mt-[40px]  lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {loading ? (<div></div>) : 
        (
          proyects.length > 0 ? 
          (
            proyects.map((item) => {
              return (
                 <div key={item._id} className="relative flex flex-col col-span-1 ...   bg-[#fff] h-[40vh] w-full rounded-lg ... max-[730px]:w-[65%] max-[730px]:m-auto max-[500px]:w-[100%] ">
                  <div className="h-[20%] text-black text-xl p-[20px] font-semibold">{item.name}</div>
                    <div className="flex flex-col items-center w-[100%] h-[70%]">
                      <div className="flex relative w-[85%] h-[100%]">
                        <Image isBlurred src="/images/imagen___.png" className="object-cover h-[100%]" />
                      </div>
                    </div>
                    <div className="bg-[#fff] z-10 w-[60%] h-[10%] shadow-xl ... rounded-lg absolute bottom-[20px] right-[20px] flex justify-center items-center gap-[10px]">
                       <Link href={{ pathname: `/web/views/visualizer`, query: { id: encrypt(item._id) } }}>
                          <Tooltip content="Visualizar el modelo 3D" showArrow={true}>
                            <Eye className="text-black cursor-pointer" />
                          </Tooltip>
                        </Link >

                        <Tooltip content="Información del proyecto" showArrow={true}>
                            <NoteText className="text-black cursor-pointer" onClick={() => handleOpen(item._id)} />
                          </Tooltip>
                      <Share className="text-black" />
                  </div>
               </div>
              )
              })
          ) : (
              <div className="w-[70%] h-[30vh] flex flex-col justify-center items-center absolute">
                  <Ban className="text-white" />
                  <div className="text-white text-2xl">!ups, no hay proyectos para mostrar</div>
              </div>
          )
        )}

        <DrawerInfo isOpen={isOpen} onOpen={onOpen} onOpenChange={onOpenChange} _id={_id}/>
      </div>
  );
}
