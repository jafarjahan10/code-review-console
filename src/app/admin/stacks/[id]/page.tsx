
'use client';

import { useState, useEffect } from 'react';
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


export default function ViewTechnologyPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [technology, setTechnology] = useState<Technology | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const techId = params.id as string;
    if (techId) {
        setIsLoading(true);
        fetch(`/api/technologies/${techId}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then(data => {
                setTechnology(data);
            })
            .catch(() => {
                toast({
                    variant: 'destructive',
                    title: 'Technology not found',
                });
                router.push('/admin/stacks');
            })
            .finally(() => setIsLoading(false));
    }
  }, [params.id, router, toast]);


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
          <Link href="/admin/stacks">
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
                <p className="text-muted-foreground"><ClientDateTime date={technology.createdAt} /></p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
