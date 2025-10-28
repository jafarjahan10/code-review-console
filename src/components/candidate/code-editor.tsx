"use client"
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

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
  const { toast } = useToast();

  const handleSubmit = () => {
    // Here you would call a server action to submit the code.
    console.log({ html, css, js });
    toast({
      title: "Submission Successful!",
      description: "Your code has been submitted for review.",
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <Tabs defaultValue="javascript" className="flex-1 flex flex-col">
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-4">
                <TabsList className="grid w-full max-w-xs grid-cols-3">
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="javascript">JS</TabsTrigger>
                </TabsList>
            </div>
            <Button onClick={handleSubmit}>
                <Send className="mr-2 h-4 w-4" />
                Submit Solution
            </Button>
          </CardHeader>
          <div className="flex-1 p-1 pt-0">
            <TabsContent value="html" className="h-full m-0">
              <Textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="HTML code"
                className="font-code h-full resize-none text-sm"
              />
            </TabsContent>
            <TabsContent value="css" className="h-full m-0">
              <Textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                placeholder="CSS code"
                className="font-code h-full resize-none text-sm"
              />
            </TabsContent>
            <TabsContent value="javascript" className="h-full m-0">
              <Textarea
                value={js}
                onChange={(e) => setJs(e.target.value)}
                placeholder="JavaScript code"
                className="font-code h-full resize-none text-sm"
              />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
