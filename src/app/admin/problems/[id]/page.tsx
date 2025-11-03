
'use client';

import { useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Layers, Briefcase } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Position, Problem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ViewProblemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const problemId = params.id as string;

  const problemDocRef = useMemoFirebase(() => (firestore && problemId ? doc(firestore, 'problems', problemId) : null), [firestore, problemId]);
  const { data: problem, isLoading: isLoadingProblem, error } = useDoc<Problem>(problemDocRef);
  
  const positionDocRef = useMemoFirebase(() => (firestore && problem?.positionId ? doc(firestore, 'positions', problem.positionId) : null), [firestore, problem]);
  const { data: position, isLoading: isLoadingPosition } = useDoc<Position>(positionDocRef);

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Problem not found',
        description: 'The requested problem could not be found.',
      });
      router.push('/admin/problems');
    }
  }, [error, router, toast]);

  const isLoading = isLoadingProblem || isLoadingPosition;

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-9 w-64" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
             <CardContent className="pt-2">
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
      </div>
    )
  }

  if (!problem) {
    return (
         <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <p>Problem not found.</p>
          </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin/problems">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-3xl">{problem.title}</CardTitle>
                <Badge
                    variant={
                        problem.difficulty === "Easy"
                        ? "default"
                        : problem.difficulty === "Medium"
                        ? "default"
                        : "destructive"
                    }
                    className={
                        problem.difficulty === "Easy"
                        ? "bg-green-600 hover:bg-green-600/80"
                        : problem.difficulty === "Medium"
                        ? "bg-orange-600 hover:bg-orange-600/80"
                        : ""
                    }
                    >
                    {problem.difficulty}
                </Badge>
            </div>
             <div className="flex items-center flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                {position && (
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{position.title}</span>
                    </div>
                )}
                {problem.tags && problem.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <div className="flex flex-wrap gap-1">
                           {problem.tags.map(tag => <Badge variant="secondary" key={tag}>{tag}</Badge>)}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

        <Card>
            <CardHeader>
                <CardTitle>Problem Description</CardTitle>
            </CardHeader>
          <CardContent className="pt-2">
            <div className="prose max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
