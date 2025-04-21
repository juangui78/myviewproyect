import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from "@heroui/react";
import styles from "./InformationCard.module.css";
import { PlusIcon } from "@/web/global_components/icons/PlusIcon";

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

export const InformationCard = ({ info }) => {
  return (
    <Card className="w-full max-w-[90vw] md:max-w-[70vh] border-none bg-black text-white" shadow="none">
      <CardHeader className="justify-between">
        <div className="flex gap-3">
          <h2 className="text-lg"><strong>{info?.name}</strong></h2>
        </div>
      </CardHeader>
      <CardBody className="px-3 py-0 max-h-[50vh] overflow-y-auto">
        <p className="text-small pl-px pb-[5px]"><strong>Ubicación:</strong> {info?.department}, {info?.city}, {info?.address}</p>
        <p className="text-small pl-px pb-[5px]"><strong>Área:</strong> {info?.hectares} metros cuadrados</p>
        <p className="text-small pl-px pb-[5px]"><strong>Descripción:</strong> {info?.description}</p>
      </CardBody>
      <CardFooter className="gap-3 flex-col items-start justify-start text-left px-2 max-h-[30vh] overflow-y-auto">
        {DATARANDOM.map((item, index) => (
          <p key={index} className="text-small">{item}</p>
        ))}
      </CardFooter>
    </Card>
  );
};


export default function App({ info }) {
  return (
    <div className={styles.InformationContainer}>
      <Popover className="" showArrow placement="bottom">
        <PopoverTrigger>
          
          <Button
            className="border-none bg-black p-2 text-white h-8 gap-x-0.5"
          >
            <PlusIcon className='h-[20px] w-[20px]'></PlusIcon>
            Información
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-1 border-none bg-black z-[999999999999] ">
          <InformationCard info={info} />
        </PopoverContent>
      </Popover>
    </div>
  );
}