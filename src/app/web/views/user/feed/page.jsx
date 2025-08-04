"use server"
import Header from "./components/header";
import CardsList from "./serverComponents/Cards.server";
import { BlocksShuffle3 } from "@/web/global_components/icons/BlocksShuffle3";
import { Suspense } from "react";
import style from "./styles/feed.module.css";

export default async function Page({  searchParams }) {

  return (
    <>
      <Suspense fallback={
        <section className={`w-full bg-transparent ${style.section} h-auto min-h-screen`}>
          <div className="m-auto text-6xl">
            <BlocksShuffle3 className="text-white" />
          </div>
        </section>
      }>
        <Header />
        <CardsList searchParams={searchParams} />
      </Suspense>
    </>
  )
}