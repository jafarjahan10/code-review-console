
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewTechnologyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Missing Name',
        description: 'Please provide a name for the technology.',
      });
      return;
    }
    // In a real app, you would handle the API submission here.
    console.log({ name });
    toast({
      title: 'Technology Created!',
      description: `The technology "${name}" has been successfully created.`,
    });
    router.push('/admin/stacks');
  };

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
            Add New Technology
          </h2>
          <p className="text-muted-foreground">
            Create a new technology entry.
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
                    placeholder="e.g., JavaScript"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Submit Technology</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

    
