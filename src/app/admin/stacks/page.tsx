
'use client';

import { useState, useEffect, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { PlusCircle, MoreHorizontal, Layers, Pencil, Trash2, ArrowUpDown, Search } from "lucide-react";
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
import { Technology } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import ClientDateTime from "@/components/client-date-time";

export default function TechnologiesPage() {
  const { toast } = useToast();
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [techToDelete, setTechToDelete] = useState<Technology | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort, setSort] = useState({ by: 'createdAt', order: 'desc' });
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const fetchTechnologies = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: searchTerm,
        sortBy: sort.by,
        sortOrder: sort.order,
      });
      const response = await fetch(`/api/technologies?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setTechnologies(data.technologies);
      setHasNextPage(data.hasNextPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching technologies",
        description: "Could not load the list of technologies.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm, sort, toast]);

  useEffect(() => {
    fetchTechnologies();
  }, [fetchTechnologies]);

  const handleDelete = async () => {
    if (!techToDelete) return;

    try {
        const response = await fetch(`/api/technologies/${techToDelete.id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete technology.');
        }
        toast({
            title: "Technology Deleted",
            description: `The technology "${techToDelete.name}" has been successfully deleted.`,
        });
        fetchTechnologies(); // Refresh the list
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error.message,
        });
    } finally {
      setTechToDelete(null);
    }
  };

  const handleSort = (column: string) => {
    if (sort.by === column) {
      setSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ by: column, order: 'desc' });
    }
    setPage(1);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
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
        
        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8 w-full max-w-sm"
            />
        </div>

        <Card>
          <CardContent className="pt-6">
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('name')}>
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('createdAt')}>
                      Created At
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : technologies.map((tech) => (
                  <TableRow key={tech.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {tech.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <ClientDateTime date={tech.createdAt} />
                    </TableCell>
                    <TableCell className="text-right">
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
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={!hasNextPage}
          >
            Next
          </Button>
        </div>
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
