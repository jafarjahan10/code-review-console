
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AtSign, Calendar, FileCode, User, Briefcase, Building, KeyRound, Copy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const initialCandidates = [
  {
    id: "cand_1",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Pending",
    invitedAt: "2024-05-20",
    problemAssigned: "FizzBuzz Challenge",
    positionId: "pos_1",
    accessCode: "FJ8K2L",
  },
  {
    id: "cand_2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "Completed",
    invitedAt: "2024-05-18",
    problemAssigned: "Palindrome Checker",
    positionId: "pos_2",
    accessCode: "G4H9J1",
  },
  {
    id: "cand_3",
    name: "Sam Wilson",
    email: "sam.wilson@example.com",
    status: "In Progress",
    invitedAt: "2024-05-22",
    problemAssigned: "Two Sum",
    positionId: "pos_1",
    accessCode: "K2L3M4",
  },
  {
    id: "cand_4",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    status: "Invited",
    invitedAt: "2024-05-23",
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

export default function ViewCandidatePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const position = initialPositions.find(p => p.id === candidate?.positionId);

  useEffect(() => {
    const candidateId = params.id;
    const candidateToView = initialCandidates.find(c => c.id === candidateId);

    if (candidateToView) {
      setCandidate(candidateToView);
    } else {
      toast({
        variant: 'destructive',
        title: 'Candidate not found',
        description: 'The requested candidate could not be found.',
      });
      router.push('/admin/candidates');
    }
    setIsLoading(false);
  }, [params.id, router, toast]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "The access code has been copied.",
    });
  };


  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <p>Loading...</p>
      </div>
    )
  }

  if (!candidate) {
    return (
         <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <p>Candidate not found.</p>
          </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin/candidates">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight font-headline">
            Candidate Details
        </h2>
      </div>

        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={`https://avatar.vercel.sh/${candidate.email}.png`} alt="Avatar" />
                        <AvatarFallback className="text-3xl">{candidate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <CardTitle className="font-headline text-3xl">{candidate.name}</CardTitle>
                        <CardDescription>
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
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
          <CardContent className="pt-2 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <p className="text-sm font-medium flex items-center"><AtSign className="mr-2 h-4 w-4 text-muted-foreground" /> Email</p>
                <p className="text-muted-foreground">{candidate.email}</p>
            </div>
             <div className="space-y-2">
                <p className="text-sm font-medium flex items-center"><Calendar className="mr-2 h-4 w-4 text-muted-foreground" /> Invited At</p>
                <p className="text-muted-foreground">{candidate.invitedAt}</p>
            </div>
             <div className="space-y-2">
                <p className="text-sm font-medium flex items-center"><FileCode className="mr-2 h-4 w-4 text-muted-foreground" /> Problem Assigned</p>
                <p className="text-muted-foreground">{candidate.problemAssigned}</p>
            </div>
             <div className="space-y-2">
                <p className="text-sm font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" /> Position</p>
                <p className="text-muted-foreground">{position?.title || "N/A"}</p>
            </div>
            {position?.department && (
              <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" /> Department</p>
                  <Badge variant="secondary">{position.department}</Badge>
              </div>
            )}
             <div className="space-y-2">
                <p className="text-sm font-medium flex items-center"><KeyRound className="mr-2 h-4 w-4 text-muted-foreground" /> Access Code</p>
                <div className="flex items-center gap-2">
                    <p className="text-muted-foreground font-mono">{candidate.accessCode}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(candidate.accessCode)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

    