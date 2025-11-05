
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

export default function EditTechnologyPage() {
  const router = useRouter();
  const { id: techId } = useParams() as { id: string };
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!techId) return;
    
    setIsLoading(true);
    fetch(`/api/technologies/${techId}`)
        .then(res => {
            if (!res.ok) throw new Error("Technology not found");
            return res.json();
        })
        .then(data => {
            setName(data.name);
            setIsLoading(false);
        })
        .catch(() => {
            toast({
                variant: 'destructive',
                title: 'Technology not found',
                description: 'The requested technology could not be found.',
            });
            router.push('/admin/stacks');
        });
  }, [techId, router, toast]);

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
    setIsSaving(true);
    try {
        const response = await fetch(`/api/technologies/${techId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update technology');
        }
        toast({
            title: 'Technology Updated!',
            description: `The technology "${name}" has been successfully updated.`,
        });
        router.push('/admin/stacks');
        router.refresh();
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
          <Link href="/admin/stacks">
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
