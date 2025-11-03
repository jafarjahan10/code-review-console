
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
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Technology } from '@/types';

export default function EditTechnologyPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const techId = params.id as string;
  const techDocRef = useMemo(() => firestore && techId ? doc(firestore, "technologies", techId) : null, [firestore, techId]);
  
  const [name, setName] = useState('');
  const [initialName, setInitialName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (techId && firestore) {
        setIsLoading(true);
        getDoc(doc(firestore, "technologies", techId))
            .then(docSnap => {
                if (docSnap.exists()) {
                    const techData = docSnap.data() as Omit<Technology, 'id'>;
                    setName(techData.name);
                    setInitialName(techData.name);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Technology not found',
                    });
                    router.push('/admin/technologies');
                }
            })
            .catch(error => {
                 toast({
                    variant: 'destructive',
                    title: 'Error fetching data',
                    description: error.message,
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }
  }, [techId, firestore, router, toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Missing Name',
        description: 'Please provide a name for the technology.',
      });
      return;
    }
    if (!techDocRef) return;

    setIsSaving(true);
    try {
        await updateDoc(techDocRef, { 
            name,
            name_lowercase: name.toLowerCase() 
        });
        toast({
            title: 'Technology Updated!',
            description: `The technology "${name}" has been successfully updated.`,
        });
        router.push('/admin/technologies');
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: 'Update Failed',
            description: error.message,
        });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
             <div className="flex items-center gap-4">
                <Skeleton className="h-7 w-7" />
                <div className="space-y-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
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
          <Link href="/admin/technologies">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Edit Technology
          </h2>
          <p className="text-muted-foreground">
            Update the technology name.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-2">
                <Label htmlFor="name">Technology Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSaving}
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Technology
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
