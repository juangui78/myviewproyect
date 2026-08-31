"use client";
import React, { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useDisclosure, Button, Input } from "@nextui-org/react";
import { encrypt } from "@/api/libs/crypto";
import Eye from "@/web/global_components/icons/Eye.jsx";
import EditIconV2 from "@/web/global_components/icons/EditIconV2";
import Qr from "@/web/global_components/icons/Qr";
import { SearchIcon } from "@/web/global_components/icons/SearchIcon";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const DrawerInfo = dynamic(() => import("./DrawerInfo"), { ssr: false });
const ModalUsersInvited = dynamic(() => import("./ModalUsersInvited"), { ssr: false });
const ModalQr = dynamic(() => import("./ModalQr"), { ssr: false });

export default React.memo(function Cards({ proyects, totalProyects }) {
  const { data: session } = useSession();
  const [_id, setId] = useState("");
  const [ID_USER, setID_USER] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSearch = searchParams.get("search") || "";

  const [valueSearching, setValueSearching] = useState(activeSearch);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setValueSearching(activeSearch);
  }, [activeSearch]);

  const triggerSearch = (query) => {
    const params = new URLSearchParams(searchParams);
    const trimmed = query.trim();

    if (trimmed.length > 0) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleInputChange = (e) => {
    const nextValue = e.target.value;
    setValueSearching(nextValue);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      triggerSearch(nextValue);
    }, 250);
  };

  const handleClear = () => {
    setValueSearching("");
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    triggerSearch("");
  };

  const { isOpen, onOpenChange } = useDisclosure();
  const { isOpen: isOpenUsers, onOpenChange: onOpenChangeUsers } = useDisclosure();
  const { isOpen: isOpenQr, onOpenChange: onOpenChangeQr } = useDisclosure();

  const handleOpenInfo = (id) => {
    setId(id);
    onOpenChange(true);
  };

  const handleOpenUsers = (id) => {
    setID_USER(session?.user?._id);
    setId(id);
    onOpenChangeUsers(true);
  };

  const handleOpenQr = (id) => {
    setId(id);
    onOpenChangeQr(true);
  };

  const handleCardClick = (e, projectId) => {
    // Si el clic ocurrió sobre un botón, enlace u otro control interactivo, no redirigir
    if (e.target.closest("button, a, input, select, textarea, [role='button']")) {
      return;
    }
    router.push(`/proyectos/${projectId}`);
  };

  return (
    <>
      <div className="w-full flex flex-col items-center">
        {/* Unified Command & Header Bar */}
        <div className="w-[95%] xl:w-[85%] 2xl:w-[75%] max-w-[1800px] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-6 mb-3 px-4">
          {/* Left: Title + Metric Count Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Proyectos
            </h2>
            <span className="text-xs font-bold text-[#0CDBFF] bg-cyan-500/10 border border-[#0CDBFF]/25 px-2.5 py-0.5 rounded-full font-mono shadow-[0_0_12px_rgba(12,219,255,0.1)]">
              {activeSearch && proyects ? `${proyects.length} de ${totalProyects || 0}` : (totalProyects || 0)}
            </span>

            {activeSearch && (
              <span className="text-xs font-medium text-white/70 bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 ml-1">
                <span>&quot;{activeSearch}&quot;</span>
                <button
                  onClick={handleClear}
                  className="hover:text-white transition-colors text-white/50 text-[10px]"
                  title="Eliminar filtro"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          {/* Right: Live Search Input */}
          <div className="flex items-center w-full sm:w-auto sm:min-w-[340px] md:min-w-[380px] lg:min-w-[440px]">
            <div className="relative w-full">
              <Input
                value={valueSearching}
                onChange={handleInputChange}
                placeholder="Buscar por proyecto, ciudad o departamento..."
                size="md"
                radius="xl"
                aria-label="Buscar proyectos"
                startContent={<SearchIcon size={18} className="text-white/40 flex-shrink-0 ml-1" />}
                classNames={{
                  base: "w-full",
                  input: "text-sm text-white placeholder:text-white/30 bg-transparent pl-1",
                  inputWrapper:
                    "h-11 bg-[#121B26]/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 focus-within:!border-[#0CDBFF] transition-all shadow-inner px-3",
                }}
                endContent={
                  valueSearching ? (
                    <button
                      onClick={handleClear}
                      className="text-xs text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                      type="button"
                      title="Limpiar búsqueda"
                    >
                      ✕
                    </button>
                  ) : null
                }
              />
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-[95%] xl:w-[85%] 2xl:w-[75%] max-w-[1800px] mt-5 px-4 mb-[80px] relative">
          {Array.isArray(proyects) && proyects.length > 0 ? (
            proyects.map((item, idx) => {
              const visualizerId = item.encryptedId || encrypt(item._id);
              const formattedDate = item.lastScanDate
                ? new Date(item.lastScanDate).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : null;

              return (
                <div
                  key={item._id}
                  onClick={(e) => handleCardClick(e, item._id)}
                  className="bg-[#0D1520]/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex flex-col xl:flex-row rounded-[28px] overflow-hidden group hover:border-cyan-500/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(12,219,255,0.12)] cursor-pointer"
                >
                  {/* Left Column: Image Thumbnail */}
                  <div className="w-full xl:w-[50%] p-4 flex flex-col">
                    <div className="relative w-full h-[240px] xl:h-full min-h-[220px] rounded-[22px] overflow-hidden border border-white/10 bg-[#030D1C] group-hover:border-cyan-500/30 transition-colors shadow-inner">
                      <Link
                        href={`/proyectos/${item._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-full block relative"
                      >
                        <NextImage
                          alt={item.name || "Proyecto"}
                          fill
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          src={item.urlImage || "/images/parcela.jpg"}
                          priority={idx < 2}
                        />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Information & Controls */}
                  <div className="w-full xl:w-[50%] p-5 xl:py-5 xl:pr-5 xl:pl-2 flex flex-col justify-between gap-5">
                    {/* Header Details */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <p className="text-white/40 text-[11px] font-semibold uppercase tracking-[3px]">
                          PROYECTO
                        </p>

                        {item.city && (
                          <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/[0.04] px-2.5 py-0.5 rounded-lg border border-white/5 font-medium">
                            <svg className="w-3.5 h-3.5 text-[#0CDBFF] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="capitalize">{item.city.toLowerCase()}{item.department ? `, ${item.department}` : ""}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight line-clamp-1 group-hover:text-[#0CDBFF] transition-colors">
                        {item.name}
                      </h3>

                      {item.description && (
                        <p className="text-white/50 text-xs mt-2 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Action Hub */}
                    <div className="flex flex-col gap-2.5">
                      {/* Primary Action: Launch 3D Visualizer */}
                      <Link
                        href={{
                          pathname: `/web/views/visualizer`,
                          query: { id: visualizerId },
                        }}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full"
                      >
                        <div className="w-full h-11 px-4 rounded-2xl bg-gradient-to-r from-[#0CDBFF]/15 via-cyan-500/10 to-[#00C662]/15 border border-cyan-500/30 hover:border-cyan-400 hover:from-[#0CDBFF]/25 hover:to-[#00C662]/25 shadow-[0_0_20px_rgba(12,219,255,0.08)] hover:shadow-[0_0_25px_rgba(12,219,255,0.25)] flex items-center justify-between text-white font-semibold text-sm transition-all duration-300 group/btn">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-[#0CDBFF]/20 text-[#0CDBFF] group-hover/btn:scale-110 transition-transform">
                              <Eye className="w-4 h-4" />
                            </div>
                            <span className="tracking-tight text-white group-hover/btn:text-[#0CDBFF] transition-colors">
                              Ver Modelo 3D
                            </span>
                          </div>
                          <span className="text-xs text-white/40 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all">
                            ↗
                          </span>
                        </div>
                      </Link>

                      {/* Secondary Actions Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInfo(item._id);
                          }}
                          className="h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/80 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all"
                        >
                          <EditIconV2 className="w-4 h-4 text-white/60" />
                          <span>Información</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenQr(item._id);
                          }}
                          className="h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/80 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all"
                        >
                          <Qr className="w-4 h-4 text-white/60" />
                          <span>Compartir</span>
                        </button>
                      </div>
                    </div>

                    {/* Status & Timestamp Bar */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                        <span className="font-semibold text-white/80">Activo</span>
                      </div>

                      {formattedDate && (
                        <div className="text-white/40 text-[11px]">
                          Último escaneo: <span className="text-white/80 font-medium">{formattedDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="col-span-1 lg:col-span-2 py-16 px-6 text-center flex flex-col items-center justify-center bg-[#0D1520]/60 backdrop-blur-xl border border-white/10 rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#0CDBFF] shadow-inner">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>

              <h4 className="text-xl font-bold text-white mb-2">
                {activeSearch
                  ? `No se encontraron proyectos para "${activeSearch}"`
                  : "Aún no tienes proyectos 3D disponibles"}
              </h4>

              <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
                {activeSearch
                  ? "Verifica el término ingresado o restablece los filtros para ver todos tus modelos disponibles."
                  : "Los levantamientos fotogramétricos y gemelos digitales que se asignen a tu cuenta aparecerán listados aquí."}
              </p>

              {activeSearch && (
                <Button
                  onClick={handleResetSearch}
                  className="bg-gradient-to-r from-[#0CDBFF] to-[#00C662] text-black font-bold text-xs h-9 px-5 rounded-xl shadow-lg"
                >
                  Ver todos los proyectos
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drawers & Modals */}
      {_id !== "" && (
        <DrawerInfo isOpen={isOpen} onOpenChange={onOpenChange} _id={_id} />
      )}

      {ID_USER && (
        <ModalUsersInvited
          isOpenUsers={isOpenUsers}
          onOpenChangeUsers={onOpenChangeUsers}
          ID_USER={ID_USER}
          _ID={_id}
        />
      )}

      {_id !== "" && (
        <ModalQr
          isOpenQr={isOpenQr}
          onOpenChangeQr={onOpenChangeQr}
          _id={_id}
        />
      )}
    </>
  );
});
