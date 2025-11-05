
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Technology } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import ClientDateTime from '@/components/client-date-time';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


export default function ViewTechnologyPage() {
  const router = useRouter();
  const { id: techId } = useParams() as { id: string };
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const techDocRef = useMemoFirebase(() => (firestore && techId ? doc(firestore, 'technologies', techId) : null), [firestore, techId]);
  const { data: technology, isLoading, error } = useDoc<Technology>(techDocRef);

  useEffect(() => {
    if(error){
        toast({
            variant: 'destructive',
            title: 'Technology not found',
        });
        router.push('/admin/technologies');
    }
  }, [error, router, toast]);


  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-7 w-7" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="grid gap-6 pt-2">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-40" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-48" />
                </div>
            </CardContent>
        </Card>
      </div>
    )
  }

  if (!technology) {
    return (
         <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <p>Technology not found.</p>
          </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin/technologies">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="space-y-1">
            <CardTitle className="font-headline text-3xl">{technology.name}</CardTitle>
        </div>
      </div>

        <Card>
            <CardHeader>
                <CardTitle>Details</CardTitle>
            </CardHeader>
          <CardContent className="pt-2 grid gap-4">
             <div className="space-y-2">
                <p className="text-sm font-medium">Name</p>
                <p className="text-muted-foreground">{technology.name}</p>
            </div>
             <div className="space-y-2">
                <p className="text-sm font-medium">Created At</p>
                <p className="text-muted-foreground"><ClientDateTime date={technology.createdAt?.toDate ? technology.createdAt.toDate() : technology.createdAt} /></p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
