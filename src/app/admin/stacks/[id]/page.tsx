
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

const initialStacks = [
  {
    id: "stack_1",
    name: "React + Tailwind",
    technologies: ["React", "Next.js", "Tailwind CSS"],
    createdAt: "2024-05-10",
  },
  {
    id: "stack_2",
    name: "Vue + Vuetify",
    technologies: ["Vue.js", "Nuxt.js", "Vuetify"],
    createdAt: "2024-05-12",
  },
  {
    id: "stack_3",
    name: "SvelteKit",
    technologies: ["SvelteKit", "Tailwind CSS"],
    createdAt: "2024-05-15",
  },
];

type Stack = typeof initialStacks[0];

export default function ViewStackPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [stack, setStack] = useState<Stack | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stackId = params.id;
    const stackToView = initialStacks.find(p => p.id === stackId);

    if (stackToView) {
      setStack(stackToView);
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


  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <p>Loading...</p>
      </div>
    )
  }

  if (!stack) {
    return (
         <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <p>Stack not found.</p>
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
            <CardTitle className="font-headline text-3xl">{stack.name}</CardTitle>
        </div>
      </div>

        <Card>
            <CardHeader>
                <CardTitle>Technologies</CardTitle>
            </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-wrap gap-2">
                {stack.technologies.map(tech => <Badge variant="secondary" key={tech} className="text-base">{tech}</Badge>)}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

