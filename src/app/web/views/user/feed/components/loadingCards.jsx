import { Card, Skeleton } from "@nextui-org/react";
import style from "../styles/feed.module.css";

export default function Loading(){
  return (
    <>
    <div className={`mx-8 .. rounded-md ${style.cards}`}>
      <Card radius="lg" className="border-none">
        <Skeleton className={`rounded-lg ${style.skeleton}`}>
          <div className="rounded-lg bg-default-300"></div>
        </Skeleton>
        <div className="space-y-3">
          <Skeleton className={`w-4/5 rounded-lg ${style.skeletonLow}`}>
            <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
          </Skeleton>
        </div>
      </Card>
    </div>
    <div className={`mx-8 .. rounded-md ${style.cards}`}>
      <Card radius="lg" className="border-none">
        <Skeleton className={`rounded-lg ${style.skeleton}`}>
          <div className="rounded-lg bg-default-300"></div>
        </Skeleton>
        <div className="space-y-3">
          <Skeleton className={`w-4/5 rounded-lg ${style.skeletonLow}`}>
            <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
          </Skeleton>
        </div>
      </Card>
    </div>
    <div className={`mx-8 .. rounded-md ${style.cards}`}>
      <Card radius="lg" className="border-none">
        <Skeleton className={`rounded-lg ${style.skeleton}`}>
          <div className="rounded-lg bg-default-300"></div>
        </Skeleton>
        <div className="space-y-3">
          <Skeleton className={`w-4/5 rounded-lg ${style.skeletonLow}`}>
            <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
          </Skeleton>
        </div>
      </Card>
    </div>
    <div className={`mx-8 .. rounded-md ${style.cards}`}>
      <Card radius="lg" className="border-none">
        <Skeleton className={`rounded-lg ${style.skeleton}`}>
          <div className="rounded-lg bg-default-300"></div>
        </Skeleton>
        <div className="space-y-3">
          <Skeleton className={`w-4/5 rounded-lg ${style.skeletonLow}`}>
            <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
          </Skeleton>
        </div>
      </Card>
    </div>
    <div className={`mx-8 .. rounded-md ${style.cards}`}>
      <Card radius="lg" className="border-none">
        <Skeleton className={`rounded-lg ${style.skeleton}`}>
          <div className="rounded-lg bg-default-300"></div>
        </Skeleton>
        <div className="space-y-3">
          <Skeleton className={`w-4/5 rounded-lg ${style.skeletonLow}`}>
            <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
          </Skeleton>
        </div>
      </Card>
    </div>
    <div className={`mx-8 .. rounded-md ${style.cards}`}>
      <Card radius="lg" className="border-none">
        <Skeleton className={`rounded-lg ${style.skeleton}`}>
          <div className="rounded-lg bg-default-300"></div>
        </Skeleton>
        <div className="space-y-3">
          <Skeleton className={`w-4/5 rounded-lg ${style.skeletonLow}`}>
            <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
          </Skeleton>
        </div>
      </Card>
    </div>
    <div className={`mx-8 .. rounded-md ${style.cards}`}>
      <Card radius="lg" className="border-none">
        <Skeleton className={`rounded-lg ${style.skeleton}`}>
          <div className="rounded-lg bg-default-300"></div>
        </Skeleton>
        <div className="space-y-3">
          <Skeleton className={`w-4/5 rounded-lg ${style.skeletonLow}`}>
            <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
          </Skeleton>
        </div>
      </Card>
    </div>
    <div className={`mx-8 .. rounded-md ${style.cards}`}>
      <Card radius="lg" className="border-none">
        <Skeleton className={`rounded-lg ${style.skeleton}`}>
          <div className="rounded-lg bg-default-300"></div>
        </Skeleton>
        <div className="space-y-3">
          <Skeleton className={`w-4/5 rounded-lg ${style.skeletonLow}`}>
            <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
          </Skeleton>
        </div>
      </Card>
    </div>
    </>
  )
}