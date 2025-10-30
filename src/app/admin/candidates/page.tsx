
'use client';

import { useState } from "react";
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
import { MoreHorizontal, PlusCircle, Trash2, Pencil, Eye, Copy } from "lucide-react";
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


// Mock data for candidates
const initialCandidates = [
  {
    id: "cand_1",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Pending",
    scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    problemAssigned: "FizzBuzz Challenge",
    positionId: "pos_1",
    accessCode: "FJ8K2L",
  },
  {
    id: "cand_2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "Completed",
    scheduledTime: new Date().toISOString(),
    problemAssigned: "Palindrome Checker",
    positionId: "pos_2",
    accessCode: "G4H9J1",
  },
  {
    id: "cand_3",
    name: "Sam Wilson",
    email: "sam.wilson@example.com",
    status: "In Progress",
    scheduledTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    problemAssigned: "Two Sum",
    positionId: "pos_1",
    accessCode: "K2L3M4",
  },
  {
    id: "cand_4",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    status: "Invited",
    scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    problemAssigned: "Implement a Debounce Function",
    positionId: "pos_4",
    accessCode: "N5P6Q7",
  },
];

const initialPositions = [
  { id: "pos_1", title: "Senior Frontend Developer", department: "Engineering" },
  { id: "pos_2", title: "UX/UI Designer", department: "Design" },
  { id: "pos_3", title: "Product Manager", department: "Product" },
  { id: "pos_4", title: "Junior Backend Developer", department: "Engineering" },
];


type Candidate = typeof initialCandidates[0];

export default function CandidatesPage() {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);

  const handleDelete = () => {
    if (!candidateToDelete) return;

    // In a real app, you would make an API call here.
    setCandidates(candidates.filter((c) => c.id !== candidateToDelete.id));
    toast({
      title: "Candidate Removed",
      description: `The candidate "${candidateToDelete.name}" has been successfully removed.`,
    });
    setCandidateToDelete(null);
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "The access code has been copied.",
    });
  };


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

        <Card>
          <CardContent className="pt-6">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Candidate</TableHead>
                    <TableHead className="whitespace-nowrap">Position</TableHead>
                    <TableHead className="whitespace-nowrap">Problem Assigned</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">Access Code</TableHead>
                    <TableHead className="whitespace-nowrap">Scheduled For</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => {
                    const position = initialPositions.find(p => p.id === candidate.positionId);
                    const scheduledDateTime = new Date(candidate.scheduledTime);
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
                        {position?.title || 'N/A'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{candidate.problemAssigned}</TableCell>
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
                      <TableCell className="whitespace-nowrap">{scheduledDateTime.toLocaleDateString()}</TableCell>
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
               {candidates.map((candidate) => {
                 const position = initialPositions.find(p => p.id === candidate.positionId);
                 const scheduledDateTime = new Date(candidate.scheduledTime);
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
                          <p className="text-sm text-muted-foreground">{position?.title || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{candidate.problemAssigned}</p>
                           <p className="text-sm text-muted-foreground">Scheduled: {scheduledDateTime.toLocaleDateString()}</p>
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
