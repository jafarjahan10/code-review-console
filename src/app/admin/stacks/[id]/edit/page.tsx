
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
import { ArrowLeft } from 'lucide-react';

const initialTechnologies = [
  { id: "tech_1", name: "HTML" },
  { id: "tech_2", name: "CSS" },
  { id: "tech_3", name: "JS" },
  { id: "tech_4", name: "Python" },
];

export default function EditTechnologyPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const techId = params.id;
    const techToEdit = initialTechnologies.find(s => s.id === techId);

    if (techToEdit) {
      setName(techToEdit.name);
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
    console.log({ id: params.id, name });
    toast({
      title: 'Technology Updated!',
      description: `The technology "${name}" has been successfully updated.`,
    });
    router.push('/admin/stacks');
  };

  if (isLoading) {
    return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6"><p>Loading...</p></div>;
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
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Update Technology</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

    