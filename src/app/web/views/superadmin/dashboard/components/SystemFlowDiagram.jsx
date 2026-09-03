"use client";
import React, { useState } from "react";

const NODE_DETAILS = {
  comprador: {
    title: "Comprador / Visitante Web",
    type: "Ingress Público",
    tag: "ROLE: PUBLIC",
    color: "#0CDBFF",
    description: "Usuarios finales que visitan la plataforma para explorar proyectos inmobiliarios en 3D desde dispositivos móviles o de escritorio.",
    files: [
      "src/app/web/views/user/feed/page.jsx",
      "src/app/proyectos/[id]/page.jsx",
      "src/app/web/views/visualizer/easyview/EasyView.jsx"
    ],
    flow: "Accede al visor interactivo sin necesidad de login previo; genera interacciones y leads."
  },
  inmobiliaria: {
    title: "Inmobiliaria (Empresa / Admin)",
    type: "Ingress Autenticado",
    tag: "ROLE: COMPANY",
    color: "#10B981",
    description: "Gestores y comerciales de empresas constructoras que administran sus proyectos, cargan modelos 3D y consultan analíticas de visitantes.",
    files: [
      "src/app/web/views/admin/Projects/page.jsx",
      "src/app/web/views/admin/leads/page.jsx",
      "src/app/web/views/admin/analytics/page.jsx"
    ],
    flow: "Autenticación vía NextAuth; gestión de catálogo 3D, asignación de asesores y seguimiento de prospectos."
  },
  superadmin: {
    title: "Superadministrador",
    type: "Gobernanza Global",
    tag: "ROLE: SUPERADMIN",
    color: "#EB6C36",
    description: "Nivel de máxima autoridad técnica y de negocio. Supervisa todas las inmobiliarias, proyectos 3D, usuarios y rendimiento global.",
    files: [
      "src/app/web/views/superadmin/dashboard/page.jsx",
      "src/app/web/views/superadmin/dashboard/actions/superadminActions.js",
      "src/middleware.js"
    ],
    flow: "Control total RBAC, monitorización de tráfico, creación y baja de empresas en el ecosistema."
  },
  middleware: {
    title: "NextAuth & Middleware RBAC",
    type: "Control de Acceso y Seguridad",
    tag: "SECURITY LAYER",
    color: "#94A3B8",
    description: "Inspecciona cada solicitud entrante, descifra cookies seguras JWT (crypto.js) y redirige según privilegios de rol.",
    files: [
      "src/middleware.js",
      "src/app/api/auth/[...nextauth]/route.js",
      "src/app/api/auth/actions/crypto.js"
    ],
    flow: "Protección de rutas /admin/* y /superadmin/*; garantiza el aislamiento multi-tenant por empresa."
  },
  visualizer: {
    title: "Visualizador 3D (Three.js / R3F)",
    type: "Motor Gráfico Principal",
    tag: "FOCAL CORE 3D",
    color: "#0CDBFF",
    description: "Núcleo de la experiencia MyView. Renderiza recorridos interactivos, modelos arquitectónicos, hotspots informativos y fondos 360° con alta tasa de refresco.",
    files: [
      "src/app/web/views/visualizer/easyview/EasyView.jsx",
      "src/app/web/views/visualizer/page.jsx",
      "src/app/proyectos/[id]/page.jsx"
    ],
    flow: "Descarga progresiva de GLB/GLTF, control de cámara orbital y despacho de eventos de interacción al backend."
  },
  panelCompany: {
    title: "Dashboard de Inmobiliaria",
    type: "Aplicación de Gestión",
    tag: "ADMIN PANEL",
    color: "#10B981",
    description: "Panel integral donde las constructoras configuran detalles del proyecto, gestionan planos interactivos (PlansM) y visualizan métricas.",
    files: [
      "src/app/web/views/admin/Projects/page.jsx",
      "src/app/web/views/admin/leads/page.jsx"
    ],
    flow: "Ejecuta operaciones CRUD contra la API y sincroniza el estado de las propiedades en venta."
  },
  panelSuperadmin: {
    title: "Panel Superadministrador",
    type: "Consola de Auditoría",
    tag: "SUPERADMIN CORE",
    color: "#EB6C36",
    description: "Interfaz reactiva con gráficos de distribución por inmobiliaria, proyectos más visitados, sistemas operativos y navegadores.",
    files: [
      "src/app/web/views/superadmin/dashboard/page.jsx",
      "src/app/web/views/superadmin/dashboard/actions/superadminActions.js"
    ],
    flow: "Consultas analíticas agregadas directamente sobre MongoDB para optimización del negocio."
  },
  easyviewEmbed: {
    title: "EasyView Embed (Widget / Iframe)",
    type: "Canal de Integración Externa",
    tag: "EMBEDDED API",
    color: "#94A3B8",
    description: "Permite a las inmobiliarias incrustar el recorrido 3D directamente dentro de sus propios portales web corporativos.",
    files: [
      "src/app/web/views/visualizer/easyview/EasyView.jsx"
    ],
    flow: "Carga optimizada en sandbox con postMessage para eventos de interacción y conversión."
  },
  apiGateway: {
    title: "Next.js API Route Handlers",
    type: "Backend & Controladores",
    tag: "FOCAL GATEWAY",
    color: "#EB6C36",
    description: "Conjunto de endpoints REST en Next.js App Router para resolver proyectos, registro de leads, captura de telemetría y autenticación.",
    files: [
      "src/app/api/controllers/proyects/route.js",
      "src/app/api/controllers/leads/route.js",
      "src/app/api/controllers/notifications/route.js"
    ],
    flow: "Valida datos, aplica lógica de negocio y se comunica con MongoDB a través de Mongoose."
  },
  cloudAssets: {
    title: "Almacenamiento Cloud & CDN",
    type: "Persistencia Estática",
    tag: "BLOB STORAGE",
    color: "#94A3B8",
    description: "Servidores de alta disponibilidad para la entrega eficiente de binarios 3D pesados (.glb, .gltf), texturas y fotografías 360°.",
    files: [
      "src/app/api/models/models.js",
      "public/images/",
      "public/videos/"
    ],
    flow: "Entrega con compresión Draco y caché perimetral para tiempos de carga mínimos en el visor."
  },
  mongoDatabase: {
    title: "Base de Datos MongoDB Atlas",
    type: "Capa de Datos Persistente",
    tag: "DATABASE CLUSTER",
    color: "#0CDBFF",
    description: "Almacén NoSQL estructurado con modelos de Mongoose para usuarios, inmobiliarias, metadatos de modelos 3D, analíticas y leads.",
    files: [
      "src/app/api/models/users.js",
      "src/app/api/models/company.js",
      "src/app/api/models/proyect.js",
      "src/app/api/models/models.js",
      "src/app/api/models/leads.js",
      "src/app/api/models/analytics.js"
    ],
    flow: "Transacciones seguras, indexación para consultas geográficas/temporales y persistencia durable."
  }
};

