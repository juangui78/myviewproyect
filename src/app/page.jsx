'use client'
import { Navbar, NavbarBrand, NavbarMenu, NavbarContent, NavbarItem, NavbarMenuItem, NavbarMenuToggle, Button, Image } from "@nextui-org/react";
import Link from "next/link";
import axios from "axios";
import style from './web/global_components/navbar/styles/navbar.module.css'

axios.defaults.baseURL = 'http://localhost:3000/';

export default function Home() {
  return (
    <div className="bg-[#02121B] bg-[url(/images/op11.webp)] ... bg-no-repeat bg-cover overflow-hidden h-full" >
      <div className="overflow-auto h-[100vh] scrollbar">
        <Navbar disableAnimation isBordered className={style.NavBar} position="static">
          <NavbarContent className="sm:hidden" justify="start">
            <NavbarMenuToggle className="text-white" />
          </NavbarContent>

          <NavbarContent className="sm:hidden pr-3" justify="center">
            <NavbarBrand>
              <Image src="/logos/completo-fullblanco.png" className="object-cover" alt="logo" width={150} height={150} />
            </NavbarBrand>
          </NavbarContent>

          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarBrand>
              <Image src="/logos/completo-fullblanco.png" className="object-cover" alt="logo" width={150} height={150} />
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
                color="default"
                variant="light"
                href="/web/views/login"
                className="text-white"
              >
                
                Iniciar Sesion
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color="primary" href="#" >
                Empezar ya
              </Button>
            </NavbarItem>
          </NavbarContent>

          <NavbarMenu>
            <NavbarMenuItem>
              <Link
                className="w-full text-white"
                href="#"
                size="lg"
              >
                Precios
              </Link>
            </NavbarMenuItem>
          </NavbarMenu>
        </Navbar>

        <div className="flex flex-col items-center justify-center  h-[50vh] w-[100%] mx-auto">
          <div className="w-[70%]">
            <h1 className="text-white text-4xl font-bold text-left italic">Transforma parcelaciones en modelos 3D precisos con fotogrametría avanzada.</h1>
            <h2 className="text-white text-lg text-left">Construye, planifica y gestiona tus proyectos de una forma más eficiente</h2>
            <Button color="primary" className="mt-6">
              Empezar ya
            </Button>
          </div>
        </div>

        <div className="w-[100%] h-[80vh] mx-auto flex justify-center bg-white ">
          <div className="w-[70%] h-[100%] grid grid-cols-2 gap-2 pt-10">
            <div className="h-[60vh] flex justify-center ">
              <Image src="/images/explore.png" isBlurred height={700} />
            </div>
            <div className="bg-white">
              <h1 className="font-bold text-3xl italic text-left">Escaneo 3D de Alta Precisión</h1>
              <p className="pt-6 text-lg">
                Captura cada detalle con precisión milimétrica gracias a nuestra tecnología
                de <strong>fotogrametría aérea </strong> mediante drones de última generación. Obtén modelos 3D realistas y detallados de terrenos,
                edificaciones, parcelaciones y entornos urbanos en tiempo récord.
              </p>
              <ul className="pt-6 list-disc list-inside">
                <li>Mapeo rápido y eficiente sin necesidad de mediciones manuales.</li>
                <li>Imágenes de alta resolución procesadas con algoritmos avanzados.</li>
                <li>Modelos 3D precisos para planificación, diseño y análisis.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-[100%] h-[60vh] mx-auto flex justify-center pt-20">
          <div className="w-[70%] h-[100%] grid grid-cols-2 gap-2 pt-10">
            <div className="">
              <h1 className="font-bold text-3xl italic text-left text-white">Evolución en el Tiempo: Modelos 3D con Registro Histórico</h1>
              <p className="pt-6 text-lg text-white">
                Visualiza la transformación de terrenos,
                edificaciones y parcelaciones a lo largo del tiempo con nuestra línea del tiempo interactiva.
                Accede a modelos 3D detallados de cada fecha y analiza los cambios con precisión.
              </p>
              <ul className="pt-6 list-disc list-inside text-white">
                <li><strong>Comparación temporal</strong> para evaluar progreso y modificaciones.</li>
                <li><strong>Acceso a versiones anteriores</strong> de cada modelo en 3D.</li>
                <li><strong>Seguimiento detallado</strong> de obras, desarrollos urbanos y cambios topográficos.</li>
              </ul>
            </div>
            <div className="text-white">
              AQUI VA UN VIDEO DEMOSTRANDOLO
            </div>
          </div>
        </div>

        <div className="w-[100%] bg-white h-[20vh] mx-auto flex justify-center">
          <div className="w-[70%]  pt-20 pb-20">
            <h1 className="font-bold text-3xl italic text-left">Aprovechate del marketing 3D</h1>
            <p className="pt-3 text-lg">
              Comparte tus modelos
              3D en redes sociales, páginas web y aplicaciones móviles para
              mostrar tus proyectos de forma interactiva y atractiva.
            </p>
          </div>
        </div>

        <div className="w-[100%] h-[60vh] mx-auto flex justify-center pt-20">
          <div className="w-[70%] h-[100%] grid grid-cols-2 gap-2 pt-10">
            <div className="">
              <h1 className="font-bold text-3xl italic text-left text-white">Precios</h1>
              <p className="pt-6 text-lg text-white">
                Almacena, organiza y
                comparte tus modelos 3D en la nube. Accede a tus proyectos desde
                cualquier lugar y dispositivo, y colabora con tu equipo en tiempo
                real.
              </p>
              <ul className="pt-6 list-disc list-inside text-white">
                <li><strong>Almacenamiento seguro</strong> en servidores de alta disponibilidad.</li>
                <li><strong>Colaboración en tiempo real</strong> con tu equipo de trabajo.</li>
                <li><strong>Acceso desde cualquier lugar</strong> y dispositivo.</li>
              </ul>
              </div>
              </div>
              </div>

      </div>
    </div>
  );
}

