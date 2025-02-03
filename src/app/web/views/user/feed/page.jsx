'use client'

import React, { Suspense, useState, useEffect } from "react";
import Header from "./components/header";
import style from "./styles/feed.module.css";
import { useSearchParams } from "next/navigation";
import { BlocksShuffle3 } from "@/web/global_components/icons/BlocksShuffle3";
import dynamic from 'next/dynamic';

const Cards = dynamic(
  () => import("./components/cards"),
  { 
    ssr: false,
    loading: () => <div className="m-auto text-6xl"><BlocksShuffle3 className="text-white"/></div>
  }
);

function FeedContent() {
  const [isLoad, setLoading] = useState(true);
  const [key, setKey] = useState(Date.now());
  const searchParams = useSearchParams();
  
  const search = searchParams?.get('search');

  useEffect(() => {
    setKey(Date.now());
  }, [search]);

  const changeStatusLoad = () => setLoading(false);

  return (
    <>
      {!isLoad && <Header />}
      <div className={`${style.fatherBoxes} min-h-[60vh]...`}>
        <Cards key={key} search={search} changeStatus={changeStatusLoad} />
      </div>
    </>
  );
}

export default function Page() {
  return (
    <section className={`w-full bg-transparent ${style.section} h-auto min-h-screen`}>
      <Suspense fallback={<div className="m-auto text-6xl"><BlocksShuffle3 className="text-white"/></div>}>
        <FeedContent />
      </Suspense>
      <footer className="h-[20vh] bg-[#02121B] mt-[70px] bg-transparent">
        <div className="text-white"></div>
      </footer>
    </section>
  );
}