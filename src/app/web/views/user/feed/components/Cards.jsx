"use client";
import { Card, Image, CardBody, Button, Tooltip } from "@nextui-org/react";
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-[95%] xl:w-[85%] 2xl:w-[75%] max-w-[1800px] m-auto mt-[40px] px-4 mb-[80px]"
      >
        {proyects.length > 0 ? (
          proyects.map((item) => {
            return (
              <Card
                key={item._id}
                className="bg-[#1A1F26]/60 backdrop-blur-xl border border-white/10 shadow-2xl relative flex flex-col min-h-[400px] w-full rounded-[32px] overflow-hidden group hover:border-cyan-500/30 transition-all duration-500 hover:shadow-[0_0_50px_rgba(6,182,212,0.15)]"
              >
                <CardBody className="p-5 flex flex-col lg:flex-row gap-6 items-stretch">
                  {/* Left Column: Image Area */}
                  <div className="w-full lg:w-[55%] flex flex-col">
                    <div className="relative h-full min-h-[250px] rounded-[24px] overflow-hidden border border-white/10 shadow-inner group-hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all duration-500">
                      <Link
                        href={{
                          pathname: `/web/views/visualizer`,
                          query: { id: encrypt(item._id) },
                        }}
                        target="_blank"
                        className="w-full h-full block"
                      >
                        <Image
                          removeWrapper
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          src={item.urlImage || "/images/parcela.jpg"}
                        />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Info & Actions */}
                  <div className="w-full lg:w-[45%] flex flex-col">
                    {/* Header */}
                    <div className="mb-6">
                      <h4 className="text-white font-bold text-2xl uppercase tracking-tight mb-1">
                        {item.name}
                      </h4>
                      <p className="text-white/40 text-xs font-semibold uppercase tracking-[3px]">
                        {item.description?.substring(0, 30) || "PROYECTO RESIDENCIAL"}
                      </p>
                    </div>

                    {/* Actions List */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-[24px] p-2 flex flex-col gap-1 mb-6">
                      <Link
                          href={{
                            pathname: `/web/views/visualizer`,
                            query: { id: encrypt(item._id) },
                          }}
                          target="_blank"
                        >
                        <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-[18px] transition-all cursor-pointer group/item">
                          <div className="bg-cyan-500/10 p-2.5 rounded-[14px] border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover/item:shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover/item:bg-cyan-500/20 transition-all">
                            <Eye className="w-5 h-5 text-cyan-400" />
                          </div>
                          <span className="text-white/80 font-semibold text-sm">Ver Modelo</span>
                        </div>
                      </Link>

                      <div 
                        onClick={() => handleOpen(item._id)}
                        className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-[18px] transition-all cursor-pointer group/item"
                      >
                        <div className="bg-white/5 p-2.5 rounded-[14px] border border-white/10 group-hover/item:bg-white/10 transition-all">
                          <EditIconV2 className="w-5 h-5 text-white/70" />
                        </div>
                        <span className="text-white/80 font-semibold text-sm">Editar Proyecto</span>
                      </div>

                      <div 
                        onClick={() => handleOpenQr(item._id)}
                        className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-[18px] transition-all cursor-pointer group/item"
                      >
                        <div className="bg-white/5 p-2.5 rounded-[14px] border border-white/10 group-hover/item:bg-white/10 transition-all">
                          <Qr className="w-5 h-5 text-white/70" />
                        </div>
                        <span className="text-white/80 font-semibold text-sm">Compartir</span>
                      </div>
                    </div>

                    {/* Project Status Section */}
                    <div className="mt-auto bg-white/[0.03] border border-white/5 rounded-[24px] p-5 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-[11px] font-bold uppercase tracking-widest">Estado del Proyecto</span>
                        {item.lastScanDate && (
                          <span className="text-white/40 text-[11px] font-medium uppercase tracking-tight">
                            Último escaneo: <span className="text-white">{new Date(item.lastScanDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
                        <span className="text-white text-base font-bold tracking-tight">Activo</span>
                      </div>
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
