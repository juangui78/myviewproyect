import React from "react";

export function ProjectCardSkeleton() {
  return (
    <div className="bg-[#0D1520]/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex flex-col xl:flex-row rounded-[28px] overflow-hidden animate-pulse">
      {/* Left Column: Image Skeleton */}
      <div className="w-full xl:w-[50%] p-4 flex flex-col">
        <div className="relative w-full h-[240px] xl:h-full min-h-[220px] rounded-[22px] bg-white/5 border border-white/10 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#0CDBFF] animate-spin" />
        </div>
      </div>

      {/* Right Column: Info & Actions Skeleton */}
      <div className="w-full xl:w-[50%] p-5 xl:py-5 xl:pr-5 xl:pl-2 flex flex-col justify-between gap-5">
        <div>
          <div className="h-4 w-28 bg-white/10 rounded-md mb-3" />
          <div className="h-7 w-3/4 bg-white/10 rounded-xl mb-2" />
          <div className="h-3 w-5/6 bg-white/5 rounded-md" />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="h-11 w-full bg-white/10 rounded-2xl" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-white/5 rounded-xl border border-white/5" />
            <div className="h-10 bg-white/5 rounded-xl border border-white/5" />
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex justify-between">
          <div className="h-3 w-20 bg-white/5 rounded" />
          <div className="h-3 w-28 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function FeedSkeleton() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Unified Command & Header Bar Skeleton */}
      <div className="w-[95%] xl:w-[85%] 2xl:w-[75%] max-w-[1800px] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-6 mb-3 px-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-8 w-36 bg-white/10 rounded-xl" />
          <div className="h-6 w-10 bg-white/10 rounded-full" />
        </div>
        <div className="h-11 w-full sm:w-[380px] bg-[#121B26]/80 rounded-2xl border border-white/5" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-[95%] xl:w-[85%] 2xl:w-[75%] max-w-[1800px] mt-5 px-4 mb-[80px]">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </div>
  );
}
