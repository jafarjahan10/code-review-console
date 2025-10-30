
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Layers, Briefcase } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Mock data for problems
const problems = [
  {
    id: "prob_1",
    title: "FizzBuzz Challenge",
    difficulty: "Easy",
    description: "Write a program that prints the numbers from 1 to 100. But for multiples of three print “Fizz” instead of the number and for the multiples of five print “Buzz”. For numbers which are multiples of both three and five print “FizzBuzz”.",
    technologies: ["JS"],
    positionId: "pos_1",
  },
  {
    id: "prob_2",
    title: "Palindrome Checker",
    difficulty: "Easy",
    description: "Write a function that checks if a given string is a palindrome. A palindrome is a word, phrase, number, or other sequence of characters that reads the same backward as forward.",
    technologies: ["JS"],
    positionId: "pos_2",
  },
  {
    id: "prob_3",
    title: "Two Sum",
    difficulty: "Medium",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    technologies: ["JS"],
    positionId: "pos_1",
  },
  {
    id: "prob_4",
    title: "Implement a Debounce Function",
    difficulty: "Medium",
    description: "Your task is to implement a debounce function in JavaScript. The function should delay invoking a passed-in function until after `wait` milliseconds have elapsed since the last time it was invoked.",
    technologies: ["HTML", "CSS", "JS"],
    positionId: "pos_4",
  },
  {
    id: "prob_5",
    title: "Binary Tree Traversal",
    difficulty: "Hard",
    description: "Given a binary tree, write functions to perform preorder, inorder, and postorder traversal.",
    technologies: ["JS"],
    positionId: "pos_1",
  },
];

const initialPositions = [
  { id: "pos_1", title: "Senior Frontend Developer", department: "Engineering" },
  { id: "pos_2", title: "UX/UI Designer", department: "Design" },
  { id: "pos_3", title: "Product Manager", department: "Product" },
  { id: "pos_4", title: "Junior Backend Developer", department: "Engineering" },
];


type Problem = {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  technologies: string[];
  positionId: string;
};

export default function ViewProblemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const position = initialPositions.find(p => p.id === problem?.positionId);

  useEffect(() => {
    const problemId = params.id;
    const problemToView = problems.find(p => p.id === problemId);

    if (problemToView) {
      setProblem(problemToView);
    } else {
      toast({
        variant: 'destructive',
        title: 'Problem not found',
        description: 'The requested problem could not be found.',
      });
      router.push('/admin/problems');
    }
    setIsLoading(false);
  }, [params.id, router, toast]);


  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <p>Loading...</p>
      </div>
    )
  }

  if (!problem) {
    return (
         <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <p>Problem not found.</p>
          </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-start gap-4 mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin/problems">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-3xl">{problem.title}</CardTitle>
                <Badge
                    variant={
                        problem.difficulty === "Easy"
                        ? "default"
                        : problem.difficulty === "Medium"
                        ? "default"
                        : "destructive"
                    }
                    className={
                        problem.difficulty === "Easy"
                        ? "bg-green-600 hover:bg-green-600/80"
                        : problem.difficulty === "Medium"
                        ? "bg-orange-600 hover:bg-orange-600/80"
                        : ""
                    }
                    >
                    {problem.difficulty}
                </Badge>
            </div>
             <div className="flex items-center flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                {position && (
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{position.title}</span>
                    </div>
                )}
                {problem.technologies && problem.technologies.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <div className="flex flex-wrap gap-1">
                           {problem.technologies.map(tech => <Badge variant="secondary" key={tech}>{tech}</Badge>)}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

        <Card>
            <CardHeader>
                <CardTitle>Problem Description</CardTitle>
            </CardHeader>
          <CardContent className="pt-2">
            <div className="prose max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
