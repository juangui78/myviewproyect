"use client";
import { Card, Image, CardBody,Button, Tooltip } from "@nextui-org/react";
import styles from "../styles/feed.module.css";
import Eye from "@/web/global_components/icons/Eye.jsx";
// import NoteText from "@/web/global_components/icons/NoteText";
// import Share from "@/web/global_components/icons/Share";
import EditIconV2 from "@/web/global_components/icons/EditIconV2";
import Qr from "@/web/global_components/icons/Qr";
// import DotsVertical from "@/web/global_components/icons/DotsVertical";
import { Ban } from "@/web/global_components/icons/Ban";
import { encrypt } from "@/api/libs/crypto";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useDisclosure } from "@nextui-org/react";
import DrawerInfo from "./DrawerInfo";
import ModalUsersInvited from "./ModalUsersInvited";
import ModalQr from "./ModalQr";


export default function Cards({ proyects }) {
  const { data: session, status } = useSession();
  const [_id, setId] = useState("");
  const [ID_USER, setID_USER] = useState(null);

  const { isOpen, onOpenChange } = useDisclosure(); // drawer unfo
  const { isOpen: isOpenUsers, onOpenChange: onOpenChangeUsers } =
    useDisclosure(); // modal users
  const { isOpen: isOpenQr, onOpenChange: onOpenChangeQr } = useDisclosure(); // modal qr

  const handleOpen = (id) => {
    //open drawer info
    setId(id);
    onOpenChange(true);
  };

  const handleOpenUsers = (id) => {
    //open modal users
    onOpenChangeUsers(true);
    setID_USER(session?.user?._id);
    setId(id);
  };

  const handleOpenQr = (id) => {
    onOpenChangeQr(true);
    setId(id);
  };

  console.log("pryectos", proyects);

  return (
    <>
      <div 
        className="grid 2xl:grid-cols-6 gap-[60px] w-[70%] m-auto mt-[40px] p-[8px] mb-[40px]  max-[1535px]:w-[80%] max-[1535px]:grid-cols-6  max-[1400px]:w-[95%]
                  max-[1218px]:grid-cols-1 max-[1218px]:w-[70%] max-[1218px]:place-items-center max-[977px]:w-[90%]  max-[785px]:w-[100%] max-[526px]:w-[80%]
        ">
        {proyects.length > 0 ? (
          proyects.map((item) => {
            return (
              <Card
  isFooterBlurred
  key={item._id}
  className="relative flex flex-col col-span-3 md:h-[100%] backdrop-blur-[40px] border-1 border-solid border-white h-[35vh] w-full rounded-lg max-[526px]:h-[45vh] max-[1535px]:col-span-3 max-[1218px]:grid-cols-1 max-[1218px]:w-[80%] max-[742px]:w-[95%] max-[624px]:w-[98%]"
>
  <CardBody className="h-[100%] flex flex-col md:flex-row  justify-center items-center">
    {/* Imagen */}
    <div className={`${styles.imagenCard} h-[100%] md:h-[100%] w-full md:w-[60%] pt-[2px] pb-[2px]`}>
      <Link 
      href={{
      pathname: `/web/views/visualizer`,
      query: { id: encrypt(item._id) },
      }}
      target="_blank"
      className="w-full h-full flex justify-center items-center">
      <Image
        isZoomed
        alt={item.name}
        className="z-0 w-full h-full cursor-pointer"
        shadow="md"
        src={
          item.urlImage === ""
            ? "/images/parcela.jpg"
            : item.urlImage
        }
      />
      </Link>
    </div>

    {/* Contenedor de botones */}
    <div className="flex flex-col md:flex-col h-[30%] md:h-[100%] w-full md:w-[40%] pt-[2px] pb-[2px] items-center justify-center">
      <div >
        <h4 className="text-black font-medium text-xl text-center">
          {item.name}
        </h4>
      </div>

      
      <div className="flex flex-row md:flex-col gap-2 mt-2 ml-2 gap-x-6 justify-center items-center">
        <Link
          href={{
            pathname: `/web/views/visualizer`,
            query: { id: encrypt(item._id) },
          }}
          className="text-sm w-[50px] h-[50px] flex justify-center bg-transparent"
          target="_blank"
        >
          <Tooltip content="Ver modelo 3D" placement="bottom">
            <Button
              className="text-sm w-full h-full flex justify-center bg-white shadow-lg"
              size="sm"
            >
              <Eye
                className="text-black cursor-pointer"
                aria-label="Visualizar el modelo 3D"
              />
            </Button>
          </Tooltip>
        </Link>
        <Button
          className="text-sm w-[50px] h-[50px] flex justify-center bg-white shadow-lg"
          size="sm"
          onClick={() => handleOpen(item._id)}
        >
          <EditIconV2
            className="text-black cursor-pointer"
            aria-label="Información del proyecto"
          />
        </Button>
        <Button
          className="text-sm w-[50px] h-[50px] flex justify-center bg-white shadow-lg"
          size="sm"
          onClick={() => handleOpenQr(item._id)}
        >
          <Qr
            className="text-black cursor-pointer"
            aria-label="Compartir modelo"
          />
        </Button>
        
      </div>
    </div>
  </CardBody>
</Card>
            );
          })
        ) : (
          <div className="w-[70%] h-[30vh] flex flex-col justify-center items-center absolute">
            <Ban className="text-white text-8xl" />
            <div className="text-white text-2xl">
              !ups, no hay proyectos para mostrar
            </div>
          </div>
        )}
      </div>
      {_id != "" && (
        <DrawerInfo isOpen={isOpen} onOpenChange={onOpenChange} _id={_id} />
      )}{" "}
      {/* drawer info of the proyect */}
      {ID_USER && (
        <ModalUsersInvited
          isOpenUsers={isOpenUsers}
          onOpenChangeUsers={onOpenChangeUsers}
          ID_USER={ID_USER}
          _ID={_id}
        />
      )}{" "}
      {/* modal users to share via email */}
      {_id != "" && (
        <ModalQr
          isOpenQr={isOpenQr}
          onOpenChangeQr={onOpenChangeQr}
          _id={_id}
        />
      )}{" "}
      {/* modal qr */}
    </>
  );
}
