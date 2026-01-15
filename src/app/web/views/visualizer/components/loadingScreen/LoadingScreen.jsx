import React from "react";
import { BlocksShuffle3 } from '@/web/global_components/icons/BlocksShuffle3';
import SliderLoading from '../sliderLoading/SliderLoading';
import Whatsapp from '@/web/global_components/icons/Whatsapp';

export const DATARANDOM = [ // informacion quemada mas adelante cuadramos esto
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

const LoadingScreen = (info) => {
    console.log('LoadingScreen props:', info);
    return (
        <div className='bg-white text-black w-full h-full absolute z-[100000000] flex flex-col justify-center items-center gap-[20px]'>
            <div className='md:w-[90% sm:w-[98%] w-[98%]'>
                <SliderLoading info={info} />
            </div>
            <div>
                <BlocksShuffle3 className="text-6xl" />
            </div>
            <div className='w-full text-center'>
                <p>Ya casi lo tenemos!</p>
            </div>
            <div className="fixed bottom-[calc(1vh+14px)] right-[calc(2vw+10px)] z-[9999] md:bottom-4 md:right-4">
                <a
                    href="https://wa.me/+573019027822"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                >
                    <Whatsapp className="text-white text-1xl" />
                </a>
            </div>
        </div>
    );
};

export default LoadingScreen;