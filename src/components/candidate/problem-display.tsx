"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Loader2, Lock, Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Mock data, to be replaced by actual data fetching
const MOCK_CANDIDATE_DATA = {
  name: "Alex Doe",
  problem: {
    id: "prob_123",
    title: "Implement a Debounce Function",
    difficulty: "Medium",
    description: "Your task is to implement a debounce function in JavaScript. The function should delay invoking a passed-in function until after `wait` milliseconds have elapsed since the last time it was invoked.",
  },
  // Set scheduled time to 2 minutes in the future for demonstration
  scheduledTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
};

type AccessState = 'loading' | 'denied' | 'granted' | 'error';

export default function ProblemDisplay() {
  const [accessState, setAccessState] = useState<AccessState>('loading');
  const [reason, setReason] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const checkAccess = () => {
      try {
        const now = new Date();
        const scheduledTime = new Date(MOCK_CANDIDATE_DATA.scheduledTime);
        
        if (now >= scheduledTime) {
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
    
    // Set up a timer to re-check access periodically if denied
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if(accessState !== 'granted'){
        checkAccess();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [accessState]);


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

  if (accessState === 'denied') {
    const scheduledDate = new Date(MOCK_CANDIDATE_DATA.scheduledTime);
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
              {formatDistanceToNow(scheduledDate, { addSuffix: false })}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm text-muted-foreground">
            <p><Clock className="inline-block mr-1 h-4 w-4" />Scheduled Time: {scheduledDate.toLocaleString()}</p>
            <p>{reason}</p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">{MOCK_CANDIDATE_DATA.problem.title}</CardTitle>
        <CardDescription>Difficulty: {MOCK_CANDIDATE_DATA.problem.difficulty}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{MOCK_CANDIDATE_DATA.problem.description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild size="lg">
          <Link href="/candidate/problem">
            Start Challenge <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
