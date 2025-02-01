'use client'
import { Image } from "@nextui-org/react";
import axios from "axios";
import { Tooltip } from "@nextui-org/react";
import Eye from "@/web/global_components/icons/Eye.jsx";
import { NoteText } from "@/web/global_components/icons/NoteText";
import { Share } from "@/web/global_components/icons/Share";
import { BlocksShuffle3 } from "@/web/global_components/icons/BlocksShuffle3";
import { Ban } from "@/web/global_components/icons/Ban";
import { encrypt } from "@/api/libs/crypto";
import Link from 'next/link';
import {  useEffect, useState } from "react";
import { useSession} from "next-auth/react";



export default function Feed({ search, options }) { 

  const { data: session, status } = useSession();
  const [proyects, setProyects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()  => { 
    // Aqui se traen los proyectos de esta sesión
    const fetchData = async () => {

      if (status !== 'authenticated') return;

      try {
        const response = await axios.get(`/api/controllers/proyects?id_company=${session?.user?.id_company}`)
        setProyects(response.data);
        setLoading(false)
      } catch (error) {
        console.log(error, 'error con el fetch');
      }
    };

    fetchData();
    
  }, [session]);

  return (
    <>
      <div className="grid grid-cols-4 gap-[80px] w-[70%] m-auto mt-[40px]">

        {loading ? (<div><BlocksShuffle3 className="text-white"/></div>) : 
        (
          proyects.length > 0 ? 
          (
            proyects.map((item) => {
              return (
                 <div key={item._id} className="relative flex flex-col col-span-1 ... bg-[#fff] h-[40vh] w-full rounded-lg ... ">
                  <div className="h-[20%] text-black text-2xl pl-[22px] pt-[15px] font-semibold">{item.name}</div>
                    <div className="flex flex-col items-center w-[100%] h-[60%]">
                      <div className="w-[85%] h-[100%]">
                        <Image isBlurred src="/images/imagen___.png" className="object-cover"  height={270}   />
                      </div>
                    </div>
                    <div className="bg-[#fff] z-10 w-[60%] h-[10%] shadow-xl ... rounded-lg absolute bottom-[20px] right-[20px] flex justify-center items-center gap-[10px]">
                       <Link href={{ pathname: `/web/views/visualizer`, query: { id: encrypt(item._id) } }}>
                          <Tooltip content="Visualizar el modelo 3D" showArrow={true}>
                            <Eye className="text-black cursor-pointer" />
                          </Tooltip>
                        </Link >
                      <NoteText className="text-black" />
                      <Share className="text-black" />
                  </div>
               </div>
              )
              })
          ) : (
              <div className="w-[70%] h-full flex flex-col justify-center items-center absolute">
                  <Ban className="text-white" />
                  <div className="text-white text-2xl">!ups, no hay proyectos para mostrar</div>
              </div>
          )
        )}
      </div>
    </>
  );
}
// 668498dfff80cf9e68b09cab