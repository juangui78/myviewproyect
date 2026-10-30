"use client";
import React, { useEffect, useState, Suspense } from "react";
import Navbar from "@/web/global_components/navbar/Navbar";
import Cards from "@/web/views/user/feed/components/Cards";
import FeedSkeleton from "@/web/views/user/feed/components/FeedSkeleton";
import style from "@/web/views/user/feed/styles/feed.module.css";
import {
  listOfflineProjects,
  onOfflineProjectsChange,
} from "@/web/global_components/pwa/offlineStore";

function OfflineFeedContent() {
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const saved = await listOfflineProjects();
      setProjects(saved);
      setLoaded(true);
    };
    load();
    const unsub = onOfflineProjectsChange(load);
    return () => unsub();
  }, []);

  if (!loaded) {
    return (
      <section className={`w-full bg-transparent ${style.section} h-auto min-h-screen`}>
        <FeedSkeleton />
      </section>
    );
  }

  return (
    <div className={`${style.fatherBoxes} min-h-[60vh]`}>
      <Cards
        proyects={projects}
        totalProyects={projects.length}
        offlineMode={true}
      />
    </div>
  );
}

export default function OfflinePage() {
  return (
    <div className="bg-[#02121B] bg-[url(/images/op11.webp)] bg-no-repeat bg-cover overflow-hidden h-[100dvh] flex flex-col">
      <div className="sticky top-0 z-50 shrink-0 bg-[#02121B]/80 backdrop-blur-md border-b border-white/5">
        <Navbar />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar">
        <Suspense
          fallback={
            <section className={`w-full bg-transparent ${style.section} h-auto min-h-screen`}>
              <FeedSkeleton />
            </section>
          }
        >
          <OfflineFeedContent />
        </Suspense>
      </div>
    </div>
  );
}
