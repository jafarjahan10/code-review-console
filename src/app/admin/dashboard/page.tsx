
'use client';

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, FileCode, Clock, CheckCircle } from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from 'firebase/firestore';
import type { Problem, Candidate, Submission } from '@/types';
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const toDate = (timestamp: any): Date | undefined => {
    if (!timestamp) return undefined;
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return timestamp;
};


export default function AdminDashboard() {
  const firestore = useFirestore();

  const problemsColRef = useMemoFirebase(() => (firestore ? collection(firestore, 'problems') : null), [firestore]);
  const { data: problems, isLoading: isLoadingProblems } = useCollection<Problem>(problemsColRef);

  const candidatesColRef = useMemoFirebase(() => (firestore ? collection(firestore, 'candidates') : null), [firestore]);
  const { data: candidates, isLoading: isLoadingCandidates } = useCollection<Candidate>(candidatesColRef);

  const submissionsColRef = useMemoFirebase(() => (firestore ? collection(firestore, 'submissions') : null), [firestore]);
  const { data: submissions, isLoading: isLoadingSubmissions } = useCollection<Submission>(submissionsColRef);
  
  const candidatesMap = useMemo(() => {
    if (!candidates) return new Map();
    return new Map(candidates.map(c => [c.id, c]));
  }, [candidates]);
  
  const problemsMap = useMemo(() => {
    if (!problems) return new Map();
    return new Map(problems.map(p => [p.id, p]));
  }, [problems]);

  const stats = useMemo(() => {
    const totalProblems = problems?.length ?? 0;
    const activeCandidates = candidates?.filter(c => c.status === 'In Progress' || c.status === 'Invited').length ?? 0;
    const pendingReviews = submissions?.filter(s => (s.remarks?.length ?? 0) === 0).length ?? 0;
    const reviewedToday = submissions?.filter(s => {
        if (!s.remarks || s.remarks.length === 0) return false;
        const latestRemarkDate = toDate(s.remarks[s.remarks.length-1].createdAt);
        if (!latestRemarkDate) return false;
        const today = new Date();
        return latestRemarkDate.getDate() === today.getDate() &&
               latestRemarkDate.getMonth() === today.getMonth() &&
               latestRemarkDate.getFullYear() === today.getFullYear();
    }).length ?? 0;

    return [
        {
          title: "Total Problems",
          value: totalProblems,
          icon: FileCode,
          description: "Number of coding challenges created.",
        },
        {
          title: "Active Candidates",
          value: activeCandidates,
          icon: Users,
          description: "Candidates currently in the process.",
        },
        {
          title: "Pending Reviews",
          value: pendingReviews,
          icon: Clock,
          description: "Submissions awaiting your feedback.",
        },
        {
          title: "Reviewed Today",
          value: reviewedToday,
          icon: CheckCircle,
          description: "Submissions you have reviewed today.",
        },
      ];
  }, [problems, candidates, submissions]);

  const recentSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions
        .sort((a, b) => {
            const dateA = toDate(a.submissionTime)?.getTime() ?? 0;
            const dateB = toDate(b.submissionTime)?.getTime() ?? 0;
            return dateB - dateA;
        })
        .slice(0, 5);
  }, [submissions]);
  
  const isLoading = isLoadingProblems || isLoadingCandidates || isLoadingSubmissions;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({length: 4}).map((_, i) => (
             <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/4 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
          ))
        ) : stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="font-headline">Recent Submissions</CardTitle>
            <CardDescription>
              A list of the most recent candidate submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-4">
                  {Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-4 w-48 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
            ) : recentSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {recentSubmissions.map(sub => {
                    const candidate = candidatesMap.get(sub.candidateId);
                    const problem = problemsMap.get(sub.problemId);
                    const submissionTime = toDate(sub.submissionTime);
                    const isPending = (sub.remarks?.length ?? 0) === 0;

                    return (
                        <div key={sub.id} className="flex items-center justify-between">
                            <div>
                            <p className="font-medium">{candidate?.name || 'Unknown Candidate'} - {problem?.title || 'Unknown Problem'}</p>
                            <p className="text-sm text-muted-foreground">Submitted: {submissionTime ? new Date(submissionTime).toLocaleString() : 'N/A'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className={`text-sm font-semibold ${isPending ? 'text-accent-foreground' : 'text-green-600'}`}>
                                    {isPending ? 'Pending' : 'Reviewed'}
                                </p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/submissions/${sub.id}`}>View</Link>
                                </Button>
                            </div>
                        </div>
                    )
                  })}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center">No submissions yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
