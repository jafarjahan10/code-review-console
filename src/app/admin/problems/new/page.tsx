
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import 'prismjs/themes/prism-tomorrow.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function NewProblemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !description || !difficulty) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields before submitting.',
      });
      return;
    }
    // In a real app, you would handle the API submission here.
    console.log({ title, description, difficulty });
    toast({
      title: 'Problem Created!',
      description: `The problem "${title}" has been successfully created.`,
    });
    router.push('/admin/problems');
  };
  

  const editorStyles = {
    fontFamily: '"Source Code Pro", "Fira Mono", "Courier New", Courier, monospace',
    fontSize: 14,
    backgroundColor: "hsl(var(--card))",
    color: "hsl(var(--foreground))",
    borderRadius: "var(--radius)",
    padding: "1rem",
    minHeight: "300px",
    outline: "none",
    border: "1px solid hsl(var(--border))",
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-start gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin/problems">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Add New Problem
          </h2>
          <p className="text-muted-foreground">
            Create a new coding challenge for candidates.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., FizzBuzz Challenge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select onValueChange={setDifficulty} value={difficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select a difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Markdown)</Label>
              <Tabs defaultValue="write">
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-2">
                   <Editor
                    value={description}
                    onValueChange={(code) => setDescription(code)}
                    highlight={(code) => highlight(code, languages.js, "javascript")}
                    padding={0}
                    style={editorStyles}
                    className="font-code h-full resize-none text-sm"
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-2">
                  <div className="prose prose-sm dark:prose-invert p-4 rounded-md border min-h-[300px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{description || "Nothing to preview..."}</ReactMarkdown>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Submit Problem</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
