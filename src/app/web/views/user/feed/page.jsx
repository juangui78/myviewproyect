"use server";
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
        <CardsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}