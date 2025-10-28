
'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, UserCircle } from 'lucide-react';
import Link from 'next/link';
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import 'prismjs/themes/prism-tomorrow.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

// Mock Data
const MOCK_CURRENT_USER_ID = "user_1"; // Assuming this is the logged-in interviewer

const MOCK_SUBMISSIONS = [
  {
    id: "sub_1",
    candidateName: "John Doe",
    candidateEmail: "john.doe@example.com",
    problemTitle: "FizzBuzz Challenge",
    submittedAt: "2024-05-21T10:00:00Z",
    code: {
      html: `<h1>FizzBuzz Result</h1>\n<div id="output"></div>`,
      css: `body { font-family: sans-serif; } \n#output { display: flex; flex-direction: column; } \ndiv > span { padding: 2px 0; }`,
      js: `const output = document.getElementById('output');\nfor (let i = 1; i <= 100; i++) {\n  const span = document.createElement('span');\n  if (i % 15 === 0) span.textContent = 'FizzBuzz';\n  else if (i % 3 === 0) span.textContent = 'Fizz';\n  else if (i % 5 === 0) span.textContent = 'Buzz';\n  else span.textContent = i;\n  output.appendChild(span);\n}`,
    },
    remarks: [
      {
        userId: "user_2",
        userName: "Jane Smith",
        userEmail: "jane.s@example.com",
        remark: "Good solution. The logic is clean and easy to follow. The use of a single loop is efficient.",
        createdAt: "2024-05-21T11:30:00Z",
      },
    ],
  },
   {
    id: "sub_2",
    candidateName: "Jane Smith",
    candidateEmail: "jane.smith@example.com",
    problemTitle: "Palindrome Checker",
    submittedAt: "2024-05-19",
    code: {
        html: `<h1>Palindrome</h1>`,
        css: `body { font-family: sans-serif; }`,
        js: `function isPalindrome(str) { return true; }`
    },
    remarks: [
        {
            userId: "user_1",
            userName: "Admin User",
            userEmail: "admin@example.com",
            remark: "Great job!",
            createdAt: "2024-05-20T11:30:00Z",
        }
    ]
  },
  {
    id: "sub_3",
    candidateName: "Sam Wilson",
    candidateEmail: "sam.wilson@example.com",
    problemTitle: "Two Sum",
    submittedAt: "2024-05-23",
    code: {
        html: `<h1>Two Sum</h1>`,
        css: `body { font-family: sans-serif; }`,
        js: `function twoSum(arr, target) { return []; }`
    },
    remarks: [],
  }
];

type Remark = {
    userId: string;
    userName: string;
    userEmail: string;
    remark: string;
    createdAt: string;
}

type Submission = {
    id: string;
    candidateName: string;
    candidateEmail: string;
    problemTitle: string;
    submittedAt: string;
    code: {
        html: string;
        css: string;
        js: string;
    };
    remarks: Remark[];
}


export default function ViewSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [remark, setRemark] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const hasAlreadyRemarked = submission?.remarks.some(r => r.userId === MOCK_CURRENT_USER_ID);

  useEffect(() => {
    const submissionId = params.id;
    const sub = MOCK_SUBMISSIONS.find(s => s.id === submissionId);
    if (sub) {
      setSubmission(sub);
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission not found',
      });
      router.push('/admin/submissions');
    }
    setIsLoading(false);
  }, [params.id, router, toast]);

  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remark.trim()) {
      toast({ variant: 'destructive', title: 'Remark cannot be empty.' });
      return;
    }
    // In a real app, this would be an API call
    console.log({
      submissionId: submission?.id,
      remark,
      userId: MOCK_CURRENT_USER_ID
    });
    toast({ title: 'Remark added successfully!' });
    setRemark("");
    // To see the update, we'd refetch data here. For mock, we'll just add it to state.
     if (submission) {
      const newRemark: Remark = {
        userId: MOCK_CURRENT_USER_ID,
        userName: "Admin User", // Mocked current user name
        userEmail: "admin@example.com",
        remark,
        createdAt: new Date().toISOString(),
      };
      setSubmission({
        ...submission,
        remarks: [...submission.remarks, newRemark],
      });
    }
  };

  const editorStyles = {
    fontFamily: '"Source Code Pro", "Fira Mono", "Courier New", Courier, monospace',
    fontSize: 14,
    backgroundColor: "hsl(var(--card))",
    color: "hsl(var(--foreground))",
    borderRadius: "var(--radius)",
    padding: "1rem",
    minHeight: "400px",
    outline: "none",
    border: "1px solid hsl(var(--border))",
  };


  if (isLoading || !submission) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <p>Loading submission...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-4">
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
                {submission.problemTitle} by {submission.candidateName}
            </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left side: Code Viewer */}
        <div className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Submitted Code</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="javascript">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="css">CSS</TabsTrigger>
                        <TabsTrigger value="javascript">JS</TabsTrigger>
                    </TabsList>
                    <TabsContent value="html" className="mt-2">
                        <Editor
                            value={submission.code.html}
                            onValueChange={() => {}}
                            highlight={(code) => highlight(code, languages.markup, "markup")}
                            padding={10}
                            style={editorStyles}
                            readOnly
                            className="font-code h-full resize-none text-sm"
                        />
                    </TabsContent>
                    <TabsContent value="css" className="mt-2">
                        <Editor
                            value={submission.code.css}
                            onValueChange={() => {}}
                            highlight={(code) => highlight(code, languages.css, "css")}
                            padding={10}
                            style={editorStyles}
                            readOnly
                            className="font-code h-full resize-none text-sm"
                        />
                    </TabsContent>
                    <TabsContent value="javascript" className="mt-2">
                         <Editor
                            value={submission.code.js}
                            onValueChange={() => {}}
                            highlight={(code) => highlight(code, languages.js, "javascript")}
                            padding={10}
                            style={editorStyles}
                            readOnly
                            className="font-code h-full resize-none text-sm"
                        />
                    </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>

        {/* Right side: Remarks */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Interviewer Remarks</CardTitle>
                    <CardDescription>Feedback from the interview panel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {submission.remarks.length > 0 ? (
                    submission.remarks.map((r) => (
                      <div key={r.userId} className="flex items-start gap-4">
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
            
            {!hasAlreadyRemarked && (
                <Card>
                    <form onSubmit={handleAddRemark}>
                        <CardHeader>
                            <CardTitle>Add Your Remark</CardTitle>
                            <CardDescription>Provide your feedback on this submission.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid w-full gap-2">
                                <Label htmlFor="remark">Your Feedback</Label>
                                <Textarea
                                id="remark"
                                placeholder="e.g., 'The solution is well-structured but could be optimized for performance...'"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                rows={5}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">Submit Remark</Button>
                        </CardFooter>
                    </form>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
