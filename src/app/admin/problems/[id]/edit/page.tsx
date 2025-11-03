
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import 'prismjs/themes/prism-tomorrow.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MultiSelect } from '@/components/ui/multi-select';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { Department, Position, Problem, Technology } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditProblemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const problemId = params.id as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const problemDocRef = useMemoFirebase(() => (firestore && problemId ? doc(firestore, 'problems', problemId) : null), [firestore, problemId]);
  const { data: problem, isLoading: isLoadingProblem } = useDoc<Problem>(problemDocRef);
  
  const deptsColRef = useMemoFirebase(() => (firestore ? collection(firestore, 'departments') : null), [firestore]);
  const { data: departments, isLoading: isLoadingDepts } = useCollection<Department>(deptsColRef);
  
  const posColRef = useMemoFirebase(() => (firestore ? collection(firestore, 'positions') : null), [firestore]);
  const { data: positions, isLoading: isLoadingPos } = useCollection<Position>(posColRef);

  const techsColRef = useMemoFirebase(() => (firestore ? collection(firestore, 'technologies') : null), [firestore]);
  const { data: technologies, isLoading: isLoadingTechs } = useCollection<Technology>(techsColRef);

  useEffect(() => {
    if (problem) {
      setTitle(problem.title);
      setDescription(problem.description);
      setDifficulty(problem.difficulty);
      setTags(problem.tags || []);
      setDepartmentId(problem.departmentId || '');
      setPositionId(problem.positionId || '');
    }
  }, [problem]);

  const availablePositions = useMemo(() => {
    if (!departmentId || !positions) return [];
    return positions.filter(p => p.departmentId === departmentId);
  }, [departmentId, positions]);

  const handleDepartmentChange = (value: string) => {
    setDepartmentId(value);
    setPositionId('');
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !description || !difficulty || tags.length === 0 || !positionId || !departmentId) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields, including position and technologies.',
      });
      return;
    }
    if (!firestore || !problemId) return;

    setIsSaving(true);
    try {
        const problemDoc = doc(firestore, 'problems', problemId);
        await updateDoc(problemDoc, {
            title,
            description,
            difficulty,
            tags,
            departmentId,
            positionId
        });
        toast({
            title: 'Problem Updated!',
            description: `The problem "${title}" has been successfully updated.`,
        });
        router.push('/admin/problems');
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message,
        });
    } finally {
        setIsSaving(false);
    }
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

  const technologyOptions = useMemo(() => {
    if (!technologies) return [];
    return technologies.map(tech => ({
        value: tech.name,
        label: tech.name
    }));
  }, [technologies]);
  
  const isLoading = isLoadingProblem || isLoadingDepts || isLoadingPos || isLoadingTechs;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin/problems">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Edit Problem
          </h2>
          <p className="text-muted-foreground">
            Update the details of the coding challenge.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-4 pt-6">
             {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select onValueChange={setDifficulty} value={difficulty} disabled={isSaving}>
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
                  <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                          <Label htmlFor="department">Department</Label>
                          <Select onValueChange={handleDepartmentChange} value={departmentId} disabled={isSaving}>
                              <SelectTrigger id="department">
                                  <SelectValue placeholder="Select a department" />
                              </SelectTrigger>
                              <SelectContent>
                                  {(departments || []).map((dept) => (
                                      <SelectItem key={dept.id} value={dept.id}>
                                      {dept.name}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="position">Position</Label>
                          <Select onValueChange={setPositionId} value={positionId} disabled={!departmentId || isSaving}>
                              <SelectTrigger id="position">
                              <SelectValue placeholder="Select a position" />
                              </SelectTrigger>
                              <SelectContent>
                              {availablePositions.map((pos) => (
                                  <SelectItem key={pos.id} value={pos.id}>
                                  {pos.title}
                                  </SelectItem>
                              ))}
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                  <div className="grid gap-2">
                      <Label>Technologies</Label>
                      <MultiSelect
                          options={technologyOptions}
                          selected={tags}
                          onChange={setTags}
                          placeholder="Select technologies..."
                          className={isSaving ? 'pointer-events-none opacity-50' : ''}
                      />
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
                          padding={10}
                          style={editorStyles}
                          className="font-code h-full resize-none text-sm !p-0"
                          disabled={isSaving}
                        />
                      </TabsContent>
                      <TabsContent value="preview" className="mt-2">
                        <div className="prose max-w-none prose-sm dark:prose-invert p-4 rounded-md border min-h-[300px]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{description || "Nothing to preview..."}</ReactMarkdown>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving || isLoading}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Problem
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
