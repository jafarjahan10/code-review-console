
'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft } from 'lucide-react';

const initialTechnologies = [
  { id: "tech_1", name: "HTML", createdAt: "2024-05-10" },
  { id: "tech_2", name: "CSS", createdAt: "2024-05-11" },
  { id: "tech_3", name: "JS", createdAt: "2024-05-12" },
  { id: "tech_4", name: "Python", createdAt: "2024-05-13" },
];

type Technology = typeof initialTechnologies[0];

export default function ViewTechnologyPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [technology, setTechnology] = useState<Technology | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const techId = params.id;
    const techToView = initialTechnologies.find(p => p.id === techId);

    if (techToView) {
      setTechnology(techToView);
    } else {
      toast({
        variant: 'destructive',
        title: 'Technology not found',
        description: 'The requested technology could not be found.',
      });
      router.push('/admin/stacks');
    }
    setIsLoading(false);
  }, [params.id, router, toast]);


  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <p>Loading...</p>
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
       <div className="flex items-start gap-4">
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
                <p className="text-muted-foreground">{technology.createdAt}</p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

    