"use client"; // 🔹 Asegura que esta página solo se renderiza en el cliente

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "./components/header";
import style from "./styles/feed.module.css";
import { BlocksShuffle3 } from "@/web/global_components/icons/BlocksShuffle3";

// 🔹 Cargar dinámicamente `Cards` con soporte para `Suspense`
const Cards = dynamic(() => import("./components/cards"), { suspense: true });

export default function Page() {
  const [isLoad, setLoading] = useState(true);
  const [key, setKey] = useState(Date.now());
  const searchParams = useSearchParams(); // ✅ Ahora se ejecuta solo en el cliente

  const search = searchParams?.get("search");

  useEffect(() => {
    setKey(Date.now()); // ✅ Se actualiza cuando cambia `search`
  }, [search]);

  return (
    <section className={`w-full bg-transparent ${style.section} h-auto min-h-screen`}>
      {!isLoad && <Header />}
      <div className={`${style.fatherBoxes} min-h-[60vh] ... `}>
        <Suspense fallback={<div className="m-auto text-6xl"><BlocksShuffle3 className="text-white"/></div>}>
          <Cards key={key} search={search} changeStatus={() => setLoading(false)} />
        </Suspense>
      </div>
      <footer className="h-[20vh] bg-[#02121B] mt-[70px] bg-transparent">
        <div className="text-white"></div>
      </footer>
    </section>
  );
}
