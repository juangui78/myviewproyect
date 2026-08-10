"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import axios from "axios";

// SVG Brand Logos (Incluye Laurum y La Aldana estilo SaaS Enterprise)
const BrandLogoLaurum = () => (
  <svg className="h-8 md:h-10 w-auto text-gray-400 hover:text-white transition-colors duration-300" viewBox="0 0 190 48" fill="currentColor">
    <path d="M12 8L28 24L12 40L4 32L12 24L4 16L12 8Z" fill="#0CDBFF" />
    <path d="M24 8L40 24L24 40L16 32L24 24L16 16L24 8Z" fill="currentColor" opacity="0.8" />
    <text x="50" y="31" fontSize="20" fontWeight="800" letterSpacing="2" fontFamily="system-ui, sans-serif">LAURUM</text>
  </svg>
);

const BrandLogoAldana = () => (
  <svg className="h-8 md:h-10 w-auto text-gray-400 hover:text-white transition-colors duration-300" viewBox="0 0 210 48" fill="currentColor">
    <polygon points="20,6 36,38 4,38" fill="#00C662" />
    <polygon points="20,16 30,36 10,36" fill="#02121B" />
    <text x="46" y="31" fontSize="20" fontWeight="800" letterSpacing="2" fontFamily="system-ui, sans-serif">LA ALDANA</text>
  </svg>
);

const BrandLogoUrbano = () => (
  <svg className="h-8 md:h-10 w-auto text-gray-400 hover:text-white transition-colors duration-300" viewBox="0 0 190 48" fill="currentColor">
    <rect x="6" y="10" width="12" height="28" rx="2" fill="#0CDBFF" />
    <rect x="22" y="4" width="12" height="34" rx="2" fill="currentColor" opacity="0.9" />
    <rect x="38" y="16" width="12" height="22" rx="2" fill="currentColor" opacity="0.6" />
    <text x="60" y="31" fontSize="20" fontWeight="800" letterSpacing="2" fontFamily="system-ui, sans-serif">URBANO</text>
  </svg>
);

const BrandLogoTerra = () => (
  <svg className="h-8 md:h-10 w-auto text-gray-400 hover:text-white transition-colors duration-300" viewBox="0 0 220 48" fill="currentColor">
    <circle cx="22" cy="24" r="16" fill="none" stroke="#00C662" strokeWidth="4" />
    <path d="M12 24C12 18 32 18 32 24C32 30 12 30 12 24Z" fill="none" stroke="#00C662" strokeWidth="3" />
    <text x="48" y="31" fontSize="20" fontWeight="800" letterSpacing="2" fontFamily="system-ui, sans-serif">TERRASTUDIO</text>
  </svg>
);

const BrandLogoVista = () => (
  <svg className="h-8 md:h-10 w-auto text-gray-400 hover:text-white transition-colors duration-300" viewBox="0 0 200 48" fill="currentColor">
    <path d="M4 14L22 4L40 14L22 24L4 14Z" fill="#0CDBFF" />
    <path d="M4 24L22 34L40 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    <path d="M4 34L22 44L40 34" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    <text x="50" y="31" fontSize="20" fontWeight="800" letterSpacing="2" fontFamily="system-ui, sans-serif">VISTAREAL</text>
  </svg>
);

const BrandLogoGeo = () => (
  <svg className="h-8 md:h-10 w-auto text-gray-400 hover:text-white transition-colors duration-300" viewBox="0 0 220 48" fill="currentColor">
    <path d="M6 38L18 10L30 38H6Z" fill="#00C662" />
    <path d="M22 38L32 16L42 38H22Z" fill="#0CDBFF" opacity="0.8" />
    <text x="50" y="31" fontSize="20" fontWeight="800" letterSpacing="2" fontFamily="system-ui, sans-serif">GEOMINERÍA</text>
  </svg>
);

const logosList = [
  { id: "laurum", Component: BrandLogoLaurum },
  { id: "aldana", Component: BrandLogoAldana },
  { id: "urbano", Component: BrandLogoUrbano },
  { id: "terra", Component: BrandLogoTerra },
  { id: "vista", Component: BrandLogoVista },
  { id: "geo", Component: BrandLogoGeo }
];

const initialSuccessCases = [
  {
    id: "laurum",
    category: "Edificación & Control de Obra",
    badgeBg: "rgba(12, 219, 255, 0.15)",
    badgeText: "#0CDBFF",
    company: "Proyecto Laurum",
    project: "Seguimiento Temporal de Edificación y Avance de Obra 3D",
    image: "/images/real_estate_3d_twin.png",
    alt: "Seguimiento de Avance de Obra 3D del Proyecto Laurum",
    features: [
      "Comparación temporal interactiva para evaluar el avance de construcción",
      "Registro histórico de modelos 3D y evolución de etapas estructurales",
      "Inspección remota de edificación con precisión de detalle para control de hitos"
    ],
    quote:
      "La reconstrucción 3D periódica en el Proyecto Laurum nos permitió documentar y auditar cada fase de la edificación en el tiempo, optimizando la supervisión y control de obra.",
    author: "Proyecto Laurum",
    role: "Control & Seguimiento de Edificación"
  },
  {
    id: "aldana",
    category: "Ingeniería & Topografía",
    badgeBg: "rgba(0, 198, 98, 0.15)",
    badgeText: "#00C662",
    company: "Proyecto La Aldana",
    project: "Levantamiento Fotogramétrico y Modelo 3D La Aldana",
    image: "/images/drone_topography_map.png",
    alt: "Levantamiento Topográfico Fotogramétrico La Aldana",
    features: [
      "Alta precisión geométrica y ortomosaicos de alta resolución",
      "Generación de modelo digital de elevación (DEM) y curvas de nivel",
      "Formatos exportables listos para integración en software CAD y GIS"
    ],
    quote:
      "El levantamiento 3D de La Aldana nos entregó una precisión excepcional del terreno, optimizando el cálculo de pendientes y la planificación del proyecto sin contratiempos.",
    author: "Proyecto La Aldana",
    role: "Ingeniería & Topografía"
  }
];

