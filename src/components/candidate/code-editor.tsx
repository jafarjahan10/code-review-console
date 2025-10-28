
"use client"
import { useState } from "react";
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

const initialHtml = `<h1>Code Challenge</h1>
<p>Implement your solution below and see the live preview.</p>
<button id="myButton">Click me</button>
<p>Button clicked <span id="count">0</span> times.</p>`;

const initialCss = `body {
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

const initialJs = `// Your debounce implementation here
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

export default function CodeEditor() {
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    setShowConfirmDialog(false);
    console.log({ html, css, js });
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
          <Tabs defaultValue="javascript" className="flex-1 flex flex-col">
            <CardHeader className="flex-row items-center justify-between gap-4">
              <TabsList className="grid w-full max-w-xs grid-cols-3">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="javascript">JS</TabsTrigger>
              </TabsList>
              {!isSubmitted && (
                <Button onClick={() => setShowConfirmDialog(true)} className="!space-y-0 h-[40px] !m-0">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Solution
                </Button>
              )}
            </CardHeader>
            <div className="flex-1 p-1 pt-0">
              <TabsContent value="html" className="h-full m-0">
                <Editor
                  value={html}
                  onValueChange={(code) => setHtml(code)}
                  highlight={(code) => highlight(code, languages.markup, "markup")}
                  padding={10}
                  style={editorStyles}
                  className="font-code h-full resize-none text-sm"
                  readOnly={isSubmitted}
                />
              </TabsContent>
              <TabsContent value="css" className="h-full m-0">
                <Editor
                  value={css}
                  onValueChange={(code) => setCss(code)}
                  highlight={(code) => highlight(code, languages.css, "css")}
                  padding={10}
                  style={editorStyles}
                  className="font-code h-full resize-none text-sm"
                  readOnly={isSubmitted}
                />
              </TabsContent>
              <TabsContent value="javascript" className="h-full m-0">
                <Editor
                  value={js}
                  onValueChange={(code) => setJs(code)}
                  highlight={(code) => highlight(code, languages.js, "javascript")}
                  padding={10}
                  style={editorStyles}
                  className="font-code h-full resize-none text-sm"
                  readOnly={isSubmitted}
                />
              </TabsContent>
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
