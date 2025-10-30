
"use client"
import { useState, useMemo } from "react";
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

const getInitialCode = (tech: string) => {
    switch (tech.toLowerCase()) {
        case "html":
            return `<h1>Code Challenge</h1>
<p>Implement your solution below and see the live preview.</p>
<button id="myButton">Click me</button>
<p>Button clicked <span id="count">0</span> times.</p>`;
        case "css":
            return `body {
  font-family: sans-serif;
  background-color: #f0f0f0;
  padding: 1rem;
}
button {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  cursor: pointer;
}`;
        case "js":
            return `// Your debounce implementation here
function debounce(func, wait) {
  // ...
}

const button = document.getElementById('myButton');
const countSpan = document.getElementById('count');
let count = 0;

button.addEventListener('click', () => {
  count++;
  countSpan.innerText = count;
  // Example usage of your debounce function would go here
});`;
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
    problem: {
        technologies: string[];
    }
};

export default function CodeEditor({ problem }: CodeEditorProps) {
  const technologies = useMemo(() => problem.technologies || ["JS"], [problem.technologies]);
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

  const handleSubmit = () => {
    setShowConfirmDialog(false);
    console.log(codes);
    toast({
      title: "Submission Successful!",
      description: "Your code has been submitted for review.",
    });
    setIsSubmitted(true);
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
              <TabsList className={`grid w-full max-w-xs grid-cols-${technologies.length}`}>
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
                            value={codes[lowerTech]}
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
