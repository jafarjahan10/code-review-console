
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Building } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Position, Department } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ViewPositionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const positionId = params.id as string;

  const positionDocRef = useMemoFirebase(() => (firestore && positionId ? doc(firestore, 'positions', positionId) : null), [firestore, positionId]);
  const { data: position, isLoading: isLoadingPosition, error: positionError } = useDoc<Position>(positionDocRef);

  const departmentDocRef = useMemoFirebase(() => (firestore && position?.departmentId ? doc(firestore, 'departments', position.departmentId) : null), [firestore, position]);
  const { data: department, isLoading: isLoadingDepartment } = useDoc<Department>(departmentDocRef);

  useEffect(() => {
    if (positionError) {
      toast({
        variant: 'destructive',
        title: 'Position not found',
        description: 'The requested position could not be found.',
      });
      router.push('/admin/positions');
    }
  }, [positionError, router, toast]);


  if (isLoadingPosition || isLoadingDepartment) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-8 w-48" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="pt-2 grid gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </CardContent>
        </Card>
      </div>
    )
  }

  if (!position) {
    return (
         <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <p>Position not found.</p>
          </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin/positions">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
                {position.title}
            </h2>
        </div>
      </div>

        <Card>
            <CardHeader>
                <CardTitle>Position Details</CardTitle>
            </CardHeader>
          <CardContent className="pt-2 grid gap-4">
             <div className="space-y-2">
                <p className="text-sm font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" /> Title</p>
                <p className="text-muted-foreground">{position.title}</p>
            </div>
             <div className="space-y-2">
                <p className="text-sm font-medium flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" /> Department</p>
                <Badge variant="secondary">{department?.name || 'N/A'}</Badge>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

    