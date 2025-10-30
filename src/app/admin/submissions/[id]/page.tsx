
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
import { ArrowLeft, Briefcase, Building } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';


// Mock Data
const MOCK_CURRENT_USER_ID = "user_1"; // Assuming this is the logged-in interviewer

const MOCK_SUBMISSIONS = [
  {
    id: "sub_1",
    candidateName: "John Doe",
    candidateEmail: "john.doe@example.com",
    problemTitle: "FizzBuzz Challenge",
    problemTechnologies: ["JS"],
    positionId: "pos_1",
    submittedAt: "2024-05-21T10:00:00Z",
    code: {
      html: ``,
      css: ``,
      js: `// FizzBuzz Implementation\nfor (let i = 1; i <= 100; i++) {\n  if (i % 15 === 0) console.log('FizzBuzz');\n  else if (i % 3 === 0) console.log('Fizz');\n  else if (i % 5 === 0) console.log('Buzz');\n  else console.log(i);\n}`,
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
    problemTechnologies: ["JS"],
    positionId: "pos_2",
    submittedAt: "2024-05-19",
    code: {
        html: ``,
        css: ``,
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
    problemTechnologies: ["HTML", "CSS", "JS"],
    positionId: "pos_1",
    submittedAt: "2024-05-23",
    code: {
        html: `<h1>Two Sum</h1>`,
        css: `body { font-family: sans-serif; }`,
        js: `function twoSum(arr, target) { return []; }`
    },
    remarks: [],
  }
];

const initialPositions = [
  { id: "pos_1", title: "Senior Frontend Developer", department: "Engineering" },
  { id: "pos_2", title: "UX/UI Designer", department: "Design" },
  { id: "pos_3", title: "Product Manager", department: "Product" },
  { id: "pos_4", title: "Junior Backend Developer", department: "Engineering" },
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
    problemTechnologies: string[];
    positionId: string;
    submittedAt: string;
    code: {
        html: string;
        css: string;
        js: string;
    };
    remarks: Remark[];
}

const getLanguage = (tech: string) => {
    switch (tech.toLowerCase()) {
        case "html":
            return "markup";
        case "css":
            return "css";
        case "js":
            return "javascript";
        case "python":
            return "python";
        default:
            return "clike";
    }
}


export default function ViewSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [remark, setRemark] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const technologies = useMemo(() => submission?.problemTechnologies || [], [submission]);
  const position = useMemo(() => initialPositions.find(p => p.id === submission?.positionId), [submission]);

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
    minHeight: "100%",
    outline: "none",
  };


  if (isLoading || !submission) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <p>Loading submission...</p>
      </div>
    );
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
                {submission.problemTitle} by {submission.candidateName}
            </p>
        </div>
      </div>
      
       <Card>
            <CardHeader>
                <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" /> Position</p>
                    <p className="text-muted-foreground">{position?.title || "N/A"}</p>
                </div>
                {position?.department && (
                <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" /> Department</p>
                    <Badge variant="secondary">{position.department}</Badge>
                </div>
                )}
            </CardContent>
        </Card>

      <div className="grid gap-4 lg:grid-cols-3 flex-1 min-h-0">
        {/* Left side: Code Viewer */}
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
                        const lowerTech = tech.toLowerCase() as keyof Submission['code'];
                        const language = getLanguage(tech);
                        return (
                            <TabsContent key={tech} value={lowerTech} className="mt-2 flex-1">
                                <Editor
                                    value={submission.code[lowerTech]}
                                    onValueChange={() => {}}
                                    highlight={(code) => highlight(code, languages[language] || languages.clike, language)}
                                    padding={0}
                                    style={editorStyles}
                                    readOnly
                                    className="font-code h-full resize-none text-sm !p-0 border rounded-md"
                                />
                            </TabsContent>
                        )
                    })}
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

    