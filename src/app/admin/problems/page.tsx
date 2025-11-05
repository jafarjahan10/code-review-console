
'use client';

import { useState, useMemo } from "react";
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
import { PlusCircle, MoreHorizontal, File, Pencil, Trash2, Search, ArrowUpDown } from "lucide-react";
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
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, deleteDoc, doc } from "firebase/firestore";
import type { Problem, Position, Technology } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function ProblemsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [problemToDelete, setProblemToDelete] = useState<Problem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const problemsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'problems') : null, [firestore]);
  const { data: problems, isLoading: isLoadingProblems } = useCollection<Problem>(problemsColRef);
  
  const positionsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'positions') : null, [firestore]);
  const { data: positions, isLoading: isLoadingPositions } = useCollection<Position>(positionsColRef);

  const positionsMap = useMemo(() => {
    if (!positions) return new Map();
    return new Map(positions.map(p => [p.id, p.title]));
  }, [positions]);

  const filteredAndSortedProblems = useMemo(() => {
    if (!problems) return [];
    
    let filtered = problems.filter(problem => {
        const positionName = positionsMap.get(problem.positionId) || '';
        const technologies = problem.tags?.join(' ') || '';
        return problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               problem.difficulty.toLowerCase().includes(searchTerm.toLowerCase()) ||
               technologies.toLowerCase().includes(searchTerm.toLowerCase());
    });

    filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Problem] ?? '';
        const bValue = b[sortConfig.key as keyof Problem] ?? '';
        
        if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    return filtered;
  }, [problems, searchTerm, sortConfig, positionsMap]);

  const totalPages = Math.ceil(filteredAndSortedProblems.length / itemsPerPage);
  const paginatedProblems = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredAndSortedProblems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProblems, page, itemsPerPage]);

  const requestSort = (key: keyof Problem) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const handleDelete = async () => {
    if (!problemToDelete || !firestore) return;

    try {
        await deleteDoc(doc(firestore, "problems", problemToDelete.id));
        toast({
            title: "Problem Deleted",
            description: `The problem "${problemToDelete.title}" has been successfully deleted.`,
        });
    } catch(error: any) {
         toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error.message,
        });
    } finally {
        setProblemToDelete(null);
    }
  };
  
  const isLoading = isLoadingProblems || isLoadingPositions;

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

        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                }}
                className="pl-8 w-full max-w-sm"
            />
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('title')}>
                    Title <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                  </TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Technologies</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('difficulty')}>
                    Difficulty <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    Array.from({length: itemsPerPage}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : paginatedProblems.length > 0 ? (
                  paginatedProblems.map((problem) => (
                    <TableRow key={problem.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {problem.title}
                      </TableCell>
                       <TableCell className="whitespace-nowrap text-muted-foreground">
                        {positionsMap.get(problem.positionId) || 'N/A'}
                       </TableCell>
                       <TableCell className="whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                              {(problem.tags || []).map(tag => <Badge variant="secondary" key={tag}>{tag}</Badge>)}
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
                      <TableCell className="text-right">
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
                              <Link href={`/admin/problems/${problem.id}`}>
                                <File className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/problems/${problem.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No problems found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
            >
                Previous
            </Button>
             <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
            >
                Next
            </Button>
        </div>
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

    