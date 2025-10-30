
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, setHours, setMinutes, getDate, getMonth, getYear } from 'date-fns';
import { cn } from '@/lib/utils';

// Mock data - in a real app, this would be fetched from an API
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

const generateAccessCode = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


export default function InviteCandidatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [positionId, setPositionId] = useState('');
  const [problemId, setProblemId] = useState('');
  const [scheduledTime, setScheduledTime] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const availablePositions = useMemo(() => {
    if (!department) return [];
    return initialPositions.filter(p => p.department === department);
  }, [department]);

  const availableProblems = useMemo(() => {
    if (!positionId) return [];
    return initialProblems.filter(p => p.positionId === positionId);
  }, [positionId]);

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
    const currentHours = scheduledTime ? scheduledTime.getHours() : 9; // Default to 9 AM
    const currentMinutes = scheduledTime ? scheduledTime.getMinutes() : 0;
    const newDate = new Date(
      getYear(date),
      getMonth(date),
      getDate(date),
      currentHours,
      currentMinutes
    );
    setScheduledTime(newDate);
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email || !department || !positionId || !problemId || !scheduledTime) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields before sending the invitation.',
      });
      return;
    }
    const accessCode = generateAccessCode();
    const formData = { name, email, department, positionId, problemId, accessCode, scheduledTime: scheduledTime.toISOString() };
    console.log(formData);
    toast({
      title: 'Invitation Sent!',
      description: `${name} has been invited. Access Code: ${accessCode}`,
    });
    router.push('/admin/candidates');
  };

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
            Add Candidate
          </h2>
          <p className="text-muted-foreground">
            Send a coding challenge invitation to a new candidate.
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
                  placeholder="e.g., John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                      onValueChange={(value) => handleTimeChange(value, 'hour')}
                      value={String(scheduledTime ? scheduledTime.getHours() % 12 || 12 : '').padStart(2, '0')}
                      disabled={!scheduledTime}
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
                  <Select
                      onValueChange={(value) => handleTimeChange(value, 'ampm')}
                      value={scheduledTime && scheduledTime.getHours() >= 12 ? 'PM' : 'AM'}
                      disabled={!scheduledTime}
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
            <Button type="submit">Send Invitation</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
