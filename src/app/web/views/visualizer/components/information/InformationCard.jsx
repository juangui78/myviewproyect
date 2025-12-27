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
  console.log('InformationCard info:', info);

  return (
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
  );
};


export default function App({ info }) {
  return (
    <div className={styles.InformationContainer}>
      <Popover className="" showArrow placement="bottom">
        <PopoverTrigger>

          <Button
            className="border border-white/20 bg-black/60 backdrop-blur-md p-2 text-white h-10 gap-x-2 rounded-full hover:bg-black/80 transition-all font-medium px-4 shadow-lg"
          >
            <PlusIcon className='h-5 w-5 text-white/90'></PlusIcon>
            Información
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 border-none bg-transparent shadow-none z-[9999]">
          <InformationCard info={info} />
        </PopoverContent>
      </Popover>
    </div>
  );
}