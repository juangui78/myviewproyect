"use client";
import { Card, Image, CardFooter, CardHeader, Button } from "@nextui-org/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import Eye from "@/web/global_components/icons/Eye.jsx";
import NoteText from "@/web/global_components/icons/NoteText";
import Share from "@/web/global_components/icons/Share";
import Qr from "@/web/global_components/icons/Qr";
import DotsVertical from "@/web/global_components/icons/DotsVertical";
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
  const { isOpen: isOpenUsers, onOpenChange: onOpenChangeUsers } =useDisclosure(); // modal users
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
    //open modal qr
    onOpenChangeQr(true);
    setId(id);
  };

  console.log(proyects)

  return (
    <>
      <div className="grid 2xl:grid-cols-6 gap-[60px] w-[70%] m-auto mt-[40px] mb-[40px]  lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {proyects.length > 0 ? (
          proyects.map((item) => {

            return (
              <Card
                isFooterBlurred
                key={item._id}
                className="relative flex flex-col col-span-2 ... backdrop-blur-[40px] ... border-1 border-solid ... border-white  h-[50vh] w-full rounded-lg ... max-[730px]:w-[65%] max-[730px]:m-auto max-[500px]:w-[100%] "
              >
                <CardHeader className="absolute z-10  flex-col items-start bg-white/30 backdrop-blur-sm ... rounded-sm ...">
                  <div className="w-full flex flex-row justify-between items-center">
                    <p className="text-tiny text-black uppercase font-bold">
                      Proyecto
                    </p>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          className="flex justify-end p-0 m-0 bg-transparent"
                        >
                          <DotsVertical className="text-2xl" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem key="informacion">
                          <Button
                            variant="light"
                            startContent={
                              <NoteText
                                className="text-black cursor-pointer"
                                aria-label="Informacíon del proyecto"
                              />
                            }
                            className="text-black bg-white text-sm w-full flex justify-start"
                            color="default"
                            size="sm"
                            onClick={() => handleOpen(item._id)}
                          >
                            Informacíon del proyecto
                          </Button>
                        </DropdownItem>
                        <DropdownItem>
                          <Button
                            variant="light"
                            startContent={
                              <Share
                                className="text-black cursor-pointer"
                                aria-label="Compartir modelo"
                              />
                            }
                            className="text-black bg-white text-sm w-full flex justify-start"
                            color="default"
                            size="sm"
                            onClick={() => handleOpenUsers(item._id)}
                          >
                            Compartir modelo
                          </Button>
                        </DropdownItem>
                        <DropdownItem>
                          <Button
                            startContent={
                              <Qr
                                className="text-black cursor-pointer"
                                aria-label="Compartir modelo"
                              />
                            }
                            className="text-black bg-white text-sm w-full flex justify-start"
                            color="default"
                            size="sm"
                            onClick={() => handleOpenQr(item._id)}
                          >
                            Generar codigo Qr
                          </Button>
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <h4 className="text-black font-medium text-2xl ">
                    {item.name}
                  </h4>
                </CardHeader>
                <Image
                  removeWrapper
                  alt={item.name}
                  className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
                  // src="/images/parcela.avif"
                  src={item.urlImage == '' ? '/images/parcela.avif' : item.urlImage}
                />
                {console.log(item.urlImage)}
                <CardFooter className="absolute  bottom-0  border-zinc-100/50 z-10 justify-between rounded-sm ...">
                  <Link
                    href={{
                      pathname: `/web/views/visualizer`,
                      query: { id: encrypt(item._id) },
                    }}
                    className="w-[100%]"
                    target="_blank"
                  >
                    <Button
                      className="text-tiny bg-[#fff] w-[100%]"
                      color="default"
                      radius="full"
                      size="xl"
                    >
                      <Eye
                        className="text-black cursor-pointer"
                        aria-label="Viualizar el modelo 3d"
                      />
                      <span className="text-black text-lg">
                        Visualizar modelo 3D
                      </span>
                    </Button>
                  </Link>
                </CardFooter>
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
