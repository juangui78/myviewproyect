"use client";
import { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import style from "./web/global_components/navbar/styles/navbar.module.css";
import Whatsapp from "./web/global_components/icons/Whatsapp";

import SectionOne from "./sectionOne.client";
import InteractiveBlobs from "./InteractiveBlobs.client";
import ContactSection from "./ContactSection.client";
import Footer from "./web/global_components/footer/Footer";

axios.defaults.baseURL = "http://localhost:3000/";

const words = ["parcelas", "terrenos", "obras"];

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

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
              <Link className="text-white font-medium hover:text-primary transition-colors" href="/inmobiliarias">
                Inmobiliarias
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link className="text-white font-medium hover:text-primary transition-colors" href="/ingenieria-topografia">
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
              <Link className="w-full text-white py-2 border-b border-white/5 hover:text-primary transition-colors" href="/inmobiliarias" size="lg">
                Inmobiliarias
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link className="w-full text-white py-2 hover:text-primary transition-colors" href="/ingenieria-topografia" size="lg">
                Ingeniería y Topografía
              </Link>
            </NavbarMenuItem>
          </NavbarMenu>
        </Navbar>

        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 md:py-20 w-full mx-auto relative overflow-hidden">
          {/* Video de fondo con baja opacidad en el header (hero)
          <div 
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-30"
            style={{
              maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 100%)"
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/videos/landing3.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#02121B]/30 to-[#02121B]" />
          </div>
          */}

          <div className="w-[90%] max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-12 z-10 text-center lg:text-left">
            {/* Column 1: Text & Actions */}
            <div className="w-full lg:w-[40%] flex flex-col items-center lg:items-start">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tighter leading-tight flex flex-wrap justify-center lg:justify-start items-center gap-x-3 gap-y-2">
                <span className="text-white">Transforma</span>
                <span className="relative inline-flex justify-center lg:justify-start items-center h-[1.2em] overflow-hidden">
                  <span className="invisible pointer-events-none select-none">terrenos</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="absolute text-gradient text-glow-animated left-0 right-0 text-center lg:text-left pl-0 pr-2"
                    >
                      {words[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="inline-flex items-center gap-x-3">
                  <span className="text-white">en</span>
                  <span className="text-gradient text-glow-animated">modelos 3D</span>
                </span>
              </h1>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl"
              >
                Fotogrametría avanzada para construir, planificar y gestionar proyectos con eficiencia del futuro.
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap justify-center lg:justify-start gap-4 mt-2"
              >
                {/* <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    as={Link}
                    href="/web/views/login"
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary text-black font-bold shadow-[0_0_20px_rgba(12,219,255,0.3)] hover:shadow-[0_0_35px_rgba(12,219,255,0.6)] transition-all duration-300 border border-primary/20"
                  >
                    Empezar ya
                  </Button>
                </motion.div> */}
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
            </div>

            {/* Column 2: Showcase Video Card */}
            <div className="w-full lg:w-[60%] max-w-xl lg:max-w-4xl">
              <motion.div
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] aspect-video relative group bg-[#02121B]"
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                >
                  <source src="/videos/landing3.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Servicios - Niche Navigation Cards */}
        <div className="w-full py-10 md:py-14">
          <div className="w-[90%] md:w-[70%] mx-auto text-center mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl font-bold mb-4 text-gradient"
            >
              Nuestros Servicios
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 max-w-2xl mx-auto"
            >
              Soluciones especializadas de fotogrametría y modelado 3D adaptadas a tu industria
            </motion.p>
          </div>
          <div className="w-[90%] md:w-[70%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inmobiliarias Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="glass-card glow-card-hover p-8 rounded-3xl border border-white/10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-all duration-700"></div>
              <span className="text-5xl mb-6 block select-none">🏡</span>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Inmobiliarias</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Vende lotes y proyectos más rápido con recorridos virtuales 3D interactivos. Atrae clientes internacionales y diferénciate con marketing inmersivo.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                  Visitas virtuales 24/7
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0"></span>
                  Captación de clientes internacionales
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                  Marketing inmobiliario 3D
                </li>
              </ul>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button as={Link} href="/inmobiliarias" className="bg-gradient-to-r from-primary to-secondary text-black font-bold shadow-[0_0_15px_rgba(12,219,255,0.3)]">
                  Ver planes y soluciones →
                </Button>
              </motion.div>
            </motion.div>

            {/* Ingeniería y Topografía Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              whileHover={{ y: -8 }}
              className="glass-card glow-card-hover p-8 rounded-3xl border border-white/10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-secondary/20 transition-all duration-700"></div>
              <span className="text-5xl mb-6 block select-none">📐</span>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Ingeniería y Topografía</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Levantamientos aéreos de alta precisión con fotogrametría avanzada. Genera curvas de nivel, modelos DEM y exporta a CAD/GIS.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                  Exportación CAD/GIS compatible
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0"></span>
                  Cálculos volumétricos precisos
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                  Modelos de elevación (DEM)
                </li>
              </ul>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button as={Link} href="/ingenieria-topografia" className="bg-gradient-to-r from-primary to-secondary text-black font-bold shadow-[0_0_15px_rgba(12,219,255,0.3)]">
                  Ver planes y soluciones →
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* sección dos del landing con framer motion */}
        <SectionOne />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full py-10 md:py-14 mx-auto flex justify-center items-center"
        >
          <div className="w-[90%] md:w-[70%] grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              className="glass-card glow-card-hover p-8 rounded-2xl"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="font-bold text-3xl italic text-left bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6">
                Evolución en el Tiempo: <span className="text-primary not-italic text-glow-animated">Modelos 3D Históricos</span>
              </h1>
              <p className="pt-6 text-lg text-gray-300 leading-relaxed">
                Visualiza la transformación de terrenos, edificaciones y
                parcelaciones a lo largo del tiempo con nuestra línea del tiempo
                interactiva. Accede a modelos 3D detallados de cada fecha y
                analiza los cambios con precisión.
              </p>
              <ul className="pt-6 space-y-3 text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <strong>Comparación temporal</strong> para evaluar progreso.
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  <strong>Acceso a versiones anteriores</strong> de cada modelo.
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <strong>Seguimiento detallado</strong> de obras y cambios.
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="relative aspect-video w-full rounded-2xl overflow-hidden glass-card glow-card-hover flex items-center justify-center border border-white/10"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-secondary to-primary opacity-20 blur-2xl rounded-full"></div>
              <div className="z-10 text-center p-6">
                <span className="text-6xl mb-4 block select-none">📼</span>
                <p className="text-gray-400 text-sm font-semibold tracking-wider">VIDEO DEMOSTRACION</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

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
                <h1 className="font-bold text-4xl text-left bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
                  Aprovéchate del <span className="text-primary text-glow-animated">marketing 3D</span>
                </h1>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Comparte tus modelos 3D en redes sociales, páginas web y
                  aplicaciones móviles. <span className="text-white font-medium">Visualización interactiva</span> que cautiva a tus clientes desde el primer momento.
                </p>
              </div>
              <div className="flex-1 flex justify-center w-full">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="w-full h-[200px] rounded-2xl bg-gradient-to-tr from-gray-900/80 to-black border border-white/10 flex items-center justify-center relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-500 select-none">🚀</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