export function LandingCardSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col justify-between relative overflow-hidden animate-pulse min-h-[420px] transform-gpu">
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="h-6 w-32 bg-white/10 rounded-full" />
          <div className="h-4 w-20 bg-white/5 rounded-full" />
        </div>
        <div className="h-7 w-3/4 bg-white/10 rounded-xl mb-3" />
        <div className="h-4 w-1/2 bg-white/5 rounded-md mb-6" />
        <div className="relative aspect-[16/9] w-full bg-white/5 rounded-2xl border border-white/10 mb-6 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#0CDBFF] animate-spin" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full bg-white/5 rounded" />
          <div className="h-3 w-5/6 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function SuccessCasesSection() {
  const [cases, setCases] = useState(initialSuccessCases);
  const [isLoading, setIsLoading] = useState(true);

  // Consultar la base de datos para obtener dinámicamente la urlImage real registrada para Laurum y La Aldana
  useEffect(() => {
    async function fetchProjectImagesFromDB() {
      try {
        const res = await axios.get("/api/public/success-cases");
        if (res.data?.success && Array.isArray(res.data.projects)) {
          const dbProjects = res.data.projects;
          
          setCases((prevCases) =>
            prevCases.map((caseItem) => {
              const matchedDbProject = dbProjects.find((p) =>
                p.name?.toLowerCase().includes(caseItem.id)
              );
              
              if (matchedDbProject && matchedDbProject.urlImage) {
                return {
                  ...caseItem,
                  image: matchedDbProject.urlImage
                };
              }
              return caseItem;
            })
          );
        }
      } catch (error) {
        console.log("Not using DB images fallback to local assets:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjectImagesFromDB();
  }, []);

  // Triplicamos la lista para lograr un bucle infinito continuo e imperceptible
  const duplicatedLogos = [...logosList, ...logosList, ...logosList, ...logosList];

  return (
    <section className="w-full py-16 md:py-24 relative z-20 overflow-hidden border-t border-white/5">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 bg-secondary/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-[90%] md:w-[80%] max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm font-semibold tracking-wider text-primary uppercase mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Casos de Éxito
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent mb-4"
          >
            Confianza respaldada por <span className="text-gradient">resultados 3D</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Conoce cómo los proyectos Laurum y La Aldana optimizan su seguimiento de obra y análisis territorial con nuestra tecnología de escaneo 3D.
          </motion.p>
        </div>

        {/* Infinite Logo-Only Carousel Ticker */}
        <div className="w-full mb-16 relative py-4">
          <div className="text-center mb-6">
            <p className="text-xs uppercase font-bold tracking-[0.2em] text-gray-400/80">
              PROYECTOS Y EMPRESAS DE CONFIANZA
            </p>
          </div>

          {/* Marquee Container with Gradient Fading Edge Masks */}
          <div 
            className="w-full overflow-hidden relative flex items-center py-4"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)"
            }}
          >
            <motion.div
              className="flex items-center gap-12 md:gap-16 w-max transform-gpu"
              animate={{ x: ["0%", "-25%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 22
              }}
            >
              {duplicatedLogos.map((item, index) => {
                const LogoComponent = item.Component;
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0 cursor-pointer px-2"
                  >
                    <LogoComponent />
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {isLoading ? (
            <>
              <LandingCardSkeleton />
              <LandingCardSkeleton />
            </>
          ) : (
            cases.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1, margin: "0px 0px -20px 0px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-card glow-card-hover rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col justify-between relative overflow-hidden group shadow-2xl transform-gpu"
            >
              {/* Header Card info */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                  <span
                    className="px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-white/10"
                    style={{ backgroundColor: item.badgeBg, color: item.badgeText }}
                  >
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">Escaneo 3D</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                  {item.company}
                </h3>
                <p className="text-sm text-gray-300 font-medium mb-6">
                  {item.project}
                </p>

                {/* 3D Scan Visual Preview */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 mb-6 bg-[#030D1C] group-hover:border-primary/40 transition-colors">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02121B]/90 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 font-medium bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Modelo 3D Activo
                    </span>
                    <span className="text-primary font-mono">Fotogrametría</span>
                  </div>
                </div>

                {/* Feature Highlights */}
                <ul className="space-y-2.5 mb-6 text-sm text-gray-300">
                  {item.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <svg
                        className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Testimonial Quote */}
              <div className="pt-5 border-t border-white/10 mt-auto bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <p className="text-xs md:text-sm text-gray-300 italic leading-relaxed mb-3">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary text-black font-bold flex items-center justify-center text-xs shadow-md">
                    {item.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold text-white">
                      {item.author}
                    </h4>
                    <p className="text-[11px] text-gray-400">{item.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )))}
        </div>
      </div>
    </section>
  );
}
