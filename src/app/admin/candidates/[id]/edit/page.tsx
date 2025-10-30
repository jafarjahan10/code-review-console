
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
import { ArrowLeft, Copy, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';

const initialCandidates = [
  {
    id: "cand_1",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Pending",
    problemAssigned: "FizzBuzz Challenge",
    problemId: "prob_1",
    positionId: "pos_1",
    accessCode: "FJ8K2L",
    scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cand_2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "Completed",
    problemAssigned: "Palindrome Checker",
    problemId: "prob_2",
    positionId: "pos_2",
    accessCode: "G4H9J1",
    scheduledTime: new Date().toISOString(),
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
  const [accessCode, setAccessCode] = useState('');
  const [scheduledTime, setScheduledTime] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);


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
      setAccessCode(candidateToEdit.accessCode);
      if (candidateToEdit.scheduledTime) {
        setScheduledTime(new Date(candidateToEdit.scheduledTime));
      }
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

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setPositionId('');
    setProblemId('');
  }

  const handlePositionChange = (value: string) => {
    setPositionId(value);
    setProblemId('');
  }
  
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
        setScheduledTime(undefined);
        setIsCalendarOpen(false);
        return;
    }
    const currentHours = scheduledTime ? scheduledTime.getHours() : new Date().getHours();
    const currentMinutes = scheduledTime ? scheduledTime.getMinutes() : new Date().getMinutes();
    const newDate = setMinutes(setHours(date, currentHours), currentMinutes);
    setScheduledTime(newDate);
    setIsCalendarOpen(false);
  };
  
  const handleTimeChange = (value: string, unit: 'hours' | 'minutes') => {
      let newDate = scheduledTime || new Date();
      if (unit === 'hours') {
          newDate = setHours(newDate, parseInt(value));
      } else {
          newDate = setMinutes(newDate, parseInt(value));
      }
      setScheduledTime(newDate);
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email || !status || !department || !positionId || !problemId || !scheduledTime) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields before updating.',
      });
      return;
    }
    // In a real app, you would handle the API submission here.
    console.log({ id: params.id, name, email, status, department, positionId, problemId, accessCode, scheduledTime: scheduledTime.toISOString() });
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                 <div className="grid gap-2">
                    <Label htmlFor="access-code">Access Code</Label>
                    <div className="flex items-center gap-2">
                        <Input id="access-code" value={accessCode} readOnly className="font-mono bg-muted" />
                        <Button type="button" variant="outline" size="icon" onClick={() => handleCopy(accessCode)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                 </div>
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
            <div className="grid md:grid-cols-2 gap-4">
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
                <div className="grid gap-2">
                    <Label>Test Time</Label>
                    <div className="grid grid-cols-3 gap-2">
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                            <Button
                                id="test-time"
                                variant={"outline"}
                                className={cn(
                                "col-span-3 sm:col-span-1 justify-start text-left font-normal",
                                !scheduledTime && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {scheduledTime ? format(scheduledTime, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={scheduledTime}
                                onSelect={handleDateSelect}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                         <Select
                            onValueChange={(value) => handleTimeChange(value, 'hours')}
                            value={String(scheduledTime?.getHours() ?? new Date().getHours()).padStart(2, '0')}
                            disabled={!scheduledTime}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="HH" />
                            </SelectTrigger>
                            <SelectContent className="max-h-48">
                                {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(hour => (
                                    <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            onValueChange={(value) => handleTimeChange(value, 'minutes')}
                            value={String(scheduledTime?.getMinutes() ?? new Date().getMinutes()).padStart(2, '0')}
                            disabled={!scheduledTime}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="MM" />
                            </SelectTrigger>
                             <SelectContent className="max-h-48">
                                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(min => (
                                    <SelectItem key={min} value={min}>{min}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
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
