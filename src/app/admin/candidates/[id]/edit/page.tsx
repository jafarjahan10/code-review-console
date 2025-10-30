
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const initialCandidates = [
  {
    id: "cand_1",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Pending",
    problemAssigned: "FizzBuzz Challenge",
    problemId: "prob_1",
    positionId: "pos_1",
  },
  {
    id: "cand_2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "Completed",
    problemAssigned: "Palindrome Checker",
    problemId: "prob_2",
    positionId: "pos_2",
  },
];

const departments = ["Engineering", "Design", "Product", "Marketing", "HR"];

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
    positionId: "pos_1",
  },
  {
    id: "prob_2",
    title: "Palindrome Checker",
    positionId: "pos_2",
  },
  {
    id: "prob_3",
    title: "Two Sum",
    positionId: "pos_1",
  },
  {
    id: "prob_4",
    title: "Implement a Debounce Function",
    positionId: "pos_4",
  },
];


export default function EditCandidatePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [positionId, setPositionId] = useState('');
  const [problemId, setProblemId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const availablePositions = useMemo(() => {
    if (!department) return [];
    return initialPositions.filter(p => p.department === department);
  }, [department]);

  const availableProblems = useMemo(() => {
    if (!positionId) return [];
    return initialProblems.filter(p => p.positionId === positionId);
  }, [positionId]);

  useEffect(() => {
    const candidateId = params.id;
    const candidateToEdit = initialCandidates.find(c => c.id === candidateId);

    if (candidateToEdit) {
      const position = initialPositions.find(p => p.id === candidateToEdit.positionId);
      const department = position?.department || '';
      
      setName(candidateToEdit.name);
      setEmail(candidateToEdit.email);
      setStatus(candidateToEdit.status);
      setProblemId(candidateToEdit.problemId);
      setPositionId(candidateToEdit.positionId);
      setDepartment(department);
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

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setPositionId('');
    setProblemId('');
  }

  const handlePositionChange = (value: string) => {
    setPositionId(value);
    setProblemId('');
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email || !status || !department || !positionId || !problemId) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields before updating.',
      });
      return;
    }
    // In a real app, you would handle the API submission here.
    console.log({ id: params.id, name, email, status, department, positionId, problemId });
    toast({
      title: 'Candidate Updated!',
      description: `The details for "${name}" have been successfully updated.`,
    });
    router.push('/admin/candidates');
  };

  if (isLoading) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <p>Loading...</p>
        </div>
    )
  }
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-start gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin/candidates">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Edit Candidate
          </h2>
          <p className="text-muted-foreground">
            Update the candidate's information and assigned challenge.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={setStatus} value={status}>
                    <SelectTrigger id="status">
                    <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Invited">Invited</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
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
                    <Select onValueChange={handlePositionChange} value={positionId} disabled={!department}>
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
            <div className="grid gap-2">
              <Label htmlFor="problem">Assign Problem</Label>
               <Select onValueChange={setProblemId} value={problemId} disabled={!positionId}>
                  <SelectTrigger id="problem">
                    <SelectValue placeholder="Select a coding problem" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProblems.map((problem) => (
                      <SelectItem key={problem.id} value={problem.id}>
                        {problem.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Update Candidate</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
