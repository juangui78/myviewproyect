'use client'
import { Card, Image, CardFooter, CardHeader, Button } from "@nextui-org/react";
import axios from "axios";
import { Tooltip } from "@nextui-org/react";
import Eye from "@/web/global_components/icons/Eye.jsx";
import NoteText from "@/web/global_components/icons/NoteText";
import Share from "@/web/global_components/icons/Share";
import Qr from "@/web/global_components/icons/Qr";
import { Ban } from "@/web/global_components/icons/Ban";
import { encrypt } from "@/api/libs/crypto";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDisclosure } from "@nextui-org/react";
import DrawerInfo from "./DrawerInfo";
import ModalUsersInvited from "./ModalUsersInvited";
import ModalQr from "./ModalQr";

export default function Cards({ search, changeStatus }) {

  const { data: session, status } = useSession();
  const [proyects, setProyects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_id, setId] = useState('');
  const [ID_USER, setID_USER] = useState(null);

  const { isOpen, onOpenChange } = useDisclosure(); // drawer unfo
  const { isOpen: isOpenUsers, onOpenChange: onOpenChangeUsers } = useDisclosure(); // modal users
  const { isOpen: isOpenQr, onOpenChange: onOpenChangeQr } = useDisclosure(); // modal qr

  useEffect(() => {
    const fetchData = async () => {

      if (status !== 'authenticated') return;

      try {
        const response = await axios.get(`/api/controllers/proyects?id_company=${session?.user?.id_company}&search=${search}`);
        setProyects(response.data);
        setLoading(false)
        // console.log(response.data)
      } catch (error) {
        console.log(error, 'error con el fetch');
      } finally {
        setLoading(false);
        changeStatus()
      }
    };

    fetchData();

  }, [session, status]);


  const handleOpen = (id) => { //open drawer info
    setId(id);
    onOpenChange(true);
  }

  const handleOpenUsers = (id) => { //open modal users
    onOpenChangeUsers(true);
    setID_USER(session?.user?._id);
    setId(id);
  }

  const handleOpenQr = (id) => { //open modal qr
    onOpenChangeQr(true);
    setId(id);
  }

  return (
    <>
      <div className="grid  2xl:grid-cols-4 gap-[60px] w-[70%] m-auto mt-[40px]  lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {loading ? (<div></div>) :
          (
            proyects.length > 0 ?
              (
                proyects.map((item) => {
                  return (
                    <Card key={item._id} isFooterBlurred className="relative flex flex-col col-span-1 ... backdrop-blur-[40px] ... border-1 border-solid ... border-white  h-[40vh] w-full rounded-lg ... max-[730px]:w-[65%] max-[730px]:m-auto max-[500px]:w-[100%] ">
                      <CardHeader className="absolute z-10  flex-col items-start bg-white/30 backdrop-blur-sm ... rounded-sm ...">
                        <p className="text-tiny text-black uppercase font-bold">Proyecto</p>
                        <h4 className="text-black font-medium text-2xl ">{item.name}</h4>
                      </CardHeader>
                      <Image
                        removeWrapper
                        alt={item.name}
                        className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
                        src="/images/parcela.avif"
                      />
                      <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between rounded-sm ...">
                        <Tooltip content="Visualizar el modelo 3D" showArrow={true}>
                          <Button
                            className="text-tiny bg-[#030D1C]"
                            color="default"
                            radius="full"
                            size="sm"
                          >
                            <Link href={{ pathname: `/web/views/visualizer`, query: { id: encrypt(item._id) } }} >
                              <Eye className="text-white cursor-pointer" aria-label="Viualizar el modelo 3d" />
                            </Link >
                          </Button>
                        </Tooltip>
                        <Tooltip content="Información del proyecto" showArrow={true}>
                          <Button
                            startContent={<NoteText className="text-white cursor-pointer" aria-label="Informacíon del proyecto" />}
                            className="text-tiny bg-[#030D1C]"
                            color="default"
                            radius="full"
                            size="sm"
                            onClick={() => handleOpen(item._id)}
                          >
                          </Button>
                        </Tooltip>
                        <Tooltip content="Compartir Modelo" showArrow={true}>
                          <Button
                            startContent={<Share className="text-white cursor-pointer" aria-label="Compartir modelo" />}
                            className="text-tiny bg-[#030D1C]"
                            color="default"
                            radius="full"
                            size="sm"
                            onClick={() => handleOpenUsers(item._id)}
                          >
                          </Button>
                        </Tooltip>
                        <Button
                          startContent={<Qr className="text-white cursor-pointer"  aria-label="Compartir modelo" />}
                          className="text-tiny bg-[#030D1C]"
                          color="default"
                          radius="full"
                          size="sm"
                          onClick={() => handleOpenQr(item._id)}
                        >
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })
              ) : (
                <div className="w-[70%] h-[30vh] flex flex-col justify-center items-center absolute">
                  <Ban className="text-white" />
                  <div className="text-white text-2xl">!ups, no hay proyectos para mostrar</div>
                </div>
              )
          )}
      </div>
      {_id != '' && <DrawerInfo isOpen={isOpen} onOpenChange={onOpenChange} _id={_id} />} {/* drawer info of the proyect */}
      {ID_USER && <ModalUsersInvited isOpenUsers={isOpenUsers} onOpenChangeUsers={onOpenChangeUsers} ID_USER={ID_USER} _ID={_id} />} {/* modal users to share via email */}
      {_id != '' && <ModalQr isOpenQr={isOpenQr} onOpenChangeQr={onOpenChangeQr} _id={_id} />} {/* modal qr */}
    </>
  );
}
