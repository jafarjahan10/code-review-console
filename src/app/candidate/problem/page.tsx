
'use client';

import { useEffect } from 'react';
import CodeEditor from "@/components/candidate/code-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";


// Mock data
const MOCK_PROBLEM = {
  id: "prob_123",
  title: "Implement a Debounce Function",
  difficulty: "Medium",
  description: "Your task is to implement a debounce function in JavaScript. The function should delay invoking a passed-in function until after `wait` milliseconds have elapsed since the last time it was invoked.\n\nThe debounced function should come with a `cancel` method to cancel delayed function invocations and a `flush` method to immediately invoke them.",
  details: [
    "It should not immediately call the function.",
    "It should call the function only once after the wait time.",
    "It should reset the timer on subsequent calls.",
    "The `cancel` method should prevent the function from being called.",
    "The `flush` method should call the function immediately."
  ],
  technologies: ["HTML", "CSS", "JS"]
};

export default function ProblemPage() {

   useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
      }
      // Prevent Cmd+Opt+I, Cmd+Opt+J on Mac
      if (e.metaKey && e.altKey && ['I', 'J'].includes(e.key.toUpperCase())) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);


  return (
    <div className="grid md:grid-cols-2 gap-4 p-4 no-scrollbar overflow-y-auto select-none" style={{height: 'calc(100dvh - 64px)'}} onContextMenu={(e) => e.preventDefault()}>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{MOCK_PROBLEM.title}</CardTitle>
          <CardDescription>Difficulty: {MOCK_PROBLEM.difficulty}</CardDescription>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent>
            <p className="text-foreground mb-4">{MOCK_PROBLEM.description}</p>
            <h3 className="font-semibold text-lg mb-2">Requirements:</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {MOCK_PROBLEM.details.map((detail, i) => <li key={i}>{detail}</li>)}
            </ul>
          </CardContent>
        </ScrollArea>
      </Card>

      <CodeEditor problem={MOCK_PROBLEM} />
    </div>
  );
}

