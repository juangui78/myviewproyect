'use client'
import { Image } from "@nextui-org/react";
import axios from "axios";
import style from "../styles/feed.module.css";
import { ZoomIcon } from "@/web/global_components/icons/zoomIcon";
import { EditIconV2 } from "@/web/global_components/icons/EditIconV2";
import { Tooltip } from "@nextui-org/react";
import { TimelineIco } from "@/web/global_components/icons/timeline";
import { encrypt } from "@/api/libs/crypto";
import Link from 'next/link';
import { use, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";



export default function Feed({ search, options }) {

  
  const { data: session, status } = useSession();
  const [proyectos, setProyectos] = useState([]);
  const [encryptedIds, setEncryptedIds] = useState([]);

  useEffect(()  => { 
    // Aqui se traen los proyectos de esta sesión
    const fetchData = async () => {

      if (status !== 'authenticated') return;

      try {
        console.log('haciendo peticion de proyectos');
        const response = await axios.get(`/api/controllers/proyects?id_company=${session?.user?.id_company}`)
        console.log('aqui debe estar la infop', response.data);
        setProyectos(response.data);
    } catch (error) {
        console.log(error, 'error con el fetch');
    }
    };

    fetchData();
    
  }, [session,]);

  return (
    <>
      {proyectos.length > 0 ? (
        proyectos.map((item) => {
          return (
          <div className={`mx-4 p-4 .. ${style.cards}`} key={item._id}>
            <div className="rounded-2xl">
              <img src="/images/imagen___.png" />
            </div>
            <div className={style.footerCards}>
              <div>
                <h1 className=""> {item.name}</h1>
              </div>
              <div className="text-sm">
                Descripción larga o prueba de descripción
              </div>
              <div className={style.buttonsCards}>
                <div className={style.divToolstip}>
                  <Link
                    href={{ pathname: `/web/views/timeline`, query: { ind: encrypt(item._id) } }}
                    passHref
                    legacyBehavior
                  >
                    <a target="_blank" rel="noopener noreferrer">
                      <Tooltip
                        delay={500}
                        content={
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Resumen</div>
                            <div className="text-tiny">Resumen del proyecto</div>
                          </div>
                        }
                      >
                        <TimelineIco />
                      </Tooltip>
                    </a>
                  </Link>
                </div>
                <div className={style.divToolstip}>
                  <Link
                    href={{ pathname: `/web/views/visualizer`, query: { id: encrypt(item._id) } }}
                  >
                    <Tooltip
                      delay={200}
                      content={
                        <div className="px-1 py-2">
                          <div className="text-small font-bold">Visualizar</div>
                          <div className="text-tiny">Visualizar el modelo 3D</div>
                        </div>
                      }
                    >
                      <ZoomIcon />
                    </Tooltip>
                  </Link>
                </div>
                <div className={style.divToolstip}>
                  <Tooltip
                    delay={100}
                    content={
                      <div className="px-1 py-2">
                        <div className="text-small font-bold">Editar</div>
                        <div className="text-tiny">Editar la información del proyecto</div>
                      </div>
                    }
                  >
                    <EditIconV2 />
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        )})
      ) : (
        <div className="flex flex-col w-full justify-center items-center m-[39px]">
          <h2 className="font-light italic">Aún no tienes modelos escaneados.</h2>
          <Image src="/images/oops.png" alt="oops" width={200} height={200} />
        </div>
      )}
    </>
  );
}
