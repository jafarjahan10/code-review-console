import ProblemDisplay from "@/components/candidate/problem-display";
import { Suspense } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProblemDisplaySkeleton() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="pt-4">
          <Skeleton className="h-10 w-40" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function CandidateDashboard() {
  return (
    <div className="flex-1 p-4 md:p-8 pt-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h2 className="text-3xl font-bold tracking-tight font-headline mb-6">Your Coding Challenge</h2>
        <Suspense fallback={<ProblemDisplaySkeleton />}>
          <ProblemDisplay />
        </Suspense>
      </div>
    </div>
  );
}
