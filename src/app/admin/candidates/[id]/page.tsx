
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AtSign, Calendar, FileCode, Briefcase, Building, KeyRound, Copy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ClientDateTime from '@/components/client-date-time';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Candidate, Position, Department, Problem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const toDate = (timestamp: any): Date | undefined => {
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return timestamp;
};

export default function ViewCandidatePage() {
  const router = useRouter();
  const { id: candidateId } = useParams() as { id: string };
  const { toast } = useToast();
  const firestore = useFirestore();

  const candidateDocRef = useMemoFirebase(() => (firestore && candidateId ? doc(firestore, 'candidates', candidateId) : null), [firestore, candidateId]);
  const { data: candidate, isLoading: isLoadingCandidate, error: candidateError } = useDoc<Candidate>(candidateDocRef);

  const positionDocRef = useMemoFirebase(() => (firestore && candidate?.positionId ? doc(firestore, 'positions', candidate.positionId) : null), [firestore, candidate]);
  const { data: position, isLoading: isLoadingPosition } = useDoc<Position>(positionDocRef);

  const departmentDocRef = useMemoFirebase(() => (firestore && position?.departmentId ? doc(firestore, 'departments', position.departmentId) : null), [firestore, position]);
  const { data: department, isLoading: isLoadingDepartment } = useDoc<Department>(departmentDocRef);
  
  const problemDocRef = useMemoFirebase(() => (firestore && candidate?.problemId ? doc(firestore, 'problems', candidate.problemId) : null), [firestore, candidate]);
  const { data: problem, isLoading: isLoadingProblem } = useDoc<Problem>(problemDocRef);

  useEffect(() => {
    if (candidateError) {
      toast({
        variant: 'destructive',
        title: 'Candidate not found',
        description: 'The requested candidate could not be found.',
      });
      router.push('/admin/candidates');
    }
  }, [candidateError, router, toast]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "The access code has been copied.",
    });
  };

  const isLoading = isLoadingCandidate || isLoadingPosition || isLoadingDepartment || isLoadingProblem;

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-7 w-7" />
            <Skeleton className="h-8 w-40" />
        </div>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="grid gap-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                </div>
            </CardHeader>
          <CardContent className="pt-2 grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-5 w-40" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-5 w-40" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-5 w-40" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-5 w-40" /></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!candidate) {
    return (
         <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <p>Candidate not found.</p>
          </div>
    )
  }
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin/candidates">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight font-headline">
            Candidate Details
        </h2>
      </div>

        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={`https://avatar.vercel.sh/${candidate.email}.png`} alt="Avatar" />
                        <AvatarFallback className="text-3xl">{candidate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <CardTitle className="font-headline text-3xl">{candidate.name}</CardTitle>
                        <CardDescription>
                             <Badge variant={
                                candidate.status === 'Completed' ? 'default' :
                                candidate.status === 'Pending' ? 'default' :
                                candidate.status === 'In Progress' ? 'default' : 'secondary'
                                }
                                className={
                                candidate.status === 'Completed' ? 'bg-green-600 hover:bg-green-600/80' :
                                candidate.status === 'Pending' ? 'bg-orange-600 hover:bg-orange-600/80' :
                                candidate.status === 'In Progress' ? 'bg-blue-600 hover:bg-blue-600/80' : ''
                                }
                                >
                                {candidate.status}
                            </Badge>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
          <CardContent className="pt-2 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <p className="text-sm font-medium flex items-center"><AtSign className="mr-2 h-4 w-4 text-muted-foreground" /> Email</p>
                <p className="text-muted-foreground">{candidate.email}</p>
            </div>
             <div className="space-y-2">
                <p className="text-sm font-medium flex items-center"><Calendar className="mr-2 h-4 w-4 text-muted-foreground" /> Scheduled For</p>
                <p className="text-muted-foreground"><ClientDateTime date={toDate(candidate.scheduledTime)} /></p>
            </div>
             <div className="space-y-2">
                <p className="text-sm font-medium flex items-center"><FileCode className="mr-2 h-4 w-4 text-muted-foreground" /> Problem Assigned</p>
                <p className="text-muted-foreground">{problem?.title || "N/A"}</p>
            </div>
             <div className="space-y-2">
                <p className="text-sm font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" /> Position</p>
                <p className="text-muted-foreground">{position?.title || "N/A"}</p>
            </div>
            {department?.name && (
              <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" /> Department</p>
                  <Badge variant="secondary">{department.name}</Badge>
              </div>
            )}
             <div className="space-y-2">
                <p className="text-sm font-medium flex items-center"><KeyRound className="mr-2 h-4 w-4 text-muted-foreground" /> Access Code</p>
                <div className="flex items-center gap-2">
                    <p className="text-muted-foreground font-mono">{candidate.accessCode}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(candidate.accessCode)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
