
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { Position, Department } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditPositionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const positionId = params.id as string;

  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const positionDocRef = useMemoFirebase(() => (firestore && positionId ? doc(firestore, 'positions', positionId) : null), [firestore, positionId]);
  const { data: position, isLoading: isLoadingPosition } = useDoc<Position>(positionDocRef);

  const deptsColRef = useMemoFirebase(() => (firestore ? collection(firestore, 'departments') : null), [firestore]);
  const { data: departments, isLoading: isLoadingDepts } = useCollection<Department>(deptsColRef);

  useEffect(() => {
    if (position) {
      setTitle(position.title);
      setDepartmentId(position.departmentId);
    }
  }, [position]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !departmentId) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields before updating.',
      });
      return;
    }
    if (!firestore || !positionId) return;

    setIsSaving(true);
    try {
      const positionDoc = doc(firestore, 'positions', positionId);
      await updateDoc(positionDoc, { title, departmentId });
      toast({
        title: 'Position Updated!',
        description: `The position "${title}" has been successfully updated.`,
      });
      router.push('/admin/positions');
    } catch(error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoadingPosition || isLoadingDepts) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-7 w-7" />
                <div className="space-y-1">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-56" />
                </div>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                     <div className="grid gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="grid gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
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
                    disabled={isSaving}
                />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select onValueChange={setDepartmentId} value={departmentId} disabled={isSaving}>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Position
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

    