"use client"
import React from "react";
import Navbar from "@/web/global_components/navbar/Navbar";

export default function RootLayout({ children }) {
  return (
    <div className="bg-[#02121B] bg-[url(/images/op11.webp)] ... bg-no-repeat bg-cover overflow-hidden h-[100dvh] flex flex-col">
      <div className="sticky top-0 z-50 shrink-0 bg-[#02121B]/80 backdrop-blur-md border-b border-white/5">
        <Navbar />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar">
        {children}
      </div>
    </div>
  );
}
