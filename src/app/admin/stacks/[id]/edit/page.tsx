
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
import { Badge } from '@/components/ui/badge';

const initialStacks = [
  {
    id: "stack_1",
    name: "React + Tailwind",
    technologies: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    id: "stack_2",
    name: "Vue + Vuetify",
    technologies: ["Vue.js", "Nuxt.js", "Vuetify"],
  },
  {
    id: "stack_3",
    name: "SvelteKit",
    technologies: ["SvelteKit", "Tailwind CSS"],
  },
];

export default function EditStackPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stackId = params.id;
    const stackToEdit = initialStacks.find(s => s.id === stackId);

    if (stackToEdit) {
      setName(stackToEdit.name);
      setTechnologies(stackToEdit.technologies);
    } else {
      toast({
        variant: 'destructive',
        title: 'Stack not found',
        description: 'The requested stack could not be found.',
      });
      router.push('/admin/stacks');
    }
    setIsLoading(false);
  }, [params.id, router, toast]);

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
    console.log({ id: params.id, name, technologies });
    toast({
      title: 'Stack Updated!',
      description: `The stack "${name}" has been successfully updated.`,
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
            Edit Stack
          </h2>
          <p className="text-muted-foreground">
            Update the technology stack details.
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
            <Button type="submit">Update Stack</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
