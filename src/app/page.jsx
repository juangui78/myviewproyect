'use client'
import Image from "next/image";
import {Card, CardHeader, CardBody} from "@nextui-org/react";
import {Skeleton} from "@nextui-org/react";
import {Button, ButtonGroup} from "@nextui-org/react";
import Link from "next/link";
import axios from "axios";

axios.defaults.baseURL = 'http://localhost:3000/';

export default function Home() {
  return (
    <main className="flex flex-col items-center box-border justify-between w-full min-h-screen p-4 max-w-[md] mt-[-40px] transform scale-90">  
      <div className="flex w-full gap-4 box-border">

        <div className="flex md:flex-col md:min-w-[50%] gap-1">

          <div className="flex flex-col min-h-[50vh]">
            <div className="p-2" style={{ zIndex: 10 }}>
              <div className=" px-8 py-12 w-[100%] min-h-[50vh] rounded-2xl flex flex-col justify-center items-center bg-gradient-to-tr from-orange-100 to-slate-50 bg-white hover:bg-gradient-to-tr hover:from-orange-200 hover:to-gray-100 hover:shadow-lg text-[#81582e] hover:text-[#614426] transition-transform duration-500 transform hover:scale-110  box-border " >
                <div className="flex items-center flex-col gap-2">
                  <div>
                    <h1 className=" text-6xl font-bold">myView_</h1>
                    <h2>testing</h2>
                  </div>

                  <div className="flex items-center flex-col">
                    {/* <h2 className=" font-semibold uppercase text-4xl  ">Observa tus creaciones como nunca</h2> */}
                    <div className="flex gap-6 p-5">
                        <Link href='/web/views/user/feed'>
                        <Button color="warning" size="lg" variant="shadow" radius="full" className=" font-semibold text-white bg-gradient-to-tr from-yellow-700 to-orange-400">Empieza Ya</Button>
                        </Link>
                        
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

            <div className="flex min-h-[47.5vh] gap-5 p-2">
              <div className=" px-8 py-12 w-[50%] rounded-2xl flex items-start bg-gradient-to-tr from-orange-200 to-gray-200 text-white hover:bg-gradient-to-tr hover:from-orange-300 hover:to-gray-100 hover:shadow-lg box-border transition-transform duration-300 transform hover:scale-105">
                <h2 className=" font-semibold text-6xl">prueba</h2>
              </div>
              <div className=" px-8 py-12 w-[50%] rounded-2xl flex items-start bg-gradient-to-tr from-orange-100 to-gray-300 text-white hover:shadow-lg hover:bg-gradient-to-tr hover:from-orange-100 hover:to-gray-300 box-border transition-transform duration-300 transform hover:scale-105">
                <h2 className=" font-semibold text-6xl">prueba</h2>
              </div>
            </div>

        </div>
          

        <div className="min-w-[50%] flex justify-center p-2" style={{ minHeight: 'calc(100vh - 2rem)' }}>
          <div className=" px-8 py-12 w-[100%] rounded-2xl flex justify-center items-center bg-gradient-to-tr from-orange-200 to-gray-100 text-white  box-border transition-transform duration-500 transform hover:scale-105 hover:shadow-lg">
            
          </div>
        </div>

      </div>



      <div className="h-min-[100vh] w-full flex justify-center">
        <div className="pt-14 justify-center flex flex-col items-start gap-8">
          <h2 className="text-5xl font-bold text-[#614426] italic">¿Quienes somos?</h2>
          <div className="flex flex-col gap-4 w-[50%]">
            <p className="text-md">Somos MyView_ una empresa especializada en fotogrametría de estructuras. Nos dedicamos apasionadamente a capturar la esencia de cada estructura mediante tecnología avanzada de imágenes. Utilizamos técnicas de vanguardia para crear modelos precisos en 3D que revelan perspectivas únicas y detalladas.</p>

            <p className="text-md">Nuestro objetivo es transformar la manera en que se visualizan las estructuras, ofreciendo una comprensión profunda y accesible de cada detalle. Ya sea para la inspección, documentación o presentación visual, estamos comprometidos con la excelencia y la innovación en cada proyecto.</p>

            <p className="text-md">Descubre cómo MyView_ puede ampliar tu visión con nuestra experiencia en fotogrametría. Con MyView_ cada estructura cuenta su propia historia.</p>

          </div>
            
        </div>
      </div>
    </main>
  );
}

