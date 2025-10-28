import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Mock data for problems
const problems = [
  {
    id: "prob_1",
    title: "FizzBuzz Challenge",
    difficulty: "Easy",
    submissions: 25,
    createdAt: "2024-05-10",
  },
  {
    id: "prob_2",
    title: "Palindrome Checker",
    difficulty: "Easy",
    submissions: 38,
    createdAt: "2024-05-12",
  },
  {
    id: "prob_3",
    title: "Two Sum",
    difficulty: "Medium",
    submissions: 52,
    createdAt: "2024-05-15",
  },
  {
    id: "prob_4",
    title: "Implement a Debounce Function",
    difficulty: "Medium",
    submissions: 15,
    createdAt: "2024-05-20",
  },
  {
    id: "prob_5",
    title: "Binary Tree Traversal",
    difficulty: "Hard",
    submissions: 8,
    createdAt: "2024-05-22",
  },
];

export default function ProblemsPage() {
  return (
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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Problem
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problem List</CardTitle>
          <CardDescription>
            A list of all coding problems in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Title</TableHead>
                <TableHead className="whitespace-nowrap">Difficulty</TableHead>
                <TableHead className="whitespace-nowrap">Submissions</TableHead>
                <TableHead className="whitespace-nowrap">Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell className="font-medium whitespace-nowrap">{problem.title}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        problem.difficulty === "Easy"
                          ? "secondary"
                          : problem.difficulty === "Medium"
                          ? "outline"
                          : "default"
                      }
                      className={
                        problem.difficulty === "Hard"
                          ? "bg-destructive text-destructive-foreground hover:bg-destructive/80"
                          : ""
                      }
                    >
                      {problem.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{problem.submissions}</TableCell>
                  <TableCell className="whitespace-nowrap">{problem.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                           <File className="mr-2 h-4 w-4" />
                           View
                        </DropdownMenuItem>
                         <DropdownMenuItem className="text-destructive">
                           <Trash2 className="mr-2 h-4 w-4" />
                           Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
