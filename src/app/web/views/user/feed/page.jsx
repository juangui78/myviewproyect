"use server"
import Header from "./components/header";
import CardsList from "./serverComponents/Cards.server";
import FeedSkeleton from "./components/FeedSkeleton";
import { Suspense } from "react";
import style from "./styles/feed.module.css";

export default async function Page({ searchParams }) {
  return (
    <>
      <Suspense fallback={
        <section className={`w-full bg-transparent ${style.section} h-auto min-h-screen`}>
          <FeedSkeleton />
        </section>
      }>
        <Header />
        <CardsList searchParams={searchParams} />
      </Suspense>
    </>
  )
}