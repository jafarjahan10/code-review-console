
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CodeEditor from "@/components/candidate/code-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Candidate, Problem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ProblemPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const [candidateId, setCandidateId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('candidateId');
    if (!id) {
        router.push('/login');
    } else {
        setCandidateId(id);
    }
  }, [router]);

  const candidateDocRef = useMemoFirebase(() => (firestore && candidateId ? doc(firestore, 'candidates', candidateId) : null), [firestore, candidateId]);
  const { data: candidate, isLoading: isLoadingCandidate } = useDoc<Candidate>(candidateDocRef);

  const problemDocRef = useMemoFirebase(() => (firestore && candidate?.problemId ? doc(firestore, 'problems', candidate.problemId) : null), [firestore, candidate]);
  const { data: problem, isLoading: isLoadingProblem } = useDoc<Problem>(problemDocRef);


   useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
      }
      // Prevent Cmd+Opt+I, Cmd+Opt+J on Mac
      if (e.metaKey && e.altKey && ['I', 'J'].includes(e.key.toUpperCase())) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const isLoading = isLoadingCandidate || isLoadingProblem;

  if (isLoading || !problem || !candidate) {
    return (
        <div className="grid md:grid-cols-2 gap-4 p-4" style={{height: 'calc(100dvh - 64px)'}}>
            <Card className="flex flex-col">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                 <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-10 w-1/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }


  return (
    <div className="grid md:grid-cols-2 gap-4 p-4 no-scrollbar overflow-y-auto" style={{height: 'calc(100dvh - 64px)'}} onContextMenu={(e) => e.preventDefault()}>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{problem.title}</CardTitle>
          <CardDescription>Difficulty: {problem.difficulty}</CardDescription>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent>
            <div className="prose max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
            </div>
          </CardContent>
        </ScrollArea>
      </Card>

      <CodeEditor candidate={candidate} problem={problem} />
    </div>
  );
}