export default function SystemFlowDiagram() {
  const [selectedNodeKey, setSelectedNodeKey] = useState("visualizer");
  const [activeFilter, setActiveFilter] = useState("all");

  const selectedNode = NODE_DETAILS[selectedNodeKey] || NODE_DETAILS.visualizer;

  const getPathOpacity = (category) => {
    if (activeFilter === "all") return 1;
    if (activeFilter === "3d" && (category === "3d" || category === "assets")) return 1;
    if (activeFilter === "leads" && (category === "leads" || category === "db")) return 1;
    if (activeFilter === "rbac" && (category === "rbac" || category === "auth")) return 1;
    return 0.15;
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0CDBFF] shadow-[0_0_10px_#0CDBFF]"></span>
            <span className="text-xs font-mono tracking-widest text-[#0CDBFF] uppercase font-bold">
              Arquitectura del Ecosistema · Diagram Design v2.6
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Topología y Flujo Operativo MyView
          </h3>
          <p className="text-sm text-white/60 mt-1 max-w-2xl leading-relaxed">
            Recorrido integral de datos: desde la interacción pública en el visualizador 3D (Three.js/R3F) y la gobernanza multi-rol, hasta los Route Handlers y MongoDB Atlas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter badges */}
          <div className="flex bg-[#070D14] p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeFilter === "all" ? "bg-white/20 text-white font-bold" : "text-white/50 hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilter("3d")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeFilter === "3d" ? "bg-[#0CDBFF] text-black font-black shadow-[0_0_12px_rgba(12,219,255,0.4)]" : "text-[#0CDBFF]/70 hover:text-[#0CDBFF]"
              }`}
            >
              Flujo 3D
            </button>
            <button
              onClick={() => setActiveFilter("leads")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeFilter === "leads" ? "bg-[#10B981] text-black font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "text-[#10B981]/70 hover:text-[#10B981]"
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveFilter("rbac")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeFilter === "rbac" ? "bg-[#EB6C36] text-black font-black shadow-[0_0_12px_rgba(235,108,54,0.4)]" : "text-[#EB6C36]/70 hover:text-[#EB6C36]"
              }`}
            >
              RBAC / Auth
            </button>
          </div>

          <a
            href="/diagrams/myview-system-flow.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
          >
            <svg className="w-4 h-4 text-[#0CDBFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Pestaña Completa
          </a>
        </div>
      </div>

      {/* Main Grid: Diagram Canvas + Node Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* SVG Diagram Canvas */}
        <div className="xl:col-span-3 bg-[#081018] border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden flex flex-col">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 1180 640"
              className="w-full min-w-[920px] h-auto select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="diag-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="0.9" fill="rgba(255,255,255,0.07)" />
                </pattern>

                <linearGradient id="g-focal-cyan" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0E2838" />
                  <stop offset="100%" stopColor="#081824" />
                </linearGradient>

                <linearGradient id="g-focal-accent" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#261915" />
                  <stop offset="100%" stopColor="#140E0C" />
                </linearGradient>

                <linearGradient id="g-node" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#131E2C" />
                  <stop offset="100%" stopColor="#0E1724" />
                </linearGradient>

                {/* Markers */}
                <marker id="m-arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 9 3.5, 0 7" fill="#94A3B8" />
                </marker>
                <marker id="m-cyan" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 9 3.5, 0 7" fill="#0CDBFF" />
                </marker>
                <marker id="m-accent" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 9 3.5, 0 7" fill="#EB6C36" />
                </marker>
                <marker id="m-emerald" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 9 3.5, 0 7" fill="#10B981" />
                </marker>
              </defs>

              {/* Canvas Background */}
              <rect width="100%" height="100%" rx="12" fill="#070D14" />
              <rect width="100%" height="100%" rx="12" fill="url(#diag-dots)" />

              {/* Tier Boundaries */}
              <g opacity={0.9}>
                {/* Tier 1: Ingress */}
                <rect x="35" y="55" width="225" height="540" rx="10" fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="6,4" />
                <rect x="65" y="44" width="165" height="22" rx="4" fill="#070D14" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                <text x="147" y="59" fill="#E2E8F0" fontSize="11" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.14em">
                  INGRESS & ROLES
                </text>

                {/* Tier 2: Next.js Platform & 3D */}
                <rect x="290" y="55" width="480" height="540" rx="10" fill="rgba(12,219,255,0.02)" stroke="rgba(12,219,255,0.2)" strokeWidth="1" strokeDasharray="6,4" />
                <rect x="390" y="44" width="280" height="22" rx="4" fill="#070D14" stroke="rgba(12,219,255,0.3)" strokeWidth="0.8" />
                <text x="530" y="59" fill="#0CDBFF" fontSize="11" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.14em">
                  NEXT.JS PLATFORM & 3D RUNTIME
                </text>

                {/* Tier 3: Core API & Data */}
                <rect x="800" y="55" width="345" height="540" rx="10" fill="rgba(235,108,54,0.02)" stroke="rgba(235,108,54,0.2)" strokeWidth="1" strokeDasharray="6,4" />
                <rect x="850" y="44" width="245" height="22" rx="4" fill="#070D14" stroke="rgba(235,108,54,0.3)" strokeWidth="0.8" />
                <text x="972" y="59" fill="#EB6C36" fontSize="11" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.14em">
                  BACKEND API & DATA TIER
                </text>
              </g>

              {/* Connectors (Behind Nodes) */}
              {/* 1. Comprador -> Visualizador 3D */}
              <g opacity={getPathOpacity("3d")}>
                <line x1="220" y1="138" x2="520" y2="138" stroke="#0CDBFF" strokeWidth="2.2" markerEnd="url(#m-cyan)" />
                <rect x="325" y="125" width="138" height="26" rx="5" fill="#070D14" stroke="rgba(12,219,255,0.4)" strokeWidth="1" />
                <text x="394" y="142" fill="#0CDBFF" fontSize="11" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">
                  EXPLORA 3D / TOUR
                </text>
              </g>

              {/* 2. Inmobiliaria -> Middleware */}
              <g opacity={getPathOpacity("auth")}>
                <line x1="220" y1="298" x2="315" y2="298" stroke="#94A3B8" strokeWidth="1.4" markerEnd="url(#m-arrow)" />
                <rect x="230" y="286" width="80" height="24" rx="4" fill="#070D14" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
                <text x="270" y="302" fill="#E2E8F0" fontSize="10" fontFamily="'Geist Mono', monospace" fontWeight="600" textAnchor="middle">LOGIN / JWT</text>
              </g>

              {/* 3. Superadmin -> Superadmin Dashboard */}
              <g opacity={getPathOpacity("rbac")}>
                <line x1="220" y1="465" x2="315" y2="465" stroke="#EB6C36" strokeWidth="1.6" markerEnd="url(#m-accent)" />
                <rect x="228" y="453" width="84" height="24" rx="4" fill="#070D14" stroke="rgba(235,108,54,0.4)" strokeWidth="0.8" />
                <text x="270" y="469" fill="#EB6C36" fontSize="10" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle">RBAC ROOT</text>
              </g>

              {/* 4. Middleware -> Panel Inmobiliaria */}
              <g opacity={getPathOpacity("auth")}>
                <line x1="480" y1="298" x2="520" y2="298" stroke="#94A3B8" strokeWidth="1.4" markerEnd="url(#m-arrow)" />
              </g>

              {/* 5. Middleware -> Dashboard Superadmin */}
              <g opacity={getPathOpacity("rbac")}>
                <line x1="395" y1="336" x2="395" y2="425" stroke="#EB6C36" strokeWidth="1.4" markerEnd="url(#m-accent)" />
                <rect x="345" y="364" width="100" height="24" rx="4" fill="#070D14" stroke="rgba(235,108,54,0.3)" strokeWidth="0.8" />
                <text x="395" y="380" fill="#EB6C36" fontSize="10" fontFamily="'Geist Mono', monospace" fontWeight="600" textAnchor="middle">SESSION VERIF</text>
              </g>

              {/* 6. Visualizador 3D -> API Controllers */}
              <g opacity={getPathOpacity("leads")}>
                <line x1="720" y1="130" x2="830" y2="130" stroke="#10B981" strokeWidth="1.8" markerEnd="url(#m-emerald)" />
                <rect x="730" y="117" width="94" height="25" rx="4" fill="#070D14" stroke="rgba(16,185,129,0.4)" strokeWidth="1" />
                <text x="777" y="133" fill="#10B981" fontSize="10.5" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle">LEADS & VISITS</text>
              </g>

              {/* 7. Visualizador 3D -> Cloud CDN (Orthogonal right+down) */}
              <g opacity={getPathOpacity("assets")}>
                <path d="M 720,160 H 767 Q 775,160 775,168 V 267 Q 775,275 783,275 H 830" fill="none" stroke="#94A3B8" strokeWidth="1.4" markerEnd="url(#m-arrow)" />
                <rect x="730" y="209" width="90" height="24" rx="4" fill="#070D14" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
                <text x="775" y="225" fill="#E2E8F0" fontSize="10" fontFamily="'Geist Mono', monospace" fontWeight="600" textAnchor="middle">GET .GLB / 360°</text>
              </g>

              {/* 8. Panel Inmobiliaria -> API Controllers */}
              <g opacity={getPathOpacity("auth")}>
                <path d="M 720,298 H 752 Q 760,298 760,290 V 158 Q 760,150 768,150 H 830" fill="none" stroke="#94A3B8" strokeWidth="1.4" markerEnd="url(#m-arrow)" />
                <rect x="718" y="239" width="86" height="24" rx="4" fill="#070D14" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
                <text x="761" y="255" fill="#E2E8F0" fontSize="10" fontFamily="'Geist Mono', monospace" fontWeight="600" textAnchor="middle">CRUD PROYECT</text>
              </g>

              {/* 9. Dashboard Superadmin -> API */}
              <g opacity={getPathOpacity("rbac")}>
                <path d="M 480,465 H 737 Q 745,465 745,457 V 178 Q 745,170 753,170 H 830" fill="none" stroke="#EB6C36" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#m-accent)" />
              </g>

              {/* 10. API Controllers <-> MongoDB */}
              <g opacity={getPathOpacity("db")}>
                <line x1="995" y1="185" x2="995" y2="400" stroke="#0CDBFF" strokeWidth="1.8" markerEnd="url(#m-cyan)" />
                <line x1="960" y1="400" x2="960" y2="185" stroke="#94A3B8" strokeWidth="1.3" strokeDasharray="4,3" markerEnd="url(#m-arrow)" />
                <rect x="995" y="278" width="108" height="25" rx="4" fill="#070D14" stroke="rgba(12,219,255,0.35)" strokeWidth="1" />
                <text x="1049" y="294" fill="#0CDBFF" fontSize="10" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle">MONGOOSE QUERY</text>
                <rect x="870" y="313" width="84" height="24" rx="4" fill="#070D14" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
                <text x="912" y="329" fill="#E2E8F0" fontSize="10" fontFamily="'Geist Mono', monospace" fontWeight="600" textAnchor="middle">DOCUMENTS</text>
              </g>

              {/* Interactive Nodes */}
              {/* NODE 1: Comprador */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedNodeKey("comprador")}
              >
                <rect
                  x="55" y="98" width="165" height="80" rx="8"
                  fill="url(#g-node)"
                  stroke={selectedNodeKey === "comprador" ? "#0CDBFF" : "rgba(255,255,255,0.18)"}
                  strokeWidth={selectedNodeKey === "comprador" ? 2.5 : 1}
                />
                <rect x="65" y="108" width="64" height="16" rx="3" fill="rgba(255,255,255,0.08)" />
                <text x="97" y="120" fill="#CBD5E1" fontSize="8.5" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.1em">PUBLIC</text>
                <text x="137" y="143" fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="'Geist', sans-serif" textAnchor="middle">Comprador Web</text>
                <text x="137" y="162" fill="#94A3B8" fontSize="10.5" fontWeight="500" fontFamily="'Geist Mono', monospace" textAnchor="middle">Exploración 3D & Leads</text>
              </g>

              {/* NODE 2: Inmobiliaria */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedNodeKey("inmobiliaria")}
              >
                <rect
                  x="55" y="258" width="165" height="80" rx="8"
                  fill="url(#g-node)"
                  stroke={selectedNodeKey === "inmobiliaria" ? "#10B981" : "rgba(16,185,129,0.35)"}
                  strokeWidth={selectedNodeKey === "inmobiliaria" ? 2.5 : 1}
                />
                <rect x="65" y="268" width="72" height="16" rx="3" fill="rgba(16,185,129,0.15)" />
                <text x="101" y="280" fill="#10B981" fontSize="8.5" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.1em">COMPANY</text>
                <text x="137" y="303" fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="'Geist', sans-serif" textAnchor="middle">Inmobiliaria</text>
                <text x="137" y="322" fill="#94A3B8" fontSize="10.5" fontWeight="500" fontFamily="'Geist Mono', monospace" textAnchor="middle">Gestión Proyectos & Leads</text>
              </g>

              {/* NODE 3: Superadmin */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedNodeKey("superadmin")}
              >
                <rect
                  x="55" y="423" width="165" height="80" rx="8"
                  fill="url(#g-node)"
                  stroke={selectedNodeKey === "superadmin" ? "#EB6C36" : "rgba(235,108,54,0.4)"}
                  strokeWidth={selectedNodeKey === "superadmin" ? 2.5 : 1}
                />
                <rect x="65" y="433" width="82" height="16" rx="3" fill="rgba(235,108,54,0.18)" />
                <text x="106" y="445" fill="#EB6C36" fontSize="8.5" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.1em">SUPERADMIN</text>
                <text x="137" y="468" fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="'Geist', sans-serif" textAnchor="middle">Superadmin</text>
                <text x="137" y="487" fill="#94A3B8" fontSize="10.5" fontWeight="500" fontFamily="'Geist Mono', monospace" textAnchor="middle">Auditoría & Métricas</text>
              </g>

              {/* NODE 4: Middleware */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedNodeKey("middleware")}
              >
                <rect
                  x="315" y="258" width="165" height="80" rx="8"
                  fill="url(#g-node)"
                  stroke={selectedNodeKey === "middleware" ? "#FFFFFF" : "rgba(255,255,255,0.22)"}
                  strokeWidth={selectedNodeKey === "middleware" ? 2.5 : 1}
                />
                <rect x="325" y="268" width="88" height="16" rx="3" fill="rgba(255,255,255,0.08)" />
                <text x="369" y="280" fill="#CBD5E1" fontSize="8.5" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">MIDDLEWARE</text>
                <text x="397" y="303" fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="'Geist', sans-serif" textAnchor="middle">NextAuth / RBAC</text>
                <text x="397" y="322" fill="#94A3B8" fontSize="10.5" fontWeight="500" fontFamily="'Geist Mono', monospace" textAnchor="middle">Tokens JWT & Guard</text>
              </g>

              {/* NODE 5 (FOCAL 1): Visualizador 3D R3F */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedNodeKey("visualizer")}
              >
                <rect
                  x="520" y="93" width="200" height="92" rx="10"
                  fill="url(#g-focal-cyan)"
                  stroke="#0CDBFF"
                  strokeWidth={selectedNodeKey === "visualizer" ? 3 : 2}
                  filter={selectedNodeKey === "visualizer" ? "drop-shadow(0 0 14px rgba(12,219,255,0.6))" : "drop-shadow(0 0 8px rgba(12,219,255,0.25))"}
                />
                <rect x="532" y="103" width="112" height="18" rx="3" fill="rgba(12,219,255,0.2)" />
                <text x="588" y="116" fill="#0CDBFF" fontSize="9" fontFamily="'Geist Mono', monospace" fontWeight="800" textAnchor="middle" letterSpacing="0.1em">CORE 3D ENGINE</text>
                <text x="620" y="142" fill="#FFFFFF" fontSize="15.5" fontWeight="800" fontFamily="'Geist', sans-serif" textAnchor="middle">Visualizador 3D</text>
                <text x="620" y="161" fill="#0CDBFF" fontSize="11" fontFamily="'Geist Mono', monospace" fontWeight="600" textAnchor="middle">Three.js · R3F · EasyView</text>
                <text x="620" y="176" fill="rgba(255,255,255,0.75)" fontSize="9.5" fontWeight="500" fontFamily="'Geist', sans-serif" textAnchor="middle">Hotspots · 360° · Planos 3D</text>
              </g>

              {/* NODE 6: Panel Inmobiliaria */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedNodeKey("panelCompany")}
              >
                <rect
                  x="520" y="258" width="200" height="80" rx="8"
                  fill="url(#g-node)"
                  stroke={selectedNodeKey === "panelCompany" ? "#10B981" : "rgba(255,255,255,0.18)"}
                  strokeWidth={selectedNodeKey === "panelCompany" ? 2.5 : 1}
                />
                <rect x="532" y="268" width="82" height="16" rx="3" fill="rgba(255,255,255,0.08)" />
                <text x="573" y="280" fill="#CBD5E1" fontSize="8.5" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">ADMIN VIEW</text>
                <text x="620" y="303" fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="'Geist', sans-serif" textAnchor="middle">Dashboard Empresa</text>
                <text x="620" y="322" fill="#94A3B8" fontSize="10.5" fontWeight="500" fontFamily="'Geist Mono', monospace" textAnchor="middle">Proyectos · Leads · Métricas</text>
              </g>

              {/* NODE 7: Dashboard Superadmin */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedNodeKey("panelSuperadmin")}
              >
                <rect
                  x="315" y="423" width="165" height="80" rx="8"
                  fill="url(#g-node)"
                  stroke={selectedNodeKey === "panelSuperadmin" ? "#EB6C36" : "rgba(235,108,54,0.4)"}
                  strokeWidth={selectedNodeKey === "panelSuperadmin" ? 2.5 : 1}
                />
                <rect x="325" y="433" width="90" height="16" rx="3" fill="rgba(235,108,54,0.18)" />
                <text x="370" y="445" fill="#EB6C36" fontSize="8.5" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">SUPERADMIN</text>
                <text x="397" y="468" fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="'Geist', sans-serif" textAnchor="middle">Superadmin Core</text>
                <text x="397" y="487" fill="#94A3B8" fontSize="10.5" fontWeight="500" fontFamily="'Geist Mono', monospace" textAnchor="middle">Empresas & Analítica Global</text>
              </g>

              {/* NODE 8: EasyView Embed */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedNodeKey("easyviewEmbed")}
              >
                <rect
                  x="520" y="423" width="200" height="80" rx="8"
                  fill="url(#g-node)"
                  stroke={selectedNodeKey === "easyviewEmbed" ? "#0CDBFF" : "rgba(255,255,255,0.18)"}
                  strokeWidth={selectedNodeKey === "easyviewEmbed" ? 2.5 : 1}
                />
                <rect x="532" y="433" width="76" height="16" rx="3" fill="rgba(255,255,255,0.08)" />
                <text x="570" y="445" fill="#CBD5E1" fontSize="8.5" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">IFRAME API</text>
                <text x="620" y="468" fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="'Geist', sans-serif" textAnchor="middle">EasyView Embed</text>
                <text x="620" y="487" fill="#94A3B8" fontSize="10.5" fontWeight="500" fontFamily="'Geist Mono', monospace" textAnchor="middle">Integración Portales Inmob.</text>
              </g>

              {/* NODE 9 (FOCAL 2): Core API Endpoints */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedNodeKey("apiGateway")}
              >
                <rect
                  x="830" y="93" width="285" height="92" rx="10"
                  fill="url(#g-focal-accent)"
                  stroke="#EB6C36"
                  strokeWidth={selectedNodeKey === "apiGateway" ? 3 : 2}
                  filter={selectedNodeKey === "apiGateway" ? "drop-shadow(0 0 14px rgba(235,108,54,0.6))" : "drop-shadow(0 0 8px rgba(235,108,54,0.25))"}
                />
                <rect x="844" y="103" width="96" height="18" rx="3" fill="rgba(235,108,54,0.25)" />
                <text x="892" y="116" fill="#EB6C36" fontSize="9" fontFamily="'Geist Mono', monospace" fontWeight="800" textAnchor="middle" letterSpacing="0.1em">API GATEWAY</text>
                <text x="972" y="142" fill="#FFFFFF" fontSize="15" fontWeight="800" fontFamily="'Geist', sans-serif" textAnchor="middle">Next.js API Route Handlers</text>
                <text x="972" y="161" fill="#EB6C36" fontSize="11" fontFamily="'Geist Mono', monospace" fontWeight="600" textAnchor="middle">/api/controllers (Proyectos, Leads, Modelos)</text>
                <text x="972" y="176" fill="rgba(255,255,255,0.75)" fontSize="9.5" fontWeight="500" fontFamily="'Geist', sans-serif" textAnchor="middle">Validación, crypto.js & sesiones</text>
              </g>

              {/* NODE 10: Cloud Assets CDN */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedNodeKey("cloudAssets")}
              >
                <rect
                  x="830" y="248" width="285" height="80" rx="8"
                  fill="url(#g-node)"
                  stroke={selectedNodeKey === "cloudAssets" ? "#FFFFFF" : "rgba(255,255,255,0.18)"}
                  strokeWidth={selectedNodeKey === "cloudAssets" ? 2.5 : 1}
                />
                <rect x="844" y="258" width="86" height="16" rx="3" fill="rgba(255,255,255,0.08)" />
                <text x="887" y="270" fill="#CBD5E1" fontSize="8.5" fontFamily="'Geist Mono', monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">CDN STORAGE</text>
                <text x="972" y="293" fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="'Geist', sans-serif" textAnchor="middle">Almacenamiento de Modelos 3D</text>
                <text x="972" y="312" fill="#94A3B8" fontSize="10.5" fontWeight="500" fontFamily="'Geist Mono', monospace" textAnchor="middle">Archivos .GLB · Panoramas 360° · Planos</text>
              </g>

              {/* NODE 11: MongoDB Database */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedNodeKey("mongoDatabase")}
              >
                <rect
                  x="830" y="398" width="285" height="100" rx="10"
                  fill="url(#g-node)"
                  stroke={selectedNodeKey === "mongoDatabase" ? "#0CDBFF" : "rgba(12,219,255,0.45)"}
                  strokeWidth={selectedNodeKey === "mongoDatabase" ? 3 : 1.6}
                />
                <rect x="844" y="408" width="118" height="18" rx="3" fill="rgba(12,219,255,0.18)" />
                <text x="903" y="421" fill="#0CDBFF" fontSize="9" fontFamily="'Geist Mono', monospace" fontWeight="800" textAnchor="middle" letterSpacing="0.1em">DATABASE ATLAS</text>
                <text x="972" y="446" fill="#FFFFFF" fontSize="15" fontWeight="800" fontFamily="'Geist', sans-serif" textAnchor="middle">MongoDB (Mongoose ODM)</text>
                <text x="972" y="466" fill="#CBD5E1" fontSize="10.5" fontWeight="500" fontFamily="'Geist Mono', monospace" textAnchor="middle">Users · Companies · Proyects · Models</text>
                <text x="972" y="483" fill="#94A3B8" fontSize="10.5" fontWeight="500" fontFamily="'Geist Mono', monospace" textAnchor="middle">Leads · Analytics · Notes · PlansM</text>
              </g>
            </svg>
          </div>

          {/* Quick Legend at bottom of diagram */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm font-mono text-white/70">
            <div className="flex items-center gap-5 flex-wrap">
              <span className="flex items-center gap-2">
                <span className="w-4 h-1 rounded-full bg-[#0CDBFF]"></span> Recorrido 3D
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-1 rounded-full bg-[#10B981]"></span> Leads & Visitas
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-1 rounded-full bg-[#EB6C36]"></span> Gobernanza Superadmin
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-0.5 border-t border-dashed border-[#94A3B8]"></span> Mongoose Queries
              </span>
            </div>
            <span className="text-white/40 text-xs">Haz clic sobre cualquier bloque para inspeccionar</span>
          </div>
        </div>

        {/* Node Inspector Card */}
        <div className="bg-[#0B151F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider"
                style={{
                  backgroundColor: `${selectedNode.color}20`,
                  color: selectedNode.color,
                  border: `1px solid ${selectedNode.color}50`
                }}
              >
                {selectedNode.tag}
              </span>
              <span className="text-xs font-mono text-white/50 uppercase font-semibold">
                {selectedNode.type}
              </span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">
                {selectedNode.title}
              </h4>
              <p className="text-sm text-white/70 mt-2 leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            <div className="bg-[#070D14] p-4 rounded-xl border border-white/10 flex flex-col gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#0CDBFF] font-bold">
                Flujo Operativo
              </span>
              <p className="text-xs text-white/80 leading-relaxed font-sans">
                {selectedNode.flow}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-white/50 font-bold">
                Archivos Clave en el Proyecto
              </span>
              <div className="flex flex-col gap-1.5">
                {selectedNode.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="text-xs font-mono text-white/80 bg-white/5 px-3 py-2 rounded-lg border border-white/10 break-all hover:text-white transition-colors"
                  >
                    {file}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs font-mono text-white/50 flex justify-between items-center mt-4">
            <span>MyView Architecture</span>
            <span className="text-[#0CDBFF] font-bold">v2.6 Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
