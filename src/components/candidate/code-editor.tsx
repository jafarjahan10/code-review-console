
"use client"
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import 'prismjs/themes/prism-tomorrow.css';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFirestore } from "@/firebase";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { Candidate, Problem } from "@/types";

const getInitialCode = (tech: string) => {
    switch (tech.toLowerCase()) {
        case "html":
            return `<!-- Your HTML code here -->\n<h1>Code Challenge</h1>`;
        case "css":
            return `/* Your CSS code here */\nbody {\n  font-family: sans-serif;\n}`;
        case "js":
            return `// Your JavaScript code here\nconsole.log("Hello, Candidate!");`;
        default:
            return `// ${tech} code editor`;
    }
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

type CodeEditorProps = {
    problem: Problem;
    candidate: Candidate;
};

export default function CodeEditor({ problem, candidate }: CodeEditorProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const technologies = useMemo(() => problem.tags || [], [problem]);
  const [codes, setCodes] = useState<Record<string, string>>(() => {
    const initialState: Record<string, string> = {};
    technologies.forEach(tech => {
        initialState[tech.toLowerCase()] = getInitialCode(tech);
    });
    return initialState;
  });
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleCodeChange = (tech: string, code: string) => {
      setCodes(prev => ({ ...prev, [tech.toLowerCase()]: code }));
  };

  const handleSubmit = async () => {
    setShowConfirmDialog(false);
    if (!firestore) {
      toast({ variant: 'destructive', title: "Submission Failed", description: "Database connection not found." });
      return;
    }
    
    setIsSubmitted(true); // Disable editor immediately

    try {
      const submissionsRef = collection(firestore, 'candidates', candidate.id, 'submissions');
      const newSubmissionRef = await addDoc(submissionsRef, {
        candidateId: candidate.id,
        problemId: problem.id,
        codeHTML: codes['html'] || '',
        codeCSS: codes['css'] || '',
        codeJS: codes['js'] || '',
        submissionTime: serverTimestamp(),
      });

      const candidateRef = doc(firestore, 'candidates', candidate.id);
      await updateDoc(candidateRef, {
        status: 'Completed',
        submissionId: newSubmissionRef.id,
        submitTime: serverTimestamp()
      });

      toast({
        title: "Submission Successful!",
        description: "Your code has been submitted for review.",
      });
      
      // Redirect to a thank you page or back home after a delay
      setTimeout(() => router.push('/'), 3000);

    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: 'destructive',
        title: "Submission Failed",
        description: error.message || "An unexpected error occurred.",
      });
      setIsSubmitted(false); // Re-enable editor on failure
    }
  };

  const editorStyles = {
    fontFamily: '"Source Code Pro", "Fira Mono", "Courier New", Courier, monospace',
    fontSize: 14,
    backgroundColor: "hsl(var(--card))",
    color: "hsl(var(--foreground))",
    borderRadius: "var(--radius)",
    padding: "1rem",
    minHeight: "100%",
    outline: "none",
    border: "1px solid hsl(var(--border))",
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <Card className="flex-1 flex flex-col">
          <Tabs defaultValue={technologies[0]?.toLowerCase()} className="flex-1 flex flex-col">
            <CardHeader className="flex-row items-center justify-between gap-4">
              <TabsList className={`grid w-full ${technologies.length > 1 ? `max-w-xs grid-cols-${technologies.length}` : 'grid-cols-1'}`}>
                {technologies.map(tech => (
                    <TabsTrigger key={tech} value={tech.toLowerCase()}>{tech}</TabsTrigger>
                ))}
              </TabsList>
              {!isSubmitted && (
                <Button onClick={() => setShowConfirmDialog(true)} className="!space-y-0 h-[40px] !m-0">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Solution
                </Button>
              )}
            </CardHeader>
            <div className="flex-1 p-1 pt-0">
                {technologies.map(tech => {
                    const lowerTech = tech.toLowerCase();
                    const language = getLanguage(lowerTech);
                    return (
                        <TabsContent key={tech} value={lowerTech} className="h-full m-0">
                            <Editor
                            value={codes[lowerTech] || ''}
                            onValueChange={(code) => handleCodeChange(lowerTech, code)}
                            highlight={(code) => highlight(code, languages[language] || languages.clike, language)}
                            padding={10}
                            style={editorStyles}
                            className="font-code h-full resize-none text-sm !p-0"
                            readOnly={isSubmitted}
                            />
                        </TabsContent>
                    )
                })}
            </div>
          </Tabs>
        </Card>
      </div>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you ready to submit?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will not be able to edit your
              code after submitting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
