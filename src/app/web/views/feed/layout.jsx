"use client"
import React, { Suspense } from "react";
import Navbar from "@/web/global_components/navbar/Navbar";

export default function RootLayout({ children }) {
  return (
    <>
      <Navbar/>
      {children}
    </>
  );
}
