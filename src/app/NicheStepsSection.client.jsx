"use client";
import React from "react";
import { motion } from "framer-motion";

const NICHE_STEPS = {
  inmobiliarias: {
    accentColor: "#0CDBFF",
    eyebrow: "Flujo de Trabajo Comercial",
    title: "¿Cómo transformamos tu proyecto en un modelo 3D de ventas?",
    subtitle: "Un proceso ágil y transparente desde el primer vuelo hasta el cierre de ventas por WhatsApp o en tu sitio web.",
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
    accentColor: "#10B981",
    eyebrow: "Flujo Técnico de Precisión",
    title: "¿Cómo ejecutamos tu levantamiento y entregables técnicos?",
    subtitle: "Metodología georreferenciada con drones y receptores GNSS para proyectos civiles, mineros y topográficos.",
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

export default function NicheStepsSection({ niche = "inmobiliarias" }) {
  const data = NICHE_STEPS[niche] || NICHE_STEPS.inmobiliarias;

  return (
    <div className="w-full py-12 md:py-16 relative z-10 border-t border-b border-white/5 my-6">
      <div className="w-[90%] md:w-[80%] mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-3xl mb-12">
          <span
            className="text-xs font-mono font-bold tracking-widest uppercase mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border"
            style={{
              color: data.accentColor,
              backgroundColor: `${data.accentColor}15`,
              borderColor: `${data.accentColor}30`
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.accentColor }}></span>
            {data.eyebrow}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-3 mb-3">
            {data.title}
          </h2>
          <p className="text-sm md:text-base text-gray-300 leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {data.steps.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#07121D]/85 backdrop-blur-2xl border border-white/10 hover:border-white/25 rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 shadow-xl group relative overflow-hidden"
            >
              {/* Step Top Row: Number & Tag */}
              <div className="flex items-center justify-between">
                <span
                  className="text-2xl font-mono font-black tracking-tight"
                  style={{ color: data.accentColor }}
                >
                  {item.step}
                </span>

                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/5 text-white/70 border border-white/5">
                  {item.tag}
                </span>
              </div>

              {/* Icon & Details */}
              <div className="flex flex-col gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border transition-colors duration-300"
                  style={{
                    backgroundColor: `${data.accentColor}15`,
                    color: data.accentColor,
                    borderColor: `${data.accentColor}30`
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

              {/* Bottom Progress Accent */}
              <div
                className="w-full h-0.5 rounded-full opacity-30 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: data.accentColor }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
