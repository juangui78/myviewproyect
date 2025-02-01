'use client'
import React, { Suspense, lazy, useState, useEffect } from "react";
import Header from "./components/header";
import style from "./styles/feed.module.css";
import { useSearchParams } from "next/navigation";
import { BlocksShuffle3 } from "@/web/global_components/icons/BlocksShuffle3";

const Cards = lazy(() => import("./components/cards"))

export default function Page() {
  const [isLoad, setLoading] = useState(true);
  const [key, setKey] = useState(Date.now()); 
  const searchParams = useSearchParams();
  
  const search = searchParams?.get('search');

  useEffect(() => {
    setKey(Date.now()); 
  }, [search]);
 
   const changeStatusLoad = () => setLoading(false)
   
   return (
     <section className={`w-full  bg-transparent ${style.section} h-auto min-h-screen`}>
        {!isLoad && <Header/> } 
         <div className={`${style.fatherBoxes}  min-h-[60vh] ... `}>
            <Suspense fallback={<div className="m-auto text-6xl"><BlocksShuffle3 className="text-white "/></div>}>
                <Cards key={key} search={search}  changeStatus={changeStatusLoad} />
            </Suspense>
         </div>
         <footer className="h-[20vh] bg-[#02121B] mt-[70px] bg-transparent">
          <div className="text-white"></div>
         </footer>
     </section>
   );
}
