
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Eye } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Submission, Candidate, Problem } from '@/types';
import ClientDateTime from '@/components/client-date-time';

const toDate = (timestamp: any): Date | undefined => {
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return timestamp;
};


export default function SubmissionsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const submissionsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'submissions') : null, [firestore]);
  const { data: submissions, isLoading: isLoadingSubmissions } = useCollection<Submission>(submissionsColRef);
  
  const candidatesColRef = useMemoFirebase(() => firestore ? collection(firestore, 'candidates') : null, [firestore]);
  const { data: candidates, isLoading: isLoadingCandidates } = useCollection<Candidate>(candidatesColRef);
  
  const problemsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'problems') : null, [firestore]);
  const { data: problems, isLoading: isLoadingProblems } = useCollection<Problem>(problemsColRef);

  const candidatesMap = useMemo(() => {
    if (!candidates) return new Map();
    return new Map(candidates.map(c => [c.id, c]));
  }, [candidates]);

  const problemsMap = useMemo(() => {
    if (!problems) return new Map();
    return new Map(problems.map(p => [p.id, p]));
  }, [problems]);

  const isLoading = isLoadingSubmissions || isLoadingCandidates || isLoadingProblems;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Submissions
          </h2>
          <p className="text-muted-foreground">
            Review and manage all candidate submissions.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Candidate</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Problem</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Status</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Submitted At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                ))
              ) : (submissions || []).map((submission) => {
                const candidate = candidatesMap.get(submission.candidateId);
                const problem = problemsMap.get(submission.problemId);
                const status = candidate?.status || 'Pending';
                
                return (
                <TableRow key={submission.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={`https://avatar.vercel.sh/${candidate?.email}.png`} alt="Avatar" />
                        <AvatarFallback>{candidate?.name.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p className="font-medium">{candidate?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground hidden md:inline">
                          {candidate?.email || 'No email'}
                        </p>
                         <div className="md:hidden text-sm text-muted-foreground">
                          <p>{problem?.title || 'N/A'}</p>
                           <Badge 
                              variant={status === 'Completed' ? 'default' : 'destructive'}
                              className={`mt-1 ${status === 'Completed' ? 'bg-green-600 hover:bg-green-600/80' : ''}`}
                            >
                              {status}
                            </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">{problem?.title || 'N/A'}</TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">
                    <Badge 
                      variant={status === 'Completed' ? 'default' : 'destructive'}
                      className={status === 'Completed' ? 'bg-green-600 hover:bg-green-600/80' : ''}
                    >
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">
                    <ClientDateTime date={toDate(submission.submissionTime)} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/submissions/${submission.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Submission
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
