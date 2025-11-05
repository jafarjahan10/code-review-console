
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
import { ArrowLeft, Copy, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, setHours, setMinutes, setDate, setMonth, setYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, collection } from 'firebase/firestore';
import type { Candidate, Department, Position, Problem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function EditCandidatePage() {
  const router = useRouter();
  const { id: candidateId } = useParams() as { id: string };
  const { toast } = useToast();
  const firestore = useFirestore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [problemId, setProblemId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [scheduledTime, setScheduledTime] = useState<Date | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const candidateDocRef = useMemoFirebase(() => (firestore && candidateId ? doc(firestore, 'candidates', candidateId) : null), [firestore, candidateId]);
  const { data: candidate, isLoading: isLoadingCandidate, error: candidateError } = useDoc<Candidate>(candidateDocRef);

  const deptsColRef = useMemoFirebase(() => (firestore ? collection(firestore, 'departments') : null), [firestore]);
  const { data: departments, isLoading: isLoadingDepts } = useCollection<Department>(deptsColRef);
  
  const posColRef = useMemoFirebase(() => (firestore ? collection(firestore, 'positions') : null), [firestore]);
  const { data: positions, isLoading: isLoadingPos } = useCollection<Position>(posColRef);

  const problemsColRef = useMemoFirebase(() => (firestore ? collection(firestore, 'problems') : null), [firestore]);
  const { data: problems, isLoading: isLoadingProblems } = useCollection<Problem>(problemsColRef);

  useEffect(() => {
    if (candidate) {
      setName(candidate.name);
      setEmail(candidate.email);
      setStatus(candidate.status);
      setDepartmentId(candidate.departmentId);
      setPositionId(candidate.positionId);
      setProblemId(candidate.problemId);
      setAccessCode(candidate.accessCode);
      if (candidate.scheduledTime?.toDate) {
          setScheduledTime(candidate.scheduledTime.toDate());
      } else if (candidate.scheduledTime) {
          setScheduledTime(new Date(candidate.scheduledTime));
      }
    }
  }, [candidate]);
  
  useEffect(() => {
    if(candidateError) {
      toast({
        variant: 'destructive',
        title: 'Candidate not found',
        description: 'The requested candidate could not be found.',
      });
      router.push('/admin/candidates');
    }
  }, [candidateError, router, toast]);

  const availablePositions = useMemo(() => {
    if (!departmentId || !positions) return [];
    return positions.filter(p => p.departmentId === departmentId);
  }, [departmentId, positions]);

  const availableProblems = useMemo(() => {
    if (!positionId || !problems) return [];
    return problems.filter(p => p.positionId === positionId);
  }, [positionId, problems]);

  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "The access code has been copied.",
    });
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentId(value);
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
    const currentScheduledTime = scheduledTime || new Date();
    const newDateWithTime = setYear(
        setMonth(
            setDate(currentScheduledTime, date.getDate()), 
            date.getMonth()
        ), 
        date.getFullYear()
    );
    setScheduledTime(newDateWithTime);
    setIsCalendarOpen(false);
  };
  
  const handleTimeChange = (value: string, unit: 'hour' | 'minute' | 'ampm') => {
      let newDate = scheduledTime || new Date();
      if (unit === 'hour') {
          const currentAmPm = newDate.getHours() >= 12 ? 'PM' : 'AM';
          let newHour = parseInt(value, 10);
          if (currentAmPm === 'PM' && newHour < 12) {
              newHour += 12;
          }
          if (currentAmPm === 'AM' && newHour === 12) { // Midnight case
              newHour = 0;
          }
          newDate = setHours(newDate, newHour);
      } else if (unit === 'minute') {
          newDate = setMinutes(newDate, parseInt(value, 10));
      } else if (unit === 'ampm') {
          const currentHour = newDate.getHours();
          if (value === 'PM' && currentHour < 12) {
              newDate = setHours(newDate, currentHour + 12);
          } else if (value === 'AM' && currentHour >= 12) {
              newDate = setHours(newDate, currentHour - 12);
          }
      }
      setScheduledTime(newDate);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email || !status || !departmentId || !positionId || !problemId || !scheduledTime) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields before updating.',
      });
      return;
    }
    if (!firestore || !candidateId) return;

    setIsSaving(true);
    
    const candidateDoc = doc(firestore, 'candidates', candidateId);
    const updatedData = { 
        name, email, status, departmentId, positionId, problemId, scheduledTime 
    };

    updateDocumentNonBlocking(candidateDoc, updatedData);

    toast({
        title: 'Candidate Updated!',
        description: `The details for "${name}" have been successfully updated.`,
    });
    router.push('/admin/candidates');
    setIsSaving(false);
  };

  const isLoading = isLoadingCandidate || isLoadingDepts || isLoadingPos || isLoadingProblems;

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4">
            <Skeleton className="h-7 w-7" />
            <div className="space-y-1">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-72" />
            </div>
        </div>
        <Card>
            <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                  <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                </div>
                 <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                 <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
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
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={setStatus} value={status} disabled={isSaving}>
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
                        <Button type="button" variant="outline" size="icon" onClick={() => handleCopy(accessCode)} disabled={isSaving}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                 </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select onValueChange={handleDepartmentChange} value={departmentId} disabled={isSaving}>
                        <SelectTrigger id="department">
                            <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                            {(departments || []).map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="position">Position</Label>
                    <Select onValueChange={handlePositionChange} value={positionId} disabled={!departmentId || isSaving}>
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
              <Select onValueChange={setProblemId} value={problemId} disabled={!positionId || isSaving}>
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
                <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[2fr_1fr_1fr_1fr] gap-2 items-center">
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                        <Button
                            id="test-time"
                            variant={"outline"}
                            className={cn(
                            "justify-start text-left font-normal",
                            !scheduledTime && "text-muted-foreground"
                            )}
                            disabled={isSaving}
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
                            disabled={{ before: new Date() }}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                      <Select
                        onValueChange={(value) => handleTimeChange(value, 'hour')}
                        value={String(scheduledTime ? scheduledTime.getHours() % 12 || 12 : '').padStart(2, '0')}
                        disabled={!scheduledTime || isSaving}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="HH" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(hour => (
                                <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        onValueChange={(value) => handleTimeChange(value, 'minute')}
                        value={String(scheduledTime?.getMinutes() ?? '').padStart(2, '0')}
                        disabled={!scheduledTime || isSaving}
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
                    <Select
                        onValueChange={(value) => handleTimeChange(value, 'ampm')}
                        value={scheduledTime && scheduledTime.getHours() >= 12 ? 'PM' : 'AM'}
                        disabled={!scheduledTime || isSaving}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving || isLoading}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Candidate
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

    