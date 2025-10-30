
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
import { ArrowLeft, Briefcase, Building } from 'lucide-react';

const initialPositions = [
  { id: "pos_1", title: "Senior Frontend Developer", department: "Engineering" },
  { id: "pos_2", title: "UX/UI Designer", department: "Design" },
  { id: "pos_3", title: "Product Manager", department: "Product" },
  { id: "pos_4", title: "Junior Backend Developer", department: "Engineering" },
];

type Position = typeof initialPositions[0];

export default function ViewPositionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [position, setPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const positionId = params.id;
    const positionToView = initialPositions.find(p => p.id === positionId);

    if (positionToView) {
      setPosition(positionToView);
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


  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <p>Loading...</p>
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
                <Badge variant="secondary">{position.department}</Badge>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
