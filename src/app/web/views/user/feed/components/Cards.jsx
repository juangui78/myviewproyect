"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { toast } from "sonner";
import {
  isStandalonePwa,
  listOfflineProjects,
  downloadProjectOffline,
  removeOfflineProject,
  onOfflineProjectsChange,
  formatBytes,
} from "@/web/global_components/pwa/offlineStore";

const DrawerInfo = dynamic(() => import("./DrawerInfo"), { ssr: false });
const ModalUsersInvited = dynamic(() => import("./ModalUsersInvited"), { ssr: false });
const ModalQr = dynamic(() => import("./ModalQr"), { ssr: false });

export default React.memo(function Cards({ proyects, totalProyects, offlineMode = false }) {
  const { data: session } = useSession();
  const [_id, setId] = useState("");
  const [ID_USER, setID_USER] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSearch = searchParams.get("search") || "";

  const [valueSearching, setValueSearching] = useState(activeSearch);
  const debounceTimer = useRef(null);

  // Estado PWA / Offline (solo activo en modo standalone o cuando offlineMode=true)
  const [isPwaStandalone, setIsPwaStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineMap, setOfflineMap] = useState({});
  const [downloadingMap, setDownloadingMap] = useState({});

  useEffect(() => {
    const standalone = isStandalonePwa() || offlineMode;
    setIsPwaStandalone(standalone);
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const refreshOfflineRecords = async () => {
      if (!standalone) return;
      const list = await listOfflineProjects();
      const map = {};
      list.forEach((p) => {
        map[String(p._id)] = p;
      });
      setOfflineMap(map);
    };

    refreshOfflineRecords();
    const unsub = onOfflineProjectsChange(refreshOfflineRecords);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsub();
    };
  }, [offlineMode]);

  useEffect(() => {
    if (!offlineMode) {
      setValueSearching(activeSearch);
    }
  }, [activeSearch, offlineMode]);

  const triggerSearch = (query) => {
    if (offlineMode) return;
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

    if (offlineMode) return;

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
    if (!offlineMode) {
      triggerSearch("");
    }
  };

  const handleResetSearch = () => {
    handleClear();
  };

  // Si la app instalada pierde conexión mientras está en el feed normal, mostrar los proyectos descargados
  const isEffectiveOffline = offlineMode || (isPwaStandalone && !isOnline);

  const displayedProjects = useMemo(() => {
    let baseList = Array.isArray(proyects) ? proyects : [];

    if (isEffectiveOffline && !offlineMode) {
      const savedList = Object.values(offlineMap);
      if (savedList.length > 0) {
        baseList = savedList;
      }
    }

    if (isEffectiveOffline && valueSearching.trim()) {
      const q = valueSearching.trim().toLowerCase();
      return baseList.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.city || "").toLowerCase().includes(q) ||
          (p.department || "").toLowerCase().includes(q)
      );
    }

    return baseList;
  }, [proyects, isEffectiveOffline, offlineMode, offlineMap, valueSearching]);

  const effectiveTotal = isEffectiveOffline && !offlineMode
    ? Object.keys(offlineMap).length
    : (totalProyects || 0);

  const handleToggleOfflineProject = async (e, item) => {
    e.stopPropagation();
    const pid = String(item._id);

    if (downloadingMap[pid] !== undefined) return;

    const existing = offlineMap[pid];
    if (existing) {
      try {
        await removeOfflineProject(pid);
        toast.success(`"${item.name}" eliminado del almacenamiento offline`);
      } catch (err) {
        toast.error("No se pudo eliminar el proyecto offline");
      }
      return;
    }

    if (!navigator.onLine) {
      toast.error("Necesitas conexión a internet para descargar este proyecto");
      return;
    }

    setDownloadingMap((prev) => ({ ...prev, [pid]: 1 }));
    try {
      const visualizerId = item.encryptedId || encrypt(item._id);
      await downloadProjectOffline(
        { ...item, encryptedId: visualizerId },
        (pct) => {
          setDownloadingMap((prev) => ({ ...prev, [pid]: pct }));
        }
      );
      toast.success(`"${item.name}" disponible sin internet`);
    } catch (err) {
      console.error("Error descargando proyecto offline:", err);
      toast.error(err?.message || "No se pudo descargar el proyecto");
    } finally {
      setDownloadingMap((prev) => {
        const next = { ...prev };
        delete next[pid];
        return next;
      });
    }
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

  const handleCardClick = (e, item) => {
    // Si el clic ocurrió sobre un botón, enlace u otro control interactivo, no redirigir
    if (e.target.closest("button, a, input, select, textarea, [role='button']")) {
      return;
    }
    if (isEffectiveOffline) {
      const visualizerId = item.encryptedId || encrypt(item._id);
      window.location.href = `/web/views/visualizer?id=${encodeURIComponent(visualizerId)}`;
      return;
    }
    router.push(`/proyectos/${item._id}`);
  };

  const searchIndicator = isEffectiveOffline ? valueSearching.trim() : activeSearch;

  return (
    <>
      <div className="w-full flex flex-col items-center">
        {/* Banner sutil de Modo Sin Conexión cuando está en la App Instalada sin red */}
        {isEffectiveOffline && (
          <div className="w-[95%] xl:w-[85%] 2xl:w-[75%] max-w-[1800px] mt-4 px-4">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-400/25 text-amber-200 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span>
                  <strong className="font-semibold text-white">Modo sin conexión:</strong>{" "}
                  mostrando únicamente los proyectos descargados en este dispositivo.
                </span>
              </div>
              {isOnline && offlineMode && (
                <Link
                  href="/web/views/user/feed"
                  className="shrink-0 px-3 py-1 rounded-lg bg-[#0CDBFF]/20 border border-[#0CDBFF]/40 text-[#0CDBFF] font-semibold hover:bg-[#0CDBFF]/30 transition-colors"
                >
                  Ir al Feed Online
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Unified Command & Header Bar */}
        <div className="w-[95%] xl:w-[85%] 2xl:w-[75%] max-w-[1800px] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-6 mb-3 px-4">
          {/* Left: Title + Metric Count Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Proyectos
            </h2>
            <span className="text-xs font-bold text-[#0CDBFF] bg-cyan-500/10 border border-[#0CDBFF]/25 px-2.5 py-0.5 rounded-full font-mono shadow-[0_0_12px_rgba(12,219,255,0.1)]">
              {searchIndicator && displayedProjects
                ? `${displayedProjects.length} de ${effectiveTotal}`
                : effectiveTotal}
            </span>

            {searchIndicator && (
              <span className="text-xs font-medium text-white/70 bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 ml-1">
                <span>&quot;{searchIndicator}&quot;</span>
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
          {Array.isArray(displayedProjects) && displayedProjects.length > 0 ? (
            displayedProjects.map((item, idx) => {
              const pid = String(item._id);
              const visualizerId = item.encryptedId || encrypt(item._id);
              const offlineRecord = offlineMap[pid];
              const isDownloaded = Boolean(offlineRecord);
              const downloadProgress = downloadingMap[pid];
              const isDownloading = downloadProgress !== undefined;

              const formattedDate = item.lastScanDate
                ? new Date(item.lastScanDate).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : null;

              const syncedDateLabel = offlineRecord?.syncedAt
                ? new Date(offlineRecord.syncedAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                })
                : null;

              return (
                <div
                  key={item._id}
                  onClick={(e) => handleCardClick(e, item)}
                  className="bg-[#0D1520]/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex flex-col xl:flex-row rounded-[28px] overflow-hidden group hover:border-cyan-500/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(12,219,255,0.12)] cursor-pointer"
                >
                  {/* Left Column: Image Thumbnail */}
                  <div className="w-full xl:w-[50%] p-4 flex flex-col">
                    <div className="relative w-full h-[240px] xl:h-full min-h-[220px] rounded-[22px] overflow-hidden border border-white/10 bg-[#030D1C] group-hover:border-cyan-500/30 transition-colors shadow-inner">
                      <Link
                        href={
                          isEffectiveOffline
                            ? `/web/views/visualizer?id=${encodeURIComponent(visualizerId)}`
                            : `/proyectos/${item._id}`
                        }
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
                          unoptimized={isEffectiveOffline || isDownloaded}
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
                        target={isPwaStandalone ? undefined : "_blank"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isEffectiveOffline) {
                            e.preventDefault();
                            window.location.href = `/web/views/visualizer?id=${encodeURIComponent(visualizerId)}`;
                          }
                        }}
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

                      {/* Secondary Actions Grid (solo cuando hay red) */}
                      {!isEffectiveOffline && (
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
                      )}

                      {/* Botón de Disponible Offline (Exclusivo para la App Instalada / Standalone) */}
                      {isPwaStandalone && (
                        <button
                          type="button"
                          disabled={isDownloading}
                          onClick={(e) => handleToggleOfflineProject(e, item)}
                          className={`relative overflow-hidden h-9 px-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 transition-all ${
                            isDownloaded
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300"
                              : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-white/75 hover:text-white"
                          }`}
                        >
                          {isDownloading && (
                            <span
                              className="absolute inset-y-0 left-0 bg-[#0CDBFF]/20 transition-all duration-200 pointer-events-none"
                              style={{ width: `${downloadProgress}%` }}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-2">
                            {isDownloading ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-[#0CDBFF]/30 border-t-[#0CDBFF] rounded-full animate-spin" />
                                <span>Descargando modelo... {downloadProgress}%</span>
                              </>
                            ) : isDownloaded ? (
                              <>
                                <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>
                                  Disponible sin internet
                                  {offlineRecord?.bytes ? ` · ${formatBytes(offlineRecord.bytes)}` : ""}
                                </span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5 text-[#0CDBFF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
                                </svg>
                                <span>Guardar para ver sin internet</span>
                              </>
                            )}
                          </span>

                          {isDownloaded && !isDownloading && (
                            <span className="relative z-10 text-[10px] text-white/40">
                              {syncedDateLabel ? `Sync ${syncedDateLabel} · ` : ""}Quitar
                            </span>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Status & Timestamp Bar */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isDownloaded
                              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                              : "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                          }`}
                        />
                        <span className="font-semibold text-white/80">
                          {isEffectiveOffline ? "Offline listo" : "Activo"}
                        </span>
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
                {searchIndicator
                  ? `No se encontraron proyectos para "${searchIndicator}"`
                  : isEffectiveOffline
                    ? "No tienes proyectos guardados sin internet"
                    : "Aún no tienes proyectos 3D disponibles"}
              </h4>

              <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
                {searchIndicator
                  ? "Verifica el término ingresado o restablece los filtros para ver todos tus modelos disponibles."
                  : isEffectiveOffline
                    ? "Cuando tengas conexión a internet, pulsa 'Guardar para ver sin internet' en la tarjeta de cualquier proyecto para llevarlo contigo a terreno."
                    : "Los levantamientos fotogramétricos y gemelos digitales que se asignen a tu cuenta aparecerán listados aquí."}
              </p>

              {searchIndicator && (
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
      {!isEffectiveOffline && _id !== "" && (
        <DrawerInfo isOpen={isOpen} onOpenChange={onOpenChange} _id={_id} />
      )}

      {!isEffectiveOffline && ID_USER && (
        <ModalUsersInvited
          isOpenUsers={isOpenUsers}
          onOpenChangeUsers={onOpenChangeUsers}
          ID_USER={ID_USER}
          _ID={_id}
        />
      )}

      {!isEffectiveOffline && _id !== "" && (
        <ModalQr
          isOpenQr={isOpenQr}
          onOpenChangeQr={onOpenChangeQr}
          _id={_id}
        />
      )}
    </>
  );
});
