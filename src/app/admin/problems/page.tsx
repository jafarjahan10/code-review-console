
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, File, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const initialPositions = [
  { id: "pos_1", title: "Senior Frontend Developer", department: "Engineering" },
  { id: "pos_2", title: "UX/UI Designer", department: "Design" },
  { id: "pos_3", title: "Product Manager", department: "Product" },
  { id: "pos_4", title: "Junior Backend Developer", department: "Engineering" },
];

const initialProblems = [
  {
    id: "prob_1",
    title: "FizzBuzz Challenge",
    difficulty: "Easy",
    submissions: 25,
    createdAt: "2024-05-10",
    technologies: ["JS"],
    positionId: "pos_1",
  },
  {
    id: "prob_2",
    title: "Palindrome Checker",
    difficulty: "Easy",
    submissions: 38,
    createdAt: "2024-05-12",
    technologies: ["JS"],
     positionId: "pos_2",
  },
  {
    id: "prob_3",
    title: "Two Sum",
    difficulty: "Medium",
    submissions: 52,
    createdAt: "2024-05-15",
    technologies: ["JS"],
     positionId: "pos_1",
  },
  {
    id: "prob_4",
    title: "Implement a Debounce Function",
    difficulty: "Medium",
    submissions: 15,
    createdAt: "2024-05-20",
    technologies: ["HTML", "CSS", "JS"],
    positionId: "pos_4",
  },
  {
    id: "prob_5",
    title: "Binary Tree Traversal",
    difficulty: "Hard",
    submissions: 8,
    createdAt: "2024-05-22",
    technologies: ["JS"],
     positionId: "pos_1",
  },
];

type Problem = typeof initialProblems[0];

export default function ProblemsPage() {
  const { toast } = useToast();
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [problemToDelete, setProblemToDelete] = useState<Problem | null>(null);

  const handleDelete = () => {
    if (!problemToDelete) return;

    setProblems(problems.filter((p) => p.id !== problemToDelete.id));
    toast({
      title: "Problem Deleted",
      description: `The problem "${problemToDelete.title}" has been successfully deleted.`,
    });
    setProblemToDelete(null);
  };

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Problems
            </h2>
            <p className="text-muted-foreground">
              Manage your coding challenges here.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/admin/problems/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Problem
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Title</TableHead>
                  <TableHead className="whitespace-nowrap">Position</TableHead>
                  <TableHead className="whitespace-nowrap">Technologies</TableHead>
                  <TableHead className="whitespace-nowrap">Difficulty</TableHead>
                  <TableHead className="whitespace-nowrap">Submissions</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems.map((problem) => {
                  const position = initialPositions.find(p => p.id === problem.positionId);
                  return (
                    <TableRow key={problem.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {problem.title}
                      </TableCell>
                       <TableCell className="whitespace-nowrap text-muted-foreground">
                        {position?.title || 'N/A'}
                       </TableCell>
                       <TableCell className="whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                              {problem.technologies.map(tech => <Badge variant="secondary" key={tech}>{tech}</Badge>)}
                          </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
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
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {problem.submissions}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/problems/${problem.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/problems/${problem.id}`}>
                                <File className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setProblemToDelete(problem)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
             <div className="md:hidden space-y-4">
              {problems.map((problem) => {
                const position = initialPositions.find(p => p.id === problem.positionId);
                return (
                  <Card key={problem.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{problem.title}</p>
                        <p className="text-sm text-muted-foreground">{position?.title || 'N/A'}</p>
                         <div className="flex flex-wrap gap-1 my-1">
                              {problem.technologies.map(tech => <Badge variant="secondary" key={tech}>{tech}</Badge>)}
                          </div>
                        <p className="text-sm text-muted-foreground">Submissions: {problem.submissions}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/problems/${problem.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/problems/${problem.id}`}>
                              <File className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setProblemToDelete(problem)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                     <Badge
                        variant={
                          problem.difficulty === "Easy"
                            ? "default"
                            : problem.difficulty === "Medium"
                            ? "default"
                            : "destructive"
                        }
                        className={`mt-2 ${
                          problem.difficulty === "Easy"
                            ? "bg-green-600 hover:bg-green-600/80"
                            : problem.difficulty === "Medium"
                            ? "bg-orange-600 hover:bg-orange-600/80"
                            : ""
                        }`}
                      >
                        {problem.difficulty}
                      </Badge>
                  </Card>
                )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!problemToDelete} onOpenChange={(isOpen) => !isOpen && setProblemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              problem &quot;{problemToDelete?.title}&quot; and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
