
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, MoreHorizontal, Layers, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const initialTechnologies = [
  { id: "tech_1", name: "HTML", createdAt: "2024-05-10" },
  { id: "tech_2", name: "CSS", createdAt: "2024-05-11" },
  { id: "tech_3", name: "JS", createdAt: "2024-05-12" },
  { id: "tech_4", name: "Python", createdAt: "2024-05-13" },
];

type Technology = typeof initialTechnologies[0];

export default function TechnologiesPage() {
  const { toast } = useToast();
  const [technologies, setTechnologies] = useState<Technology[]>(initialTechnologies);
  const [techToDelete, setTechToDelete] = useState<Technology | null>(null);

  const handleDelete = () => {
    if (!techToDelete) return;

    setTechnologies(technologies.filter((s) => s.id !== techToDelete.id));
    toast({
      title: "Technology Deleted",
      description: `The technology "${techToDelete.name}" has been successfully deleted.`,
    });
    setTechToDelete(null);
  };

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Technologies
            </h2>
            <p className="text-muted-foreground">
              Manage your coding technologies here.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/admin/stacks/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Technology
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technologies.map((tech) => (
                  <TableRow key={tech.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {tech.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {tech.createdAt}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/stacks/${tech.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                           <DropdownMenuItem asChild>
                            <Link href={`/admin/stacks/${tech.id}`}>
                              <Layers className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setTechToDelete(tech)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!techToDelete} onOpenChange={(isOpen) => !isOpen && setTechToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              technology &quot;{techToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    