import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
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
import SearchIcon from "@/web/global_components/icons/SearchIcon";
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

export const InformationCard = ({ info, currentModel, canEdit, onUpdateModelNotes, session }) => {
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

  return (
    <div className="flex flex-col gap-3">
      <Card className="w-full max-w-[90vw] md:max-w-[70vh] border border-[#3D3425] bg-[#252117]/95 backdrop-blur-md text-[#F0E8DA] shadow-2xl rounded-[18px]" shadow="none">
        <CardHeader className="justify-between border-b border-[#3D3425] pb-3">
          <div className="flex gap-2 items-center">
            <SearchIcon className="w-5 h-5 text-[#C9A96E]" />
            <h2 className="text-lg font-bold tracking-wide text-[#C9A96E]">{info?.name || "Descubrimiento Histórico"}</h2>
          </div>
        </CardHeader>
        <CardBody className="px-4 py-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
          <p className="text-[11px] uppercase tracking-[1.4px] text-[#B87333] mb-3 font-bold">Reseña Expandida</p>
          
          {info?.description ? (
            info.description.split('\n').map((line, idx) =>
              line.trim() === "" ? (
                <br key={idx} />
              ) : (
                <p key={idx} className="text-sm text-[#8A8070] leading-relaxed mb-2">{line}</p>
              )
            )
          ) : (
            <p className="text-sm text-[#8A8070] leading-relaxed">
              Fui tallada en las montañas, mis cuerdas cantaron antes que la pólvora. Esta pieza histórica fue fabricada con maderas nativas de los bosques orientales, conectando el patrimonio natural con el alma artesanal de Marinilla.
            </p>
          )}

        </CardBody>
        <CardFooter className="flex-col items-start justify-start text-left px-4 py-3 border-t border-[#3D3425] bg-[#3A2E1A]/40">
           <div className="flex items-center gap-2 mb-1">
             <span className="text-lg">🏆</span>
             <h3 className="text-sm font-bold text-[#F0E8DA]">Recompensa Desbloqueada</h3>
           </div>
           <p className="text-xs text-[#C8BFAE]">Has recuperado <strong className="text-[#C9A96E]">1/5 fragmentos</strong> del alma musical de Marinilla.</p>
        </CardFooter>
      </Card>

      {(currentModel?.version_notes || isEditing || canEdit) && (
        <Card className="w-full max-w-[90vw] md:max-w-[70vh] border border-[#7A6340] bg-[#252117]/95 backdrop-blur-md text-[#F0E8DA] shadow-2xl rounded-[18px]" shadow="none">
           <CardHeader className="justify-between border-b border-[#3D3425] pb-2">
            <div className="flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full bg-[#B87333] shadow-[0_0_10px_rgba(184,115,51,0.5)]" />
              <h3 className="text-[11px] font-bold tracking-[1.4px] uppercase text-[#C9A96E]">Notas de la versión</h3>
            </div>
            <div className="flex gap-2 items-center">
                {canEdit && !isEditing && (
                    <Button 
                        isIconOnly 
                        size="sm" 
                        variant="light" 
                        className="text-white/40 hover:text-white"
                        onPress={() => setIsEditing(true)}
                    >
                        <EditIcon className="w-4 h-4" />
                    </Button>
                )}
                <span className="text-[10px] text-white/40 font-mono italic">
                  {currentModel?.notes_updated_at || currentModel?.creation_date 
                    ? new Date(currentModel.notes_updated_at || currentModel.creation_date).toLocaleDateString() 
                    : new Date().toLocaleDateString()}
                </span>
            </div>
          </CardHeader>
          <CardBody className="px-4 py-4 max-h-[30vh] md:max-h-[40vh] overflow-y-auto scrollbar-hide">
            {isEditing ? (
                <div className="flex flex-col gap-3">
                    <Textarea
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        placeholder="Escribe las actualizaciones aquí..."
                        className="text-white"
                        classNames={{
                            input: "text-white text-sm",
                            inputWrapper: "bg-white/5 border-white/10 hover:bg-white/10"
                        }}
                    />
                    <div className="flex gap-2 justify-end">
                        <Button 
                            size="sm" 
                            variant="flat" 
                            className="bg-white/10 text-white" 
                            startContent={<Ban className="w-4 h-4"/>}
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
                            className="bg-[#B87333] text-white font-bold rounded-[14px] shadow-[0_4px_10px_rgba(184,115,51,0.3)]"
                            startContent={!isSaving && <CheckIcon className="w-4 h-4"/>}
                            onPress={handleSave}
                            isLoading={isSaving}
                        >
                            Guardar
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <p className="text-sm text-gray-200 leading-relaxed font-light whitespace-pre-wrap">
                    {currentModel?.version_notes || "No hay notas para esta versión."}
                  </p>
                  {currentModel?.updated_by && (
                    <div className="mt-2 pt-2 border-t border-white/5 flex justify-end">
                        <span className="text-[10px] text-white/40 italic">
                            Actualizado por: <span className="text-white/60 font-medium">{currentModel.updated_by}</span>
                        </span>
                    </div>
                  )}
                </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};


export default function App({ info, currentModel, session, onUpdateModelNotes }) {
  const canEdit = session !== null && session !== undefined;

  return (
    <div className={styles.InformationContainer}>
      <Popover className="" showArrow placement="bottom" shouldCloseOnScroll={false}>
        <PopoverTrigger>

          <Button
            className="border-none bg-[#B87333] p-2 text-white h-10 gap-x-2 rounded-[16px] hover:bg-[#8B5E3C] transition-all font-bold px-4 shadow-[0_4px_10px_rgba(184,115,51,0.3)]"
          >
            <PlusIcon className='h-5 w-5 text-white/90'></PlusIcon>
            <span className="hidden md:inline">La Reseña</span>
            <span className="inline md:hidden">Reseña</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 border-none bg-transparent shadow-none z-[9999]">
          <InformationCard 
            info={info} 
            currentModel={currentModel} 
            canEdit={canEdit} 
            onUpdateModelNotes={onUpdateModelNotes}
            session={session}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}