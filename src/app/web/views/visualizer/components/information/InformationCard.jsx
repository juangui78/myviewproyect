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
      <Card className="w-full max-w-[90vw] md:max-w-[70vh] border border-white/20 bg-black/80 backdrop-blur-md text-white shadow-2xl" shadow="none">
        <CardHeader className="justify-between border-b border-white/10 pb-3">
          <div className="flex gap-3">
            <h2 className="text-lg font-bold tracking-wide">{info?.name}</h2>
          </div>
        </CardHeader>
        <CardBody className="px-4 py-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
          <p className="text-sm text-gray-200 mb-2"><strong>Ubicación:</strong> {info?.department}, {info?.city}, {info?.address}</p>
          <p className="text-sm text-gray-200 mb-2"><strong>Área:</strong> {info?.areaOfThisproyect} m²</p>
        </CardBody>
        <CardFooter className="flex-col items-start justify-start text-left px-4 py-3 max-h-[30vh] overflow-y-auto border-t border-white/10 bg-black/20">

          {info.description &&
            info.description.split('\n').map((line, idx) =>
              line.trim() === "" ? (
                <br key={idx} />
              ) : (
                <p key={idx} className="text-sm text-gray-300 leading-relaxed">{line}</p>
              )
            )
          }

        </CardFooter>
      </Card>

      {(currentModel?.version_notes || isEditing || canEdit) && (
        <Card className="w-full max-w-[90vw] md:max-w-[70vh] border border-cyan-500/30 bg-black/80 backdrop-blur-md text-white shadow-2xl" shadow="none">
           <CardHeader className="justify-between border-b border-white/10 pb-2">
            <div className="flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              <h3 className="text-sm font-bold tracking-wider uppercase text-cyan-400">Notas de la versión</h3>
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
                            className="bg-cyan-500 text-black font-bold"
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
            className="border border-white/20 bg-black/60 backdrop-blur-md p-2 text-white h-10 gap-x-2 rounded-full hover:bg-black/80 transition-all font-medium px-4 shadow-lg"
          >
            <PlusIcon className='h-5 w-5 text-white/90'></PlusIcon>
            Información
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