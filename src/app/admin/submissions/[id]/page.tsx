

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Briefcase, Building, Loader2, CheckSquare, MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import 'prismjs/themes/prism-tomorrow.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import type { Submission, Candidate, Problem, Department, Position, SubmissionAnswer } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

type Remark = {
    userId: string;
    userName: string;
    userEmail: string;
    remark: string;
    createdAt: string;
}

const getLanguage = (tech: string) => {
    switch (tech.toLowerCase()) {
        case "html": return "markup";
        case "css": return "css";
        case "javascript": return "javascript";
        default: return "clike";
    }
}

export default function ViewSubmissionPage() {
  const router = useRouter();
  const { id: submissionId } = useParams() as { id: string };
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, adminUser } = useUser();

  const [remark, setRemark] = useState("");
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);

  const subDocRef = useMemoFirebase(() => (firestore && submissionId ? doc(firestore, 'submissions', submissionId) : null), [firestore, submissionId]);
  const { data: submission, isLoading: isLoadingSubmission } = useDoc<Submission>(subDocRef);

  const candDocRef = useMemoFirebase(() => (firestore && submission?.candidateId ? doc(firestore, 'candidates', submission.candidateId) : null), [firestore, submission]);
  const { data: candidate, isLoading: isLoadingCandidate } = useDoc<Candidate>(candDocRef);

  const probDocRef = useMemoFirebase(() => (firestore && submission?.problemId ? doc(firestore, 'problems', submission.problemId) : null), [firestore, submission]);
  const { data: problem, isLoading: isLoadingProblem } = useDoc<Problem>(probDocRef);
  
  const posDocRef = useMemoFirebase(() => (firestore && problem?.positionId ? doc(firestore, 'positions', problem.positionId) : null), [firestore, problem]);
  const { data: position, isLoading: isLoadingPosition } = useDoc<Position>(posDocRef);

  const deptDocRef = useMemoFirebase(() => (firestore && position?.departmentId ? doc(firestore, 'departments', position.departmentId) : null), [firestore, position]);
  const { data: department, isLoading: isLoadingDept } = useDoc<Department>(deptDocRef);


  const technologies = useMemo(() => problem?.tags || [], [problem]);
  const hasAlreadyRemarked = useMemo(() => 
    submission?.remarks?.some(r => r.userId === user?.uid), 
  [submission, user]);


  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remark.trim()) {
      toast({ variant: 'destructive', title: 'Remark cannot be empty.' });
      return;
    }
    if (!firestore || !submission || !user || !adminUser) return;
    
    setIsSubmittingRemark(true);

    try {
        const submissionRef = doc(firestore, 'submissions', submission.id);
        const newRemark: Remark = {
            userId: user.uid,
            userName: adminUser.name || 'Admin',
            userEmail: adminUser.email,
            remark,
            createdAt: new Date().toISOString(),
        };

        await setDoc(submissionRef, { remarks: arrayUnion(newRemark) }, { merge: true });

        toast({ title: 'Remark added successfully!' });
        setRemark("");
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Failed to add remark",
            description: error.message,
        });
    } finally {
        setIsSubmittingRemark(false);
    }
  };

  const editorStyles = {
    fontFamily: '"Source Code Pro", "Fira Mono", "Courier New", Courier, monospace',
    fontSize: 14,
    backgroundColor: "hsl(var(--card))",
    color: "hsl(var(--foreground))",
    borderRadius: "var(--radius)",
    minHeight: "100%",
    outline: "none",
  };

  const isLoading = isLoadingSubmission || isLoadingCandidate || isLoadingProblem || isLoadingPosition || isLoadingDept;

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-full flex flex-col">
        <div className="flex items-center gap-4">
          <Skeleton className="h-7 w-7" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 lg:grid-cols-3 flex-1 min-h-0">
          <Skeleton className="lg:col-span-2 h-full" />
          <Skeleton className="h-full" />
        </div>
      </div>
    );
  }

  if (!submission) {
     return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <p>Submission not found.</p>
      </div>
    );
  }

  const getCodeForTech = (tech: string) => {
    return submission.answers?.find(a => a.type.toLowerCase() === tech.toLowerCase())?.code || '';
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-full flex flex-col">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin/submissions">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">
                Review Submission
            </h2>
            <p className="text-muted-foreground">
                {problem?.title} by {candidate?.name}
            </p>
        </div>
      </div>
      
       <Card className="w-full">
            <CardHeader>
                <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" /> Position</p>
                    <p className="text-muted-foreground">{position?.title || "N/A"}</p>
                </div>
                {department && (
                <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" /> Department</p>
                    <Badge variant="secondary">{department.name}</Badge>
                </div>
                )}
            </CardContent>
        </Card>

      <div className="grid gap-4 lg:grid-cols-3 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col">
             <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <CardTitle>Submitted Code</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    <Tabs defaultValue={technologies[0]?.toLowerCase() || 'js'} className={`w-full flex-1 flex flex-col`}>
                    <TabsList className={`grid w-full ${technologies.length > 1 ? `grid-cols-${technologies.length}` : 'grid-cols-1'}`}>
                        {technologies.map(tech => (
                            <TabsTrigger key={tech} value={tech.toLowerCase()}>{tech}</TabsTrigger>
                        ))}
                    </TabsList>
                     {technologies.map(tech => {
                        const lowerTech = tech.toLowerCase();
                        const language = getLanguage(tech);
                        return (
                            <TabsContent key={tech} value={lowerTech} className="mt-2 flex-1">
                                <Editor
                                    value={getCodeForTech(tech)}
                                    onValueChange={() => {}}
                                    highlight={(code) => Prism.highlight(code, Prism.languages[language] || Prism.languages.clike, language)}
                                    padding={10}
                                    style={editorStyles}
                                    readOnly
                                    className="font-code h-full resize-none text-sm border rounded-md"
                                />
                            </TabsContent>
                        )
                    })}
                    </Tabs>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Interviewer Remarks</CardTitle>
                    <CardDescription>Feedback from the interview panel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {submission?.remarks && submission.remarks.length > 0 ? (
                    submission.remarks.map((r: Remark, index) => (
                      <div key={index} className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={`https://avatar.vercel.sh/${r.userEmail}.png`} />
                            <AvatarFallback>{r.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{r.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{r.remark}</p>
                        </div>
                      </div>
                    ))
                    ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No remarks have been added yet.</p>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <form onSubmit={hasAlreadyRemarked ? (e) => e.preventDefault() : handleAddRemark}>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                             {hasAlreadyRemarked ? (
                                <>
                                    <CheckSquare className="mr-2 h-5 w-5 text-green-600"/>
                                    Remark Submitted
                                </>
                             ) : (
                                <>
                                    <MessageSquarePlus className="mr-2 h-5 w-5"/>
                                    Add Your Remark
                                </>
                             )}
                        </CardTitle>
                        <CardDescription>
                            {hasAlreadyRemarked 
                                ? "You have already provided feedback for this submission."
                                : "Provide your feedback on this submission."
                            }
                        </CardDescription>
                    </CardHeader>
                    {!hasAlreadyRemarked && (
                        <>
                            <CardContent>
                                <div className="grid w-full gap-2">
                                    <Label htmlFor="remark">Your Feedback</Label>
                                    <Textarea
                                    id="remark"
                                    placeholder="e.g., 'The solution is well-structured but could be optimized for performance...'"
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    rows={5}
                                    disabled={isSubmittingRemark}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isSubmittingRemark}>
                                    {isSubmittingRemark && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Remark
                                </Button>
                            </CardFooter>
                        </>
                    )}
                </form>
            </Card>
        </div>
      </div>
    </div>
  );
}
