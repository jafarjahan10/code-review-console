
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Eye, Search, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Submission, Candidate, Problem } from '@/types';
import ClientDateTime from '@/components/client-date-time';

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
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort, setSort] = useState<{ by: string, order: 'asc' | 'desc' }>({ by: 'submissionTime', order: 'desc' });
  const [hasNextPage, setHasNextPage] = useState(false);


  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: searchTerm,
        sortBy: sort.by,
        sortOrder: sort.order,
      });
      const response = await fetch(`/api/submissions?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data.submissions);
      setHasNextPage(data.hasNextPage);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to load submissions',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm, sort, toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleSort = (column: string) => {
    setSort(currentSort => ({
      by: column,
      order: currentSort.by === column && currentSort.order === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1); // Reset to first page on sort change
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };


  return (
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
                onChange={handleSearchChange}
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
                    <Button variant="ghost" onClick={() => handleSort('status')}>
                        Status <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
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
              ) : submissions.map((submission: any) => {
                const status = submission.candidate?.status || 'Pending';
                
                return (
                <TableRow key={submission.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={`https://avatar.vercel.sh/${submission.candidate?.email}.png`} alt="Avatar" />
                        <AvatarFallback>{submission.candidate?.name.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p className="font-medium">{submission.candidate?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground hidden md:inline">
                          {submission.candidate?.email || 'No email'}
                        </p>
                         <div className="md:hidden text-sm text-muted-foreground">
                          <p>{submission.problem?.title || 'N/A'}</p>
                           <Badge 
                              variant={status === 'Completed' ? 'default' : 'destructive'}
                              className={`mt-1 ${status === 'Completed' ? 'bg-green-600 hover:bg-green-600/80' : ''}`}
                            >
                              {status}
                            </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">{submission.problem?.title || 'N/A'}</TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">
                    <Badge 
                      variant={status === 'Completed' ? 'default' : 'destructive'}
                      className={status === 'Completed' ? 'bg-green-600 hover:bg-green-600/80' : ''}
                    >
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">
                    <ClientDateTime date={toDate(submission.submissionTime)} />
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
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
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!hasNextPage}
            >
                Next
            </Button>
        </div>
    </div>
  );
}
