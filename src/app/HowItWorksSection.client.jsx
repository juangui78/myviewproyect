"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import Link from "next/link";

const NICHE_DATA = {
  inmobiliarias: {
    badge: "Inmobiliarias & Constructoras",
    accentColor: "#0CDBFF",
    ctaLink: "/inmobiliarias",
    ctaText: "Ver soluciones para Inmobiliarias →",
    description: "Un proceso diseñado para acelerar tus ventas sobre planos, captar compradores remotos y presentar proyectos con marketing inmersivo.",
    steps: [
      {
        step: "01",
        title: "Captura o Subida de Archivos",
        desc: "Realizamos el vuelo fotogramétrico de alta resolución de tu loteo o subes tus modelos 3D y planos arquitectónicos existentes.",
        tag: "Dron / BIM / CAD",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        )
      },
      {
        step: "02",
        title: "Creación del Modelo 3D Interactivo",
        desc: "Procesamos la topografía y geometría en la nube, generando recorridos 3D fluidos, panorámicas 360° y delimitación clara de linderos.",
        tag: "3D Interactivo · WebGL",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      },
      {
        step: "03",
        title: "Configuración Comercial",
        desc: "Asigna disponibilidad de lotes (disponible/reservado/vendido), precios, metrajes y formulario de captación directa de prospectos.",
        tag: "Gestión de Lotes & Leads",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        )
      },
      {
        step: "04",
        title: "Ventas por WhatsApp y en tu Web",
        desc: "Comparte el enlace del modelo 3D por WhatsApp o incrusta el visor interactivo en tu página web con un código iframe de una sola línea.",
        tag: "Widget Iframe & Móvil",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      }
    ]
  },
  ingenieria: {
    badge: "Ingeniería, Topografía & Obras",
    accentColor: "#10B981",
    ctaLink: "/ingenieria-topografia",
    ctaText: "Ver soluciones de Topografía & Ingeniería →",
    description: "Levantamientos milimétricos, modelado digital de elevación y control temporal para planificación y auditoría de proyectos civiles.",
    steps: [
      {
        step: "01",
        title: "Captura o Subida de Archivos",
        desc: "Realizamos el levantamiento fotogramétrico con drones georreferenciados (RTK/GCP) o subes tus nubes de puntos y modelos técnicos existentes.",
        tag: "Dron / RTK / CAD",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        )
      },
      {
        step: "02",
        title: "Procesamiento Fotogramétrico",
        desc: "Reconstrucción digital en la nube: ortofotos georreferenciadas de ultra-alta resolución, mallas poligonales y nube de puntos densa.",
        tag: "Ortofotos & Nube de Puntos",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        )
      },
      {
        step: "03",
        title: "Curvas de Nivel y Exportación",
        desc: "Generación de modelos digitales de elevación (DEM), cálculo de volúmenes de corte y relleno, y descarga en formatos compatibles con CAD/GIS.",
        tag: "AutoCAD · Civil 3D · GIS",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
      {
        step: "04",
        title: "Auditoría Temporal de Avance",
        desc: "Supervisión de cada hito constructivo mediante comparativa cronológica 3D para entrega transparente de informes a inversionistas y entidades.",
        tag: "Línea de Tiempo en la Nube",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    ]
  }
};

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState("inmobiliarias");
  const currentNiche = NICHE_DATA[activeTab];

  return (
    <section className="w-full py-14 md:py-20 relative z-10 border-t border-white/5">
      <div className="w-[90%] md:w-[75%] max-w-7xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-3xl mb-10">
          <span className="text-xs font-mono font-bold tracking-widest text-[#0CDBFF] uppercase mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0CDBFF]"></span>
            Proceso Simple y Eficiente
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mt-3 mb-4">
            ¿Cómo Funciona MyView?
          </h2>
          <p className="text-base md:text-lg text-gray-300 leading-relaxed">
            Del levantamiento físico a la plataforma interactiva en 4 pasos estratégicos diseñados según las necesidades de tu industria.
          </p>
        </div>

        {/* Niche Selector Segmented Control */}
        <div className="flex bg-[#07121D]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl mb-12">
          <button
            onClick={() => setActiveTab("inmobiliarias")}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${
              activeTab === "inmobiliarias"
                ? "bg-[#0CDBFF] text-black shadow-[0_0_20px_rgba(12,219,255,0.4)] font-extrabold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Para Inmobiliarias & Constructoras
          </button>
          <button
            onClick={() => setActiveTab("ingenieria")}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${
              activeTab === "ingenieria"
                ? "bg-[#10B981] text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] font-extrabold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Para Ingeniería & Topografía
          </button>
        </div>

        {/* Animated Steps Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full flex flex-col gap-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {currentNiche.steps.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#07121D]/80 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 shadow-xl group relative overflow-hidden"
                >
                  {/* Step Top Row: Number & Tag */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-2xl font-mono font-black tracking-tight"
                      style={{ color: currentNiche.accentColor }}
                    >
                      {item.step}
                    </span>

                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/5">
                      {item.tag}
                    </span>
                  </div>

                  {/* Icon & Details */}
                  <div className="flex flex-col gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border transition-colors duration-300"
                      style={{
                        backgroundColor: `${currentNiche.accentColor}15`,
                        color: currentNiche.accentColor,
                        borderColor: `${currentNiche.accentColor}30`
                      }}
                    >
                      {item.icon}
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-white transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Subtle bottom indicator */}
                  <div
                    className="w-full h-0.5 rounded-full opacity-30 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: currentNiche.accentColor }}
                  />
                </div>
              ))}
            </div>

            {/* Bottom Callout & Action */}
            <div className="w-full bg-gradient-to-r from-white/5 via-white/[0.02] to-transparent p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <p className="text-sm text-gray-300 text-center sm:text-left max-w-2xl">
                {currentNiche.description}
              </p>

              <Button
                as={Link}
                href={currentNiche.ctaLink}
                className="font-bold text-black text-xs md:text-sm shadow-lg hover:scale-105 transition-transform px-6 py-2.5 rounded-xl flex-shrink-0"
                style={{
                  backgroundColor: currentNiche.accentColor,
                  boxShadow: `0 0 15px ${currentNiche.accentColor}50`
                }}
              >
                {currentNiche.ctaText}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
