import React from "react";

export function ProjectCardSkeleton() {
  return (
    <div className="bg-[#1A1F26]/60 backdrop-blur-xl border border-white/10 shadow-2xl relative flex flex-col min-h-[400px] w-full rounded-[32px] overflow-hidden p-5 flex-col lg:flex-row gap-6 items-stretch animate-pulse">
      {/* Left Column: Image Box Skeleton */}
      <div className="w-full lg:w-[55%] min-h-[250px] rounded-[24px] bg-white/5 border border-white/10 relative overflow-hidden flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-[#0CDBFF] animate-spin" />
      </div>

      {/* Right Column: Info & Actions Skeleton */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between py-2 gap-4">
        <div>
          {/* Header Title Skeleton */}
          <div className="h-7 w-3/4 bg-white/10 rounded-xl mb-2" />
          <div className="h-3 w-1/3 bg-white/5 rounded-md mb-6" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col gap-3">
          <div className="h-11 w-full bg-white/5 rounded-2xl border border-white/5" />
          <div className="h-11 w-full bg-white/5 rounded-2xl border border-white/5" />
          <div className="h-11 w-full bg-white/5 rounded-2xl border border-white/5" />
        </div>
      </div>
    </div>
  );
}

export default function FeedSkeleton() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Total Counter Skeleton */}
      <div className="w-[95%] xl:w-[85%] 2xl:w-[75%] max-w-[1800px] flex justify-between items-center mt-2 px-4">
        <div className="h-9 w-48 bg-[#1A1F26]/60 backdrop-blur-xl border border-white/10 rounded-2xl animate-pulse" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-[95%] xl:w-[85%] 2xl:w-[75%] max-w-[1800px] mt-6 px-4 mb-[80px]">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </div>
  );
}
