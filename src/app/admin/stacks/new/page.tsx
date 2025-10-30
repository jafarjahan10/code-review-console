
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
import { Badge } from '@/components/ui/badge';

export default function NewStackPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);

  const handleTechKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && techInput.trim()) {
      event.preventDefault();
      const newTech = techInput.trim();
      if (!technologies.includes(newTech)) {
        setTechnologies([...technologies, newTech]);
      }
      setTechInput('');
    }
  };

  const removeTech = (techToRemove: string) => {
    setTechnologies(technologies.filter(tech => tech !== techToRemove));
  };


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || technologies.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields before submitting.',
      });
      return;
    }
    // In a real app, you would handle the API submission here.
    console.log({ name, technologies });
    toast({
      title: 'Stack Created!',
      description: `The stack "${name}" has been successfully created.`,
    });
    router.push('/admin/stacks');
  };

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
            Add New Stack
          </h2>
          <p className="text-muted-foreground">
            Create a new technology stack.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-2">
                <Label htmlFor="name">Stack Name</Label>
                <Input
                    id="name"
                    placeholder="e.g., React + Tailwind"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="technologies">Technologies (press Enter to add)</Label>
                <Input
                    id="technologies"
                    placeholder="e.g., Next.js"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleTechKeyDown}
                />
                <div className="flex flex-wrap gap-2 pt-2">
                    {technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-sm">
                        {tech}
                        <button
                        type="button"
                        className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onClick={() => removeTech(tech)}
                        >
                        <span className="sr-only">Remove {tech}</span>
                        &times;
                        </button>
                    </Badge>
                    ))}
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Submit Stack</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

