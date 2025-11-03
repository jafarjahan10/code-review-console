
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, Clock, ArrowRight, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from 'firebase/firestore';
import type { Candidate, Problem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AccessState = 'loading' | 'denied' | 'granted' | 'error';

const toDate = (timestamp: any): Date | undefined => {
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return timestamp;
};

export default function ProblemDisplay() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [candidateId, setCandidateId] = useState<string | null>(null);
  
  const [accessState, setAccessState] = useState<AccessState>('loading');
  const [reason, setReason] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    setCandidateId(sessionStorage.getItem('candidateId'));
  }, []);

  const candidateDocRef = useMemoFirebase(() => (firestore && candidateId ? doc(firestore, 'candidates', candidateId) : null), [firestore, candidateId]);
  const { data: candidate, isLoading: isLoadingCandidate } = useDoc<Candidate>(candidateDocRef);

  const problemDocRef = useMemoFirebase(() => (firestore && candidate?.problemId ? doc(firestore, 'problems', candidate.problemId) : null), [firestore, candidate]);
  const { data: problem, isLoading: isLoadingProblem } = useDoc<Problem>(problemDocRef);

  useEffect(() => {
    if (isLoadingCandidate || isLoadingProblem) {
        setAccessState('loading');
        return;
    }
    
    if (!candidate || !problem) {
        if (!isLoadingCandidate && !isLoadingProblem) {
            setAccessState('error');
            setReason("Could not load your candidate or problem information. Please try logging in again.");
        }
        return;
    }

    const checkAccess = () => {
      try {
        const now = new Date();
        const scheduledTime = toDate(candidate.scheduledTime);
        
        if (scheduledTime && now >= scheduledTime) {
          setAccessState('granted');
          setReason("Access granted. You may now start the challenge.");
        } else {
          setAccessState('denied');
          setReason("Access to the challenge is time-locked.");
        }
      } catch (error) {
        console.error("Error checking access:", error);
        setAccessState('error');
        setReason("Could not verify access at this time.");
      }
    };

    checkAccess();
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if(accessState !== 'granted'){
        checkAccess();
      }
    }, 1000);

    return () => clearInterval(interval);

  }, [candidate, problem, isLoadingCandidate, isLoadingProblem, accessState]);

  const handleStartChallenge = async () => {
    if (!firestore || !candidateId) return;

    setIsStarting(true);
    try {
        const candidateRef = doc(firestore, 'candidates', candidateId);
        await updateDoc(candidateRef, {
            status: 'In Progress'
        });
        router.push('/candidate/problem');
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Could not start challenge",
            description: error.message
        });
        setIsStarting(false);
    }
  };


  if (accessState === 'loading') {
    return (
      <Card className="w-full max-w-2xl animate-pulse">
        <CardHeader>
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="pt-4">
            <div className="h-10 w-40 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accessState === 'error') {
    return (
      <Alert variant="destructive" className="max-w-2xl">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{reason}</AlertDescription>
      </Alert>
    );
  }

  if (accessState === 'denied' && candidate) {
    const scheduledDate = toDate(candidate.scheduledTime);
    return (
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
          <CardTitle className="font-headline text-2xl mt-4">Challenge Locked</CardTitle>
          <CardDescription>
            Your access to the coding challenge is scheduled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Access unlocks in</p>
            <p className="text-3xl font-bold font-mono text-primary">
              {scheduledDate ? formatDistanceToNow(scheduledDate, { addSuffix: false }) : 'Calculating...'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm text-muted-foreground">
            <p><Clock className="inline-block mr-1 h-4 w-4" />Scheduled Time: {scheduledDate ? scheduledDate.toLocaleString() : '...'}</p>
            <p>{reason}</p>
        </CardFooter>
      </Card>
    );
  }

  if (accessState === 'granted' && problem) {
    return (
        <Card className="w-full max-w-2xl">
        <CardHeader>
            <CardTitle className="font-headline text-3xl">{problem.title}</CardTitle>
            <CardDescription>Difficulty: {problem.difficulty}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="prose max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleStartChallenge} size="lg" disabled={isStarting}>
                {isStarting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <ArrowRight className="mr-2 h-5 w-5" />
                )}
                Start Challenge
            </Button>
        </CardFooter>
        </Card>
    );
  }

  return null; // Should not be reached in normal flow
}
