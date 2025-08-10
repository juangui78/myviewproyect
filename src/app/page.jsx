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
import Link from "next/link";
import axios from "axios";
import style from "./web/global_components/navbar/styles/navbar.module.css";
import Check from "./web/global_components/icons/CheckIcon";
import Whatsapp from "./web/global_components/icons/Whatsapp";

import SectionOne from "./sectionOne.client";
import TablePrices from "./tablePrices";

axios.defaults.baseURL = "http://localhost:3000/";

export default function Home() {
  return (
    <div className="bg-[#02121B] bg-[url(/images/op11.webp)] ... bg-no-repeat bg-cover overflow-hidden h-full">
      <div className="overflow-auto h-[100vh] scrollbar">
        <Navbar
          disableAnimation
          isBordered
          className={style.NavBar}
          position="static"
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
              <Link className="text-white" href="#">
                Precios
              </Link>
            </NavbarItem>
          </NavbarContent>

          <NavbarContent justify="end">
            <NavbarItem className="hidden lg:flex">
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
              <Link className="w-full text-white" href="#" size="lg">
                Precios
              </Link>
            </NavbarMenuItem>
          </NavbarMenu>
        </Navbar>

        <div className="flex flex-col items-center justify-center min-h-[50vh] max-h-[100vh] w-[100%] mx-auto">
          <div className="w-[70%]">
            <h1 className="text-white text-4xl font-bold text-left">
              Transforma parcelaciones en modelos 3D precisos con fotogrametría
              avanzada.
            </h1>
            <h2 className="text-white text-lg text-left">
              Construye, planifica y gestiona tus proyectos de una forma más
              eficiente
            </h2>
            <Button color="primary" className="mt-6">
              Empezar ya
            </Button>
          </div>
        </div>

        {/* sección dos del landing con framer motion */}
        <SectionOne />

        <div className="w-[100%] min-h-[75vh] max-h-[100vh] mx-auto flex justify-center item-center">
          <div className="w-[70%] grid grid-cols-2 gap-2">
            <div className="">
              <h1 className="font-bold text-3xl italic text-left text-white">
                Evolución en el Tiempo: Modelos 3D con Registro Histórico
              </h1>
              <p className="pt-6 text-lg text-white">
                Visualiza la transformación de terrenos, edificaciones y
                parcelaciones a lo largo del tiempo con nuestra línea del tiempo
                interactiva. Accede a modelos 3D detallados de cada fecha y
                analiza los cambios con precisión.
              </p>
              <ul className="pt-6 list-disc list-inside text-white">
                <li>
                  <strong>Comparación temporal</strong> para evaluar progreso y
                  modificaciones.
                </li>
                <li>
                  <strong>Acceso a versiones anteriores</strong> de cada modelo
                  en 3D.
                </li>
                <li>
                  <strong>Seguimiento detallado</strong> de obras, desarrollos
                  urbanos y cambios topográficos.
                </li>
              </ul>
            </div>
            <div className="text-white">AQUI VA UN VIDEO DEMOSTRANDOLO</div>
          </div>
        </div>

        <div className="w-[100%] bg-white min-h-[25vh] max-h-[30vh] mx-auto flex justify-center items-center">
          <div className="w-[70%] h-full flex items-center">
            <div>
              <h1 className="font-bold text-3xl text-left">
                Aprovechate del marketing 3D
              </h1>
              <p className="pt-2 text-lg">
                Comparte tus modelos 3D en redes sociales, páginas web y
                aplicaciones móviles para mostrar tus proyectos de forma
                interactiva y atractiva.
              </p>
            </div>
          </div>
        </div>

        <div className="w-[100%] h-[100vh] flex flex-col justify-center mt-20 mb-20">
          <div className="w-[70%] mx-auto pt-[80px]">
            <div className="w-full">
              <h1 className="text-white text-5xl font-bold text-center underline">
                Planes
              </h1>
            </div>
            <div className="w-full p-3">
              <p className="text-white text-center">
                Convierte tus espacios en modelos digitales detallados con
                nuestros planes.
              </p>
              <p className="text-white text-center">
                Ahorra tiempo y dinero a la hora de vender.
              </p>
              <p className="text-white text-center">
                Paga solo por lo que necesites.
              </p>
            </div>
          </div>

          <div className="w-[70%] h-[60%] grid grid-cols-4 gap-x-8 mt-[80px] mb-[100px] mx-auto">
            <div className="col-span-1 bg-white rounded-medium  h-[100%] ...">
              <div className="flex justify-center p-2 flex-col items-center">
                <h2 className="text-2xl font-medium">Static</h2>
                <p className="text-sm">6 meses</p>
              </div>

              <div className="mt-3 mb-3">
                <div className="flex justify-center">
                  <h2>$1.232.000 COP</h2>
                </div>
                <div className="flex justify-center">
                  <p>$205.333 COP por mes</p>
                </div>
              </div>

              <div className="p-4 h-[39%]">
                <ul className="text-sm">
                  <li className="flex gap-2 items-center">
                    <Check /> 1 escaneo 3D único
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check />
                    Calidad: 250.000 vertices{" "}
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check />
                    Área: 500m² - 50.000m²{" "}
                  </li>
                  <li className="flex gap-2 items-center text-white">
                    ----------------------------------
                  </li>
                </ul>
              </div>

              <div className="h-[1px] bg-gray-300"></div>

              <div className="w-full">
                <p className="p-2 text-center font-medium">
                  Empieza hoy y obtén un 20% de{" "}
                  <strong className="text-[#0CDBFF] underline text-lg">
                    descuento
                  </strong>
                </p>
              </div>

              <div className="flex flex-col justify-center pb-[25px] gap-5 items-center">
                <Button
                  className="w-[50%] mt-[25px]"
                  color="primary"
                  as={Link}
                  href="/web/views/login"
                >
                  Contactar
                </Button>
              </div>
            </div>

            <div className="col-span-1 bg-white rounded-medium  h-[100%] ...">
              <div className="flex justify-center p-2 flex-col items-center">
                <h2 className="text-2xl font-medium">Basic</h2>
                <p className="text-sm">6 meses</p>
              </div>

              <div className="mt-3 mb-3">
                <div className="flex justify-center">
                  <h2>$2.432.000 COP</h2>
                </div>
                <div className="flex justify-center">
                  <p>$405.333 COP por mes</p>
                </div>
              </div>

              <div className="p-4 h-[39%]">
                <ul className="text-sm">
                  <li className="flex gap-2 items-center">
                    <Check /> 1 escaneo 3D{" "}
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check /> Actualización cada 2 meses
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check />
                    Calidad: 250.000 vertices{" "}
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check />
                    Área: 500m² - 50.000m²{" "}
                  </li>
                </ul>
              </div>

              <div className="h-[1px] bg-gray-300"></div>

              <div className="w-full">
                <p className="p-2 text-center font-medium">
                  Empieza hoy y obtén un 20% de{" "}
                  <strong className="text-[#0CDBFF] underline text-lg">
                    descuento
                  </strong>
                </p>
              </div>

              <div className="flex flex-col justify-center pb-[25px] gap-5 items-center">
                <Button
                  className="w-[50%] mt-[25px]"
                  color="primary"
                  as={Link}
                  href="/web/views/login"
                >
                  Contactar
                </Button>
              </div>
            </div>

            <div className="col-span-1 bg-white rounded-medium  h-[100%] ...">
              <div className="flex justify-center p-2 flex-col items-center">
                <h2 className="text-2xl font-medium">Plus</h2>
                <p className="text-sm">6 meses</p>
              </div>

              <div className="mt-3 mb-3">
                <div className="flex justify-center">
                  <h2>$4.172.800 COP</h2>
                </div>
                <div className="flex justify-center">
                  <p>$695.467 COP por mes</p>
                </div>
              </div>

              <div className="p-4 h-[39%]">
                <ul className="text-sm">
                  <li className="flex gap-2 items-center">
                    <Check /> 1 escaneo 3D{" "}
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check /> Actualización cada 2 meses
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check />
                    Calidad: 500.000 vertices{" "}
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check />
                    Área: 50.000m² - 100.000m²{" "}
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check />
                    Alcance: 250.000 views{" "}
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check />
                    Visitas al modelo: 9.500
                  </li>
                </ul>
              </div>

              <div className="h-[1px] bg-gray-300"></div>

              <div className="w-full">
                <p className="p-2 text-center font-medium">
                  Empieza hoy y obtén un 20% de{" "}
                  <strong className="text-[#0CDBFF] underline text-lg">
                    descuento
                  </strong>
                </p>
              </div>

              <div className="flex flex-col justify-center pb-[25px] gap-5 items-center">
                <Button
                  className="w-[50%] mt-[25px]"
                  color="primary"
                  as={Link}
                  href="/web/views/login"
                >
                  Contactar
                </Button>
              </div>
            </div>

            <div className="col-span-1 bg-white rounded-medium  h-[100%] ...">
              <div className="flex justify-center p-2 flex-col items-center">
                <h2 className="text-2xl font-medium">Pro</h2>
                <p className="text-sm">6 meses</p>
              </div>

              <div className="mt-3 mb-3">
                <div className="flex justify-center">
                  <h2>$6.228.480 COP</h2>
                </div>
                <div className="flex justify-center">
                  <p>$1.038.080 COP por mes</p>
                </div>
              </div>

              <div className="p-4 h-[39%]">
                <ul className="text-sm">
                  <li className="flex gap-2 items-center">
                    <Check /> 1 escaneo 3D{" "}
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check /> Actualización cada 2 meses
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check />
                    Calidad: 750.000 vertices{" "}
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check />
                    Área: 100.000m² - 200.000m²{" "}
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check />
                    Alcance: 330.000 views{" "}
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check />
                    Visitas al modelo: 12.000
                  </li>
                </ul>
              </div>

              <div className="h-[1px] bg-gray-300"></div>

              <div className="w-full">
                <p className="p-2 text-center font-medium">
                  Empieza hoy y obtén un 20% de{" "}
                  <strong className="text-[#0CDBFF] underline text-lg">
                    descuento
                  </strong>
                </p>
              </div>

              <div className="flex flex-col justify-center pb-[25px] gap-5 items-center">
                <Button
                  className="w-[50%] mt-[25px]"
                  color="primary"
                  as={Link}
                  href="/web/views/login"
                >
                  Contactar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* tabla */}
        <div className="w-[100%] h-[100vh] flex flex-col justify-center mt-20 mb-20">
          <div className="w-[70%] mx-auto pt-[80px]">
            <div className="w-full">
              <h1 className="text-white text-5xl font-bold text-center underline">
                Tabla de Precios
              </h1>
            </div>
            <div className="w-full p-3">
              <p className="text-white text-center">
                Compara nuestros planes y elige el que mejor se adapte a tus
                necesidades.
              </p>
            </div>
          </div>

          <div className="w-[70%] h-[60%] mx-auto mt-[35px] mb-[100px]">
              <TablePrices/>
          </div>
        </div>
      </div>
    </div>
  );
}
