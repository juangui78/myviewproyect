"use client"
import { motion } from "framer-motion";
import Image from "next/image";

const SectionOne = () => {

    return (

        <motion.div
            className="w-full py-10 md:py-14 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <div className="w-[90%] md:w-[70%] grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <motion.div
                    className="relative aspect-[3/4] w-full max-w-sm mx-auto glow-card-hover rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Image src="/images/explore.png" alt="Exploración 3D" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 384px" className="object-cover relative z-10" />
                </motion.div>

                <motion.div
                    className="glass-card glow-card-hover p-8 rounded-2xl"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h1 className="font-bold text-3xl text-left bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6">
                        Escaneo 3D de <span className="text-primary text-glow-animated">Alta Precisión</span>
                    </h1>
                    <p className="text-lg text-gray-300 leading-relaxed mb-6">
                        Captura cada detalle con precisión milimétrica gracias a nuestra tecnología
                        de <strong className="text-white">fotogrametría aérea</strong>. Obtén modelos 3D realistas y detallados de terrenos y edificaciones.
                    </p>
                    <ul className="space-y-3 text-gray-400">
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            Mapeo rápido y eficiente.
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-secondary rounded-full"></span>
                            Imágenes de alta resolución.
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            Modelos 3D precisos para análisis.
                        </li>
                    </ul>
                </motion.div>
            </div>
        </motion.div>
    )
}


export default SectionOne