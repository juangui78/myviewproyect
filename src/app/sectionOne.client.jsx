"use client"
import { motion } from "framer-motion";
import Image from "next/image";

const SectionOne = () => {

    return (

        <motion.div
            className="w-[100%] min-h-[70vh] max-h-[100vh]  bg-white flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <div className="w-[70%] max-h[100vh] h-[89vh]  grid grid-cols-1 md:grid-cols-2 gap-4 pt-10 pb-10">
                <motion.div
                    className="h-[100%] w-[85%] flex justify-center items-center relative "
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Image src="/images/explore.png" alt="Exploración 3D" fill className="rounded-xl shadow-xl" />
                </motion.div>

                <motion.div
                    className="bg-white"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <h1 className="font-bold text-3xl  text-left text-gray-800">Escaneo 3D de Alta Precisión</h1>
                    <p className="pt-6 text-lg text-gray-700">
                        Captura cada detalle con precisión milimétrica gracias a nuestra tecnología
                        de <strong>fotogrametría aérea</strong> mediante drones de última generación. Obtén modelos 3D realistas y detallados de terrenos,
                        edificaciones, parcelaciones y entornos urbanos en tiempo récord.
                    </p>
                    <ul className="pt-6 list-disc list-inside text-gray-600">
                        <li>Mapeo rápido y eficiente sin necesidad de mediciones manuales.</li>
                        <li>Imágenes de alta resolución procesadas con algoritmos avanzados.</li>
                        <li>Modelos 3D precisos para planificación, diseño y análisis.</li>
                    </ul>
                </motion.div>
            </div>
        </motion.div>
    )
}


export default SectionOne