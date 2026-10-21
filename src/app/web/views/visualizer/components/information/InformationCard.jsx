import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Textarea,
  Spinner,
} from "@heroui/react";
import styles from "./InformationCard.module.css";
import { PlusIcon } from "@/web/global_components/icons/PlusIcon";
import { EditIcon } from "@/web/global_components/icons/EditIcon";
import CheckIcon from "@/web/global_components/icons/CheckIcon";
import { Ban } from "@/web/global_components/icons/Ban";
import axios from "axios";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { decrypt } from "@/api/libs/crypto";

const DATARANDOM = [ // informacion quemada mas adelante cuadramos esto
  "📍 Ubicación – Vereda Barro Blanco, Concepción, Antioquia",
  "🟢 A 20 min del casco urbano de Concepción",
  "🟢 A 25 min de San Vicente",
  "🟢 A 10 min del estadero El Tapón",
  "🟢 🚗 A 1h 30 del aeropuerto internacional José María Córdova",
  "🟢 🛣️ A 1h 10 de Rionegro y Marinilla",
  "🟢 🏙️ A 2h de Medellín",
  "🟢 🌄 A 40 min de Barbosa",

  "📐 Área total del lote:",
  "3.333 m²",
  "🔨 Incluye explanación de 400 m² lista para construir",

  "🛣️ Accesos y vías:",
  "🚗 A solo 10 min de la vía pavimentada que conecta San Vicente con Concepción",

  "💧 Servicios de fácil conexión:",
  "💡 Energía",
  "🚿 Agua",
  "🌐 Internet",

  "🏡 Usos posibles según certificado de usos del suelo:",
  "✅ Turismo rural",
  "✅ Vivienda",
  "✅ Agricultura",
  "✅ Inversión natural",

  "🌿 Atractivos del lote:",
  "🌳 Bosque nativo",
  "🐦 Avistamiento de aves",
  "😌 Zona tranquila para descanso",

  "📜 Estado legal:",
  "✔️ Escrituras al día en proindiviso.",
  "✔️ Licencia de construcción viable según usos del suelo y EOT municipal.",

  "💰 Precio de venta:",
  "$133.000.000 COP",

  "📞 Contacto directo:",
  "Esteban Gómez González",
  "📲 319 206 7689"
]

