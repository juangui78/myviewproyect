"use client";
import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button,
  Image,
} from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import style from "../web/global_components/navbar/styles/navbar.module.css";
import Check from "../web/global_components/icons/CheckIcon";
import InteractiveBlobs from "../InteractiveBlobs.client";
import ContactSection from "../ContactSection.client";
import Footer from "../web/global_components/footer/Footer";
import TablePrices from "../tablePrices";
import NicheStepsSection from "../NicheStepsSection.client";
import FloatingWhatsapp from "../FloatingWhatsapp.client";

export default function IngenieriaTopografiaPage() {
  return (
    <div className="bg-[#02121B] bg-[url(/images/op11.webp)] bg-no-repeat bg-cover bg-grid-pattern overflow-hidden h-full min-h-screen text-foreground relative">
      <InteractiveBlobs />

      <div className="overflow-y-auto overflow-x-hidden h-[100vh] scrollbar relative z-10">
        <Navbar
          disableAnimation
          isBordered
          className={style.NavBar}
          position="sticky"
        >
          <NavbarContent className="sm:hidden" justify="start">
            <NavbarMenuToggle className="text-white" />
          </NavbarContent>

          <NavbarContent className="sm:hidden pr-3" justify="center">
            <NavbarBrand>
              <Link href="/">
                <Image
                  src="/logos/completo-fullblanco.png"
                  className="object-cover cursor-pointer"
                  alt="logo"
                  width={150}
                  height={150}
                />
              </Link>
            </NavbarBrand>
          </NavbarContent>

          <NavbarContent className="hidden sm:flex gap-6" justify="center">
            <NavbarBrand>
              <Link href="/">
                <Image
                  src="/logos/completo-fullblanco.png"
                  className="object-cover cursor-pointer"
                  alt="logo"
                  width={150}
                  height={150}
                />
              </Link>
            </NavbarBrand>
            <NavbarItem>
              <Link className="text-white font-medium hover:text-primary transition-colors" href="#precios">
                Precios
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className="text-white font-medium hover:text-primary transition-colors" href="/inmobiliarias">
                Inmobiliarias
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className="text-primary font-medium hover:text-primary transition-colors" href="/ingenieria-topografia">
                Ingeniería y Topografía
              </Link>
            </NavbarItem>
          </NavbarContent>

          <NavbarContent justify="end">
            <NavbarItem>
              <Button
                as={Link}
                color="primary"
                variant="light"
                href="/web/views/login"
                className="text-white"
              >
                Iniciar Sesion
              </Button>
            </NavbarItem>
          </NavbarContent>

          <NavbarMenu className="bg-[#02121B]/95 backdrop-blur-md border-t border-white/10">
            <NavbarMenuItem className="pt-4">
              <Link className="w-full text-white py-2 border-b border-white/5 hover:text-primary transition-colors" href="#precios" size="lg">
                Precios
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link className="w-full text-white py-2 border-b border-white/5 hover:text-primary transition-colors" href="/inmobiliarias" size="lg">
                Inmobiliarias
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link className="w-full text-primary py-2 hover:text-primary transition-colors" href="/ingenieria-topografia" size="lg">
                Ingeniería y Topografía
              </Link>
            </NavbarMenuItem>
          </NavbarMenu>
        </Navbar>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 md:py-20 w-full mx-auto relative overflow-hidden">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.2
                }
              }
            }}
            className="w-[80%] max-w-4xl text-center z-10"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter leading-tight"
            >
              {"Topografía aérea y modelado de ".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="inline-block mr-3"
                >
                  {word}
                </motion.span>
              ))}
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="inline-block text-gradient text-glow-animated"
              >
                alta precisión
              </motion.span>
            </motion.h1>
            <motion.h2
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto"
            >
              Modelos 3D y ortomosaicos georreferenciados para levantamientos técnicos, curvas de nivel y planificación vial con tecnología drone avanzada.
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 mt-2"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  as={Link}
                  href="/web/views/login"
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary text-black font-bold shadow-[0_0_20px_rgba(12,219,255,0.3)] hover:shadow-[0_0_35px_rgba(12,219,255,0.6)] transition-all duration-300 border border-primary/20"
                >
                  Empezar ya
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  as="a"
                  href="#contacto"
                  size="lg"
                  className="bg-transparent border-2 border-primary/45 text-white font-semibold hover:bg-primary/10 transition-all duration-300 shadow-[0_0_15px_rgba(12,219,255,0.1)] hover:border-primary"
                >
                  Solicitar Información
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="w-[90%] md:w-[80%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-10">
          {[
            {
              title: "Exportación CAD/GIS",
              desc: "Modelos tridimensionales compatibles con software técnico estándar como AutoCAD, Civil 3D y QGIS. Importación directa de mallas de relieve y nubes de puntos."
            },
            {
              title: "Cálculos Volumétricos",
              desc: "Cálculos rápidos de volumen para movimientos de tierra, corte y relleno sobre modelos digitales del terreno precisos. Optimiza costos de maquinaria y obra."
            },
            {
              title: "Modelos de Elevación (DEM)",
              desc: "Generación automatizada de curvas de nivel, mapas de pendientes y modelado digital de elevaciones (DEM) para drenajes y planeación de laderas."
            },
            {
              title: "Historial y Seguimiento 3D",
              desc: "Realiza un seguimiento cronológico y preciso del movimiento de tierras y avance de la obra. Compara nubes de puntos y modelos entre diferentes fechas de escaneo."
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card glow-card-hover p-6 rounded-2xl border border-white/10"
            >
              <h3 className="text-xl font-bold mb-3 text-primary">{item.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Pasos de trabajo especializados para Ingeniería y Topografía */}
        <NicheStepsSection niche="ingenieria" />

        {/* Dynamic Detail Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full py-10 md:py-14 mx-auto flex justify-center items-center"
        >
          <div className="w-[90%] md:w-[70%] grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              className="relative aspect-square w-full max-w-md md:max-w-full mx-auto glow-card-hover rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Image src="/images/drone_topography_map.png" alt="Ingeniería y Topografía 3D" fill className="object-cover relative z-10" />
            </motion.div>

            <motion.div
              className="glass-card glow-card-hover p-8 rounded-2xl"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="font-bold text-3xl text-left text-white mb-6">
                Fotogrametría y{" "}
                <span className="text-[#10B981] font-extrabold not-italic drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                  Levantamientos Digitales
                </span>
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Reduce drásticamente el tiempo de recolección en campo. Captura miles de coordenadas en minutos con una resolución visual excepcional y precisión métrica confiable.
              </p>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-3">
                  <Check className="text-primary w-4 h-4 flex-shrink-0" />
                  <span>Curvas de nivel de alta definición georreferenciadas.</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-secondary w-4 h-4 flex-shrink-0" />
                  <span>Modelado digital de superficies de gran fidelidad técnica.</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-primary w-4 h-4 flex-shrink-0" />
                  <span>Mapeo y ortomosaicos aéreos precisos en formato GeoTIFF.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Card bottom */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="w-full py-10 md:py-14 mx-auto flex justify-center items-center"
        >
          <div className="w-[90%] md:w-[70%] glass-card glow-card-hover p-10 rounded-3xl relative overflow-hidden bg-gradient-to-br from-white/5 to-white/0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="font-bold text-4xl text-left text-white mb-4">
                  Topografía del futuro,{" "}
                  <span className="text-[#10B981] font-extrabold not-italic drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                    hoy mismo
                  </span>
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Lleva tus estudios topográficos al estándar digital tridimensional interactivo. Compatible con proyectos de parcelación, desarrollo urbano e infraestructura vial.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-primary to-secondary text-black font-bold shadow-[0_0_15px_rgba(12,219,255,0.3)]" as={Link} href="/web/views/login">
                      Empezar ahora
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      as="a"
                      href="#contacto"
                      className="bg-transparent border-2 border-primary/45 text-white font-semibold hover:bg-primary/10 transition-all duration-300 shadow-[0_0_15px_rgba(12,219,255,0.1)] hover:border-primary"
                    >
                      Solicitar Información
                    </Button>
                  </motion.div>
                </div>
              </div>
              <div className="flex-1 flex justify-center w-full">
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  className="w-full h-[200px] rounded-2xl bg-gradient-to-tr from-gray-900/80 to-black border border-white/10 flex items-center justify-center relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-20 h-20 rounded-3xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shadow-[0_0_25px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing Section */}
        <div id="precios" className="w-full flex flex-col justify-center py-10 md:py-14">
          <div className="w-[90%] md:w-[70%] mx-auto pt-4 text-center">
            <h1 className="text-5xl font-bold mb-4 text-gradient">Planes</h1>
            <p className="text-gray-400 mb-2">Convierte tus espacios en modelos digitales detallados.</p>
            <p className="text-gray-400 mb-2">Ahorra tiempo y dinero.</p>
          </div>

          <div className="w-[90%] xl:w-[80%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 mb-16">
            {[
              {
                name: "Static",
                price: "$1.232.000",
                monthly: "$205.333",
                features: ["1 escaneo 3D único", "Calidad: 250.000 vertices", "Área: 500m² - 50.000m²"],
                highlight: false
              },
              {
                name: "Basic",
                price: "$2.432.000",
                monthly: "$405.333",
                features: ["1 escaneo 3D", "Actualización cada 2 meses", "Calidad: 250.000 vertices", "Área: 500m² - 50.000m²"],
                highlight: true
              },
              {
                name: "Plus",
                price: "$4.172.800",
                monthly: "$695.467",
                features: ["1 escaneo 3D", "Actualización cada 2 meses", "Calidad: 500.000 vertices", "Área: 50.000m² - 100.000m²", "Alcance: 250.000 views", "Visitas: 9.500"],
                highlight: false
              },
              {
                name: "Pro",
                price: "$6.228.480",
                monthly: "$1.038.080",
                features: ["1 escaneo 3D", "Actualización cada 2 meses", "Calidad: 750.000 vertices", "Área: 100.000m² - 200.000m²", "Alcance: 330.000 views", "Visitas: 12.000"],
                highlight: false
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`flex flex-col p-6 rounded-2xl border ${plan.highlight ? 'border-primary/60 shadow-[0_0_30px_rgba(12,219,255,0.25)]' : 'border-white/10'} glass-card glow-card-hover relative overflow-hidden`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
                  <p className="text-sm text-gray-400">6 meses</p>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold">{plan.price} <span className="text-sm font-normal">COP</span></h3>
                    <p className="text-xs text-gray-500 mt-1">{plan.monthly} COP por mes</p>
                  </div>
                </div>

                <div className="flex-grow mb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="text-primary w-4 h-4 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <div className="w-full text-center mb-4">
                    <p className="text-xs text-gray-400">
                      Empieza hoy y obtén un 20% de{" "}
                      <span className="text-primary font-bold underline">descuento</span>
                    </p>
                  </div>
                  <Button
                    as={Link}
                    href="/web/views/login"
                    className={`w-full font-bold ${plan.highlight ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    Contactar
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabla Title */}
          <div className="w-[90%] md:w-[70%] mx-auto pt-6 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gradient">Tabla de Precios</h1>
            <p className="text-gray-400">Compara detalladamente nuestros planes</p>
          </div>
          <div className="w-[90%] xl:w-[70%] h-[60%] mx-auto mt-[35px] mb-12">
            <TablePrices />
          </div>
        </div>

        <ContactSection />
        <Footer />
        <FloatingWhatsapp />
      </div>
    </div>
  );
}
