
'use client';

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Trash2, Pencil, Eye, Copy, Search, ArrowUpDown } from "lucide-react";
import Link from "next/link";
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
import { useToast } from "@/hooks/use-toast";
import ClientDateTime from "@/components/client-date-time";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, deleteDoc } from "firebase/firestore";
import type { Candidate, Position, Problem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";


export default function CandidatesPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const candidatesColRef = useMemoFirebase(() => firestore ? collection(firestore, 'candidates') : null, [firestore]);
  const { data: candidates, isLoading: isLoadingCandidates } = useCollection<Candidate>(candidatesColRef);

  const positionsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'positions') : null, [firestore]);
  const { data: positions, isLoading: isLoadingPositions } = useCollection<Position>(positionsColRef);
  
  const problemsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'problems') : null, [firestore]);
  const { data: problems, isLoading: isLoadingProblems } = useCollection<Problem>(problemsColRef);

  const positionsMap = useMemo(() => {
    if (!positions) return new Map();
    return new Map(positions.map(p => [p.id, p.title]));
  }, [positions]);
  
  const problemsMap = useMemo(() => {
    if (!problems) return new Map();
    return new Map(problems.map(p => [p.id, p.title]));
  }, [problems]);
  
  const filteredAndSortedCandidates = useMemo(() => {
    if (!candidates) return [];

    let filtered = candidates.filter(candidate => {
        const positionName = positionsMap.get(candidate.positionId) || '';
        const problemName = problemsMap.get(candidate.problemId) || '';

        return candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               problemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               candidate.status.toLowerCase().includes(searchTerm.toLowerCase());
    });

    filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Candidate] ?? '';
        const bValue = b[sortConfig.key as keyof Candidate] ?? '';
        
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    return filtered;

  }, [candidates, searchTerm, sortConfig, positionsMap, problemsMap]);
  
  const totalPages = Math.ceil(filteredAndSortedCandidates.length / itemsPerPage);
  const paginatedCandidates = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredAndSortedCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCandidates, page, itemsPerPage]);
  
  const requestSort = (key: keyof Candidate) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setPage(1);
  };

  const handleDelete = async () => {
    if (!candidateToDelete || !firestore) return;

    try {
        await deleteDoc(doc(firestore, "candidates", candidateToDelete.id));
        toast({
            title: "Candidate Removed",
            description: `The candidate "${candidateToDelete.name}" has been successfully removed.`,
        });
    } catch(error: any) {
         toast({
            variant: "destructive",
            title: "Removal Failed",
            description: error.message,
        });
    } finally {
        setCandidateToDelete(null);
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "The access code has been copied.",
    });
  };

  const isLoading = isLoadingCandidates || isLoadingPositions || isLoadingProblems;

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Candidates
            </h2>
            <p className="text-muted-foreground">
              Manage your candidates.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/admin/candidates/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Add Candidate</span>
                 <span className="inline md:hidden">Add</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by name, email, position..."
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
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap cursor-pointer" onClick={() => requestSort('name')}>
                        Candidate <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Position</TableHead>
                    <TableHead className="whitespace-nowrap">Problem Assigned</TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer" onClick={() => requestSort('status')}>
                        Status <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Access Code</TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer" onClick={() => requestSort('scheduledTime')}>
                        Scheduled For <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
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
                            <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                  ) : paginatedCandidates.map((candidate) => {
                    return (
                    <TableRow key={candidate.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage src={`https://avatar.vercel.sh/${candidate.email}.png`} alt="Avatar" />
                            <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {candidate.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                       <TableCell className="whitespace-nowrap text-muted-foreground">
                        {positionsMap.get(candidate.positionId) || 'N/A'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{problemsMap.get(candidate.problemId) || 'N/A'}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={
                            candidate.status === 'Completed' ? 'default' :
                            candidate.status === 'Pending' ? 'default' :
                            candidate.status === 'In Progress' ? 'default' : 'secondary'
                          }
                          className={
                            candidate.status === 'Completed' ? 'bg-green-600 hover:bg-green-600/80' :
                            candidate.status === 'Pending' ? 'bg-orange-600 hover:bg-orange-600/80' :
                            candidate.status === 'In Progress' ? 'bg-blue-600 hover:bg-blue-600/80' : ''
                          }
                          >
                          {candidate.status}
                        </Badge>
                      </TableCell>
                       <TableCell className="whitespace-nowrap font-mono">
                        <div className="flex items-center gap-2">
                           <span>{candidate.accessCode}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(candidate.accessCode)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap"><ClientDateTime date={candidate.scheduledTime} /></TableCell>
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
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/candidates/${candidate.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/candidates/${candidate.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setCandidateToDelete(candidate)}>
                               <Trash2 className="mr-2 h-4 w-4" />
                               Remove
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
               {paginatedCandidates.map((candidate) => {
                 const position = positionsMap.get(candidate.positionId);
                 return (
                <Card key={candidate.id} className="p-4">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://avatar.vercel.sh/${candidate.email}.png`} alt="Avatar" />
                            <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        <div className="w-full">
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">{position || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{problemsMap.get(candidate.problemId) || 'N/A'}</p>
                           <p className="text-sm text-muted-foreground">Scheduled: <ClientDateTime date={candidate.scheduledTime} /></p>
                          <div className="flex items-center gap-2 mt-1 font-mono text-sm">
                            <span>{candidate.accessCode}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(candidate.accessCode)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                           <Badge variant={
                              candidate.status === 'Completed' ? 'default' :
                              candidate.status === 'Pending' ? 'default' :
                              candidate.status === 'In Progress' ? 'default' : 'secondary'
                            }
                            className={`mt-1 ${
                              candidate.status === 'Completed' ? 'bg-green-600 hover:bg-green-600/80' :
                              candidate.status === 'Pending' ? 'bg-orange-600 hover:bg-orange-600/80' :
                              candidate.status === 'In Progress' ? 'bg-blue-600 hover:bg-blue-600/80' : ''
                            }`}
                            >
                            {candidate.status}
                          </Badge>
                        </div>
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
                              <Link href={`/admin/candidates/${candidate.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/candidates/${candidate.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setCandidateToDelete(candidate)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                   </div>
                </Card>
                 )
                })}
            </div>
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

       <AlertDialog open={!!candidateToDelete} onOpenChange={(isOpen) => !isOpen && setCandidateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the
              candidate &quot;{candidateToDelete?.name}&quot; and all associated data.
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
