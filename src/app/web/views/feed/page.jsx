'use client'
import React, { Suspense } from "react";
import Feed from "./components/cards";
import Loading from "./components/loadingCards";
import Header from "./components/header";
import style from "./styles/feed.module.css";
import { useSearchParams } from "next/navigation";

const PageContent = () => {
  const searchParams = useSearchParams();
  const search = searchParams?.get('search');
  const options = searchParams?.get('options');

  return (
    <section className={`w-full ${style.section}`}>
      <Header/> 
        <div className={style.fatherBoxes}>
        <Suspense fallback={<div>cargando...</div>}>
            <Feed search={search} options={options} />
        </Suspense>
        </div>
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
