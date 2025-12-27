"use client";
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
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import style from "./web/global_components/navbar/styles/navbar.module.css";
import Check from "./web/global_components/icons/CheckIcon";
import Whatsapp from "./web/global_components/icons/Whatsapp";

import SectionOne from "./sectionOne.client";
import TablePrices from "./tablePrices";
import InteractiveBlobs from "./InteractiveBlobs.client";
import Footer from "./web/global_components/footer/Footer";

axios.defaults.baseURL = "http://localhost:3000/";

export default function Home() {
  return (
    <div className="bg-[#02121B] bg-[url(/images/op11.webp)] bg-no-repeat bg-cover overflow-hidden h-full min-h-screen text-foreground relative">
      <InteractiveBlobs />

      <div className="overflow-auto h-[100vh] scrollbar relative z-10">
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
              <Image
                src="/logos/completo-fullblanco.png"
                className="object-cover"
                alt="logo"
                width={150}
                height={150}
              />
            </NavbarBrand>
          </NavbarContent>

          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarBrand>
              <Image
                src="/logos/completo-fullblanco.png"
                className="object-cover"
                alt="logo"
                width={150}
                height={150}
              />
            </NavbarBrand>
            <NavbarItem>
              <Link className="text-white" href="#precios">
                Precios
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

          <NavbarMenu>
            <NavbarMenuItem>
              <Link className="w-full text-white" href="#precios" size="lg">
                Precios
              </Link>
            </NavbarMenuItem>

          </NavbarMenu>
        </Navbar>

        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full mx-auto relative overflow-hidden">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.3
                }
              }
            }}
            className="w-[80%] max-w-4xl text-center z-10"
          >
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter"
            >
              Transforma parcelaciones en <span className="text-gradient">modelos 3D</span>
            </motion.h1>
            <motion.h2
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto"
            >
              Fotogrametría avanzada para construir, planificar y gestionar proyectos con eficiencia del futuro.
            </motion.h2>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 }
              }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-black font-bold shadow-lg shadow-primary/50"
              >
                Empezar ya
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* sección dos del landing con framer motion */}
        <SectionOne />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-[100%] min-h-[75vh] mx-auto flex justify-center items-center my-20"
        >
          <div className="w-[90%] md:w-[70%] grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              className="glass-card p-8 rounded-2xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 className="font-bold text-3xl italic text-left bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6">
                Evolución en el Tiempo: <span className="text-primary not-italic">Modelos 3D Históricos</span>
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
              className="relative aspect-video w-full rounded-2xl overflow-hidden glass-card flex items-center justify-center border border-white/10"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-secondary to-primary opacity-20 blur-2xl rounded-full"></div>
              <div className="z-10 text-center p-6">
                <span className="text-6xl mb-4 block">📼</span>
                <p className="text-gray-400 text-sm">VIDEO DEMOSTRACION</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-[100%] min-h-[25vh] mx-auto flex justify-center items-center my-20"
        >
          <div className="w-[90%] md:w-[70%] glass-card p-10 rounded-3xl relative overflow-hidden bg-gradient-to-br from-white/5 to-white/0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h1 className="font-bold text-4xl text-left bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
                  Aprovéchate del <span className="text-primary">marketing 3D</span>
                </h1>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Comparte tus modelos 3D en redes sociales, páginas web y
                  aplicaciones móviles. <span className="text-white font-medium">Visualización interactiva</span> que cautiva a tus clientes desde el primer momento.
                </p>
                <div className="mt-6 flex gap-4">
                  <Button color="primary" variant="shadow" className="font-bold" as={Link} href="/web/views/login">
                    Empezar ahora
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                {/* Placeholder for a marketing icon or graphic if available, reusing existing image style or leaving as abstract 3D element */}
                <div className="w-full h-[200px] rounded-2xl bg-gradient-to-tr from-gray-900 to-black border border-white/10 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🚀</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing Section Refactored */}
        <div id="precios" className="w-full flex flex-col justify-center my-20">
          <div className="w-[90%] md:w-[70%] mx-auto pt-[80px] text-center">
            <h1 className="text-5xl font-bold mb-4 text-gradient">Planes</h1>
            <p className="text-gray-400 mb-2">Convierte tus espacios en modelos digitales detallados.</p>
            <p className="text-gray-400 mb-2">Ahorra tiempo y dinero.</p>
          </div>

          <div className="w-[90%] xl:w-[80%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-[60px] mb-[100px]">
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
                whileHover={{ y: -10 }}
                className={`flex flex-col p-6 rounded-2xl border ${plan.highlight ? 'border-primary shadow-[0_0_30px_rgba(0,240,255,0.3)]' : 'border-white/10'} glass-card relative overflow-hidden`}
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
                    className={`w-full ${plan.highlight ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    Contactar
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabla Title */}
          <div className="w-[90%] md:w-[70%] mx-auto pt-[40px] text-center">
            <h1 className="text-4xl font-bold mb-4 text-gradient">Tabla de Precios</h1>
            <p className="text-gray-400">Compara detalladamente nuestros planes</p>
          </div>
          <div className="w-[90%] xl:w-[70%] h-[60%] mx-auto mt-[35px] mb-[100px]">
            <TablePrices />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
