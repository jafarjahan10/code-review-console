
'use client';

import { useState, useMemo } from 'react';
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
import { ArrowLeft, Info } from 'lucide-react';
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import 'prismjs/themes/prism-tomorrow.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MultiSelect } from '@/components/ui/multi-select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const initialTechnologies = [
  { id: "tech_1", name: "HTML" },
  { id: "tech_2", name: "CSS" },
  { id: "tech_3", name: "JS" },
  { id: "tech_4", name: "Python" },
];

const departments = ["Engineering", "Design", "Product", "Marketing", "HR"];

const initialPositions = [
  { id: "pos_1", title: "Senior Frontend Developer", department: "Engineering" },
  { id: "pos_2", title: "UX/UI Designer", department: "Design" },
  { id: "pos_3", title: "Product Manager", department: "Product" },
  { id: "pos_4", title: "Junior Backend Developer", department: "Engineering" },
];


export default function NewProblemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('# Hello\n');
  const [difficulty, setDifficulty] = useState('');
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [department, setDepartment] = useState('');
  const [positionId, setPositionId] = useState('');

  const availablePositions = useMemo(() => {
    if (!department) return [];
    return initialPositions.filter(p => p.department === department);
  }, [department]);

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setPositionId('');
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !description || !difficulty || selectedTechnologies.length === 0 || !positionId) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields, including position and technologies.',
      });
      return;
    }
    // In a real app, you would handle the API submission here.
    console.log({ title, description, difficulty, technologies: selectedTechnologies, positionId });
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

  const technologyOptions = initialTechnologies.map(tech => ({
    value: tech.name,
    label: tech.name
  }));


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
            Add New Problem
          </h2>
          <p className="text-muted-foreground">
            Create a new coding challenge for candidates.
          </p>
        </div>
      </div>
       <Alert variant="warning">
        <Info className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          If a Figma link is shared in the description, please ensure it is publicly available for candidates to view.
        </AlertDescription>
      </Alert>

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
             <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select onValueChange={handleDepartmentChange} value={department}>
                        <SelectTrigger id="department">
                            <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                {dept}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="position">Position</Label>
                    <Select onValueChange={setPositionId} value={positionId} disabled={!department}>
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
            <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Technologies</Label>
                    <MultiSelect
                    options={technologyOptions}
                    selected={selectedTechnologies}
                    onChange={setSelectedTechnologies}
                    placeholder="Select technologies..."
                    />
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
                    padding={10}
                    style={editorStyles}
                    className="font-code h-full resize-none text-sm !p-0"
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-2">
                  <div className="prose max-w-none prose-sm dark:prose-invert p-4 rounded-md border min-h-[300px]">
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
