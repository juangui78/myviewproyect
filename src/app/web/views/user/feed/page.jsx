'use client'
import React, { Suspense } from "react";
import Feed from "./components/cards";
import Header from "./components/header";
import style from "./styles/feed.module.css";
import { useSearchParams } from "next/navigation";

const PageContent = () => {
  const searchParams = useSearchParams();
  const search = searchParams?.get('search');
  const options = searchParams?.get('options');


  return (
    <section className={`w-full  bg-transparent ${style.section} h-auto min-h-screen`}>
      <Header/> 
        <div className={`${style.fatherBoxes}  min-h-[60vh] ... `}>
        <Suspense fallback={<div>cargando...</div>}>
            <Feed search={search} options={options} />
        </Suspense>
        </div>
        <footer className="h-[20vh] bg-[#02121B] mt-[70px] bg-transparent">
         <div className="text-white">hola</div>
        </footer>
    </section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PageContent />
    </Suspense>
  );
}
