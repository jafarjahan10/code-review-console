
'use client';
import { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Eye, Search, ArrowUpDown, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Submission, Candidate, Problem } from '@/types';
import ClientDateTime from '@/components/client-date-time';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';

const toDate = (timestamp: any): Date | undefined => {
    if (!timestamp) return undefined;
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return timestamp;
};


export default function SubmissionsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { adminUser } = useUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{key: string; direction: string}>({ key: 'submissionTime', direction: 'desc' });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [submissionToDelete, setSubmissionToDelete] = useState<Submission | null>(null);
  
  const submissionsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'submissions') : null, [firestore]);
  const { data: submissions, isLoading: isLoadingSubmissions } = useCollection<Submission>(submissionsColRef);
  
  const candidatesColRef = useMemoFirebase(() => firestore ? collection(firestore, 'candidates') : null, [firestore]);
  const { data: candidates, isLoading: isLoadingCandidates } = useCollection<Candidate>(candidatesColRef);
  
  const problemsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'problems') : null, [firestore]);
  const { data: problems, isLoading: isLoadingProblems } = useCollection<Problem>(problemsColRef);

  const candidatesMap = useMemo(() => {
    if (!candidates) return new Map();
    return new Map(candidates.map(c => [c.id, c]));
  }, [candidates]);

  const problemsMap = useMemo(() => {
    if (!problems) return new Map();
    return new Map(problems.map(p => [p.id, p]));
  }, [problems]);

  const enrichedSubmissions = useMemo(() => {
    if (!submissions || !candidatesMap.size || !problemsMap.size) return [];
    
    return submissions.map(sub => ({
      ...sub,
      candidate: candidatesMap.get(sub.candidateId),
      problem: problemsMap.get(sub.problemId),
    }));
  }, [submissions, candidatesMap, problemsMap]);


  const filteredAndSortedSubmissions = useMemo(() => {
    if (!enrichedSubmissions) return [];

    let filtered = enrichedSubmissions.filter(sub => {
        const candidateName = sub.candidate?.name?.toLowerCase() || '';
        const candidateEmail = sub.candidate?.email?.toLowerCase() || '';
        const problemTitle = sub.problem?.title?.toLowerCase() || '';
        return candidateName.includes(searchTerm.toLowerCase()) || 
               candidateEmail.includes(searchTerm.toLowerCase()) || 
               problemTitle.includes(searchTerm.toLowerCase());
    });

    filtered.sort((a, b) => {
        let valA, valB;
        
        switch (sortConfig.key) {
            case 'candidateName':
                valA = a.candidate?.name || '';
                valB = b.candidate?.name || '';
                break;
            case 'problemTitle':
                valA = a.problem?.title || '';
                valB = b.problem?.title || '';
                break;
            case 'remarks':
                valA = a.remarks?.length || 0;
                valB = b.remarks?.length || 0;
                break;
            case 'submissionTime':
            default:
                valA = toDate(a.submissionTime)?.getTime() || 0;
                valB = toDate(b.submissionTime)?.getTime() || 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return filtered;

  }, [enrichedSubmissions, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedSubmissions.length / itemsPerPage);
  const paginatedSubmissions = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredAndSortedSubmissions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedSubmissions, page, itemsPerPage]);

  const handleSort = (column: string) => {
    setSortConfig(currentSort => ({
      key: column,
      direction: currentSort.key === column && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1); // Reset to first page on sort change
  };

  const handleDelete = async () => {
    if (!submissionToDelete || !firestore) return;

    try {
        const submissionRef = doc(firestore, 'submissions', submissionToDelete.id);
        await deleteDoc(submissionRef);
        toast({
            title: "Submission Deleted",
            description: `The submission has been successfully deleted.`,
        });
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error.message,
        });
    } finally {
        setSubmissionToDelete(null);
    }
  };
  
  const isLoading = isLoadingSubmissions || isLoadingCandidates || isLoadingProblems;

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Submissions
            </h2>
            <p className="text-muted-foreground">
              Review and manage all candidate submissions.
            </p>
          </div>
        </div>

        <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search by candidate, problem..."
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
                  <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('candidateName')}>
                          Candidate <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                      </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <Button variant="ghost" onClick={() => handleSort('problemTitle')}>
                          Problem <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                      </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <Button variant="ghost" onClick={() => handleSort('remarks')}>
                          Remarks <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                      </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <Button variant="ghost" onClick={() => handleSort('submissionTime')}>
                          Submitted At <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                      </Button>
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({length: 5}).map((_, i) => (
                      <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-1/2" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-1/4" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-1/4" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                  ))
                ) : paginatedSubmissions.length > 0 ? (
                  paginatedSubmissions.map((submission: any) => {
                  return (
                  <TableRow key={submission.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={`https://avatar.vercel.sh/${submission.candidate?.email}.png`} alt="Avatar" />
                          <AvatarFallback>{submission.candidate?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                          <p className="font-medium">{submission.candidate?.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground hidden md:inline">
                            {submission.candidate?.email || 'No email'}
                          </p>
                          <div className="md:hidden text-sm text-muted-foreground">
                            <p>{submission.problem?.title || 'N/A'}</p>
                            <p>Remarks: {submission.remarks?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap hidden md:table-cell">{submission.problem?.title || 'N/A'}</TableCell>
                    <TableCell className="whitespace-nowrap hidden md:table-cell text-center">
                      {submission.remarks?.length || 0}
                    </TableCell>
                    <TableCell className="whitespace-nowrap hidden md:table-cell">
                      <ClientDateTime date={toDate(submission.submissionTime) || new Date()} />
                    </TableCell>
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
                            <Link href={`/admin/submissions/${submission.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Submission
                            </Link>
                          </DropdownMenuItem>
                          {adminUser?.role === 'Admin' && (
                            <DropdownMenuItem className="text-destructive" onClick={() => setSubmissionToDelete(submission)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No submissions found.
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
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
              >
                  Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
              </span>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages || totalPages === 0}
              >
                  Next
              </Button>
          </div>
      </div>
      <AlertDialog open={!!submissionToDelete} onOpenChange={(isOpen) => !isOpen && setSubmissionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the submission and all its data.
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