export const InformationCard = React.memo(function InformationCard({ info, currentModel, canEdit, onUpdateModelNotes, session, onExportSchematicPdf, isGeneratingPdf = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(currentModel?.version_notes || "");
  const [isSaving, setIsSaving] = useState(false);
  
  const searchParams = useSearchParams();
  const idProyect = decrypt(searchParams.get("id"));

  useEffect(() => {
    setEditedNotes(currentModel?.version_notes || "");
  }, [currentModel]);

  const handleSave = async () => {
    if (!currentModel?._id) {
        toast.error("No se puede identificar el modelo actual.");
        return;
    }
    
    setIsSaving(true);
    try {
      const userName = session?.user?.name || "Usuario";
      const response = await axios.post(`/api/controllers/visualizer/${idProyect}`, {
        modelID: currentModel._id,
        version_notes: editedNotes,
        updated_by: userName,
      });

      if (response.status === 200) {
        toast.success("Notas de la versión actualizadas correctamente");
        setIsEditing(false);
        const updatedAt = response.data.model?.notes_updated_at;
        if (onUpdateModelNotes) onUpdateModelNotes(currentModel._id, editedNotes, userName, updatedAt);
      }
    } catch (error) {
      console.error("Error al guardar las notas:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const isEasyView = typeof window !== "undefined" && window.location.pathname.includes("/easyview");
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const locationMain = [info?.city, info?.department].filter(Boolean).join(", ");
  const areaRaw = Number(info?.areaOfThisproyect);
  const areaLabel = Number.isFinite(areaRaw) && info?.areaOfThisproyect !== "" && info?.areaOfThisproyect != null
    ? areaRaw.toLocaleString("es-CO")
    : (info?.areaOfThisproyect || "—");
  const descriptionLines = (info?.description || "").split("\n");
  const notesDate = currentModel?.notes_updated_at || currentModel?.creation_date
    ? new Date(currentModel.notes_updated_at || currentModel.creation_date).toLocaleDateString()
    : new Date().toLocaleDateString();
  const showNotes = !!(currentModel?.version_notes || isEditing || canEdit);
  const hasPresentation = !!idProyect;
  const hasPlan = !!onExportSchematicPdf;

  return (
    <div className="relative flex flex-col w-[min(92vw,400px)] max-h-[calc(100vh-90px)] rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl text-white shadow-2xl overflow-hidden">
      {/* Detalle sutil de acento superior */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#0CDBFF] to-[#00C662] opacity-80 pointer-events-none" />

      {/* Encabezado fijo */}
      <div className="relative px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0CDBFF] shadow-[0_0_8px_rgba(12,219,255,0.9)] animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#0CDBFF]">Proyecto</span>
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-wide text-white break-words">{info?.name}</h2>

        {/* Métricas principales */}
        <div className="grid grid-cols-[1fr_auto] gap-2 mt-3">
          <div className="min-w-0 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
            <span className="block text-[9px] font-mono uppercase tracking-[0.2em] text-white/50">📍 Ubicación</span>
            <span className="block text-sm font-semibold text-white truncate" title={locationMain}>{locationMain || "—"}</span>
            {info?.address && (
              <span className="block text-[11px] text-white/70 truncate" title={info.address}>{info.address}</span>
            )}
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-right min-w-[96px]">
            <span className="block text-[9px] font-mono uppercase tracking-[0.2em] text-white/50 font-medium">Área</span>
            <span className="block text-lg font-bold text-white leading-tight">{areaLabel}</span>
            <span className="block text-[10px] text-white/60">m²</span>
          </div>
        </div>

        {/* Acciones rápidas */}
        {(hasPresentation || hasPlan) && (
          <div className={`grid gap-2 mt-2 ${hasPresentation && hasPlan ? "grid-cols-2" : "grid-cols-1"}`}>
            {hasPresentation && (
              <Button
                as="a"
                href={`/proyectos/${idProyect}`}
                size="sm"
                variant="flat"
                className="h-9 bg-white/10 border border-white/15 text-white text-xs font-semibold hover:bg-white/20 hover:border-white/30 transition-all"
              >
                📄 Presentación
              </Button>
            )}
            {hasPlan && (
              <Button
                size="sm"
                variant="flat"
                isLoading={isGeneratingPdf}
                onPress={onExportSchematicPdf}
                className="h-9 bg-white/10 border border-white/15 text-white text-xs font-semibold hover:bg-white/20 hover:border-white/30 transition-all"
              >
                {isGeneratingPdf ? "Generando..." : "🗺️ Plano (PDF)"}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Cuerpo desplazable */}
      <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide px-4 pb-3 flex flex-col gap-3">
        {descriptionLines.some(l => l.trim() !== "") && (
          <section className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5">
            <h3 className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/50 mb-1.5">Detalles</h3>
            <div className="flex flex-col">
              {descriptionLines.map((line, idx) =>
                line.trim() === "" ? (
                  <div key={idx} className="h-px my-1.5 bg-white/10" />
                ) : (
                  <p key={idx} className="text-[13px] text-gray-200 leading-snug py-[1px]">{line}</p>
                )
              )}
            </div>
          </section>
        )}

        {showNotes && (
          <section className="rounded-xl border border-cyan-500/30 bg-black/40">
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <button
                type="button"
                onClick={() => setIsNotesOpen(o => !o)}
                className="flex items-center gap-2 min-w-0 flex-1 text-left"
                aria-expanded={isNotesOpen || isEditing}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 shrink-0">Notas de la versión</span>
                {!isNotesOpen && !isEditing && (
                  <span className="text-[11px] text-white/50 truncate">
                    {currentModel?.version_notes ? `· ${currentModel.version_notes}` : "· Sin notas"}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] text-white/40 font-mono">{notesDate}</span>
                {canEdit && !isEditing && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="min-w-6 w-6 h-6 text-white/40 hover:text-white"
                    onPress={() => { setIsEditing(true); setIsNotesOpen(true); }}
                    aria-label="Editar notas"
                  >
                    <EditIcon className="w-3.5 h-3.5" />
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setIsNotesOpen(o => !o)}
                  className={`w-6 h-6 flex items-center justify-center text-white/50 hover:text-white transition-transform ${isNotesOpen || isEditing ? "rotate-180" : ""}`}
                  aria-label="Mostrar notas"
                >
                  ▾
                </button>
              </div>
            </div>

            {(isNotesOpen || isEditing) && (
              <div className="px-3 pb-3">
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Escribe las actualizaciones aquí..."
                      className="text-white"
                      classNames={{
                        input: "text-white text-sm",
                        inputWrapper: "bg-black/50 border-white/10 hover:bg-black/70"
                      }}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="flat"
                        className="bg-white/10 text-white hover:bg-white/20"
                        startContent={<Ban className="w-4 h-4" />}
                        onPress={() => {
                          setIsEditing(false);
                          setEditedNotes(currentModel?.version_notes || "");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        className="bg-cyan-500 text-black font-bold"
                        startContent={!isSaving && <CheckIcon className="w-4 h-4" />}
                        onPress={handleSave}
                        isLoading={isSaving}
                      >
                        Guardar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-black/50 border border-white/5 p-2.5">
                    <p className="text-[13px] text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {currentModel?.version_notes || "No hay notas para esta versión."}
                    </p>
                    {currentModel?.updated_by && (
                      <p className="mt-1.5 pt-1.5 border-t border-white/5 text-right text-[10px] text-white/40 italic">
                        Actualizado por: <span className="text-white/60 font-medium not-italic">{currentModel.updated_by}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Barra inferior compacta de EasyView */}
      {!isEasyView && (
        <a
          href={`/web/views/visualizer/easyview?id=${encodeURIComponent(searchParams.get("id") || "")}&modelIndex=${searchParams.get("modelIndex") || "0"}`}
          className="relative shrink-0 flex items-center justify-between gap-2 px-4 py-2.5 border-t border-white/10 bg-black/40 hover:bg-black/60 transition-colors group"
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="text-sm">⚡</span>
            <span className="text-[11px] text-white/70 truncate">
              ¿Va lento? Prueba <strong className="text-[#0CDBFF]">EasyView</strong> optimizado
            </span>
          </span>
          <span className="text-[11px] font-bold text-[#0CDBFF] shrink-0 group-hover:translate-x-0.5 transition-transform">
            Abrir →
          </span>
        </a>
      )}
    </div>
  );
});


export default React.memo(function App({ info, currentModel, session, onUpdateModelNotes, onExportSchematicPdf, isGeneratingPdf }) {
  const canEdit = session !== null && session !== undefined;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Cerrar el popover de información antes de abrir la vista previa del plano
  const handleExportFromInfo = onExportSchematicPdf
    ? () => {
        setIsPopoverOpen(false);
        onExportSchematicPdf();
      }
    : undefined;

  return (
    <div className={styles.InformationContainer}>
      <Popover className="" showArrow placement="bottom-end" shouldCloseOnScroll={false} isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger>

          <Button
            className="border border-white/20 bg-black/60 backdrop-blur-md p-2 text-white h-10 gap-x-1.5 sm:gap-x-2 rounded-full hover:bg-black/80 transition-all font-medium px-3 sm:px-4 shadow-lg shrink-0"
          >
            <PlusIcon className='h-5 w-5 text-white/90 shrink-0'></PlusIcon>
            <span className="hidden sm:inline">Información</span>
            <span className="inline sm:hidden">Info</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 border-none bg-transparent shadow-none z-[9999]">
          <InformationCard 
            info={info} 
            currentModel={currentModel} 
            canEdit={canEdit} 
            onUpdateModelNotes={onUpdateModelNotes}
            session={session}
            onExportSchematicPdf={handleExportFromInfo}
            isGeneratingPdf={isGeneratingPdf}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
});