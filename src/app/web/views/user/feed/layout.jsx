"use client"
import React, { Suspense } from "react";
import Navbar from "@/web/global_components/navbar/Navbar";

export default function RootLayout({ children }) {
  return (
    <>
      <div className="bg-[#02121B] bg-[url(/images/op11.webp)] ... bg-no-repeat bg-cover overflow-hidden h-full" >
        <div className="overflow-auto h-[100vh] scrollbar">
          <Navbar/>
          {children}
        </div>
      </div>
    </>
  );
}
