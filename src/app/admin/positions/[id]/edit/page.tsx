
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
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

const initialPositions = [
  { id: "pos_1", title: "Senior Frontend Developer", department: "Engineering" },
  { id: "pos_2", title: "UX/UI Designer", department: "Design" },
  { id: "pos_3", title: "Product Manager", department: "Product" },
  { id: "pos_4", title: "Junior Backend Developer", department: "Engineering" },
];

const departments = ["Engineering", "Design", "Product", "Marketing", "HR"];

export default function EditPositionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const positionId = params.id;
    const positionToEdit = initialPositions.find(p => p.id === positionId);

    if (positionToEdit) {
      setTitle(positionToEdit.title);
      setDepartment(positionToEdit.department);
    } else {
      toast({
        variant: 'destructive',
        title: 'Position not found',
        description: 'The requested position could not be found.',
      });
      router.push('/admin/positions');
    }
    setIsLoading(false);
  }, [params.id, router, toast]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !department) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields before updating.',
      });
      return;
    }
    console.log({ id: params.id, title, department });
    toast({
      title: 'Position Updated!',
      description: `The position "${title}" has been successfully updated.`,
    });
    router.push('/admin/positions');
  };

  if (isLoading) {
    return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6"><p>Loading...</p></div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin/positions">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Edit Position
          </h2>
          <p className="text-muted-foreground">
            Update the position details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-2">
                <Label htmlFor="title">Position Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select onValueChange={setDepartment} value={department}>
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
          </CardContent>
          <CardFooter>
            <Button type="submit">Update Position</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
