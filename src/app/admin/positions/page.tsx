
'use client';

import { useState, useMemo, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Eye, Search } from "lucide-react";
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
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, deleteDoc } from "firebase/firestore";
import type { Position, Department } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

type AdminUser = {
    id: string;
    role: "Admin" | "User";
}

export default function PositionsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();

  const posColRef = useMemoFirebase(() => firestore ? collection(firestore, 'positions') : null, [firestore]);
  const { data: allPositions, isLoading: isLoadingPositions } = useCollection<Position>(posColRef);

  const deptsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'departments') : null, [firestore]);
  const { data: allDepartments, isLoading: isLoadingDepts } = useCollection<Department>(deptsColRef);

  const adminsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'admins') : null, [firestore]);
  const { data: admins, isLoading: isLoadingAdmins } = useCollection<AdminUser>(adminsColRef);

  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const currentUserRole = useMemo(() => {
    if (!currentUser || !admins) return null;
    return admins.find(admin => admin.id === currentUser.uid)?.role;
  }, [currentUser, admins]);

  const departmentsMap = useMemo(() => {
    if (!allDepartments) return new Map();
    return new Map(allDepartments.map(dept => [dept.id, dept.name]));
  }, [allDepartments]);

  const filteredPositions = useMemo(() => {
    if (!allPositions) return [];
    return allPositions.filter(position => {
      const departmentName = departmentsMap.get(position.departmentId) || '';
      return position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             departmentName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [allPositions, searchTerm, departmentsMap]);
  
  const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);
  const paginatedPositions = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredPositions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPositions, page]);


  const handleDelete = async () => {
    if (!positionToDelete || !firestore) return;

    try {
      await deleteDoc(doc(firestore, "positions", positionToDelete.id));
      toast({
        title: "Position Deleted",
        description: `The position "${positionToDelete.title}" has been successfully deleted.`,
      });
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error.message,
        })
    } finally {
      setPositionToDelete(null);
    }
  };

  const isLoading = isLoadingPositions || isLoadingDepts || isLoadingAdmins;

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Positions
            </h2>
            <p className="text-muted-foreground">
              Manage your company's open positions.
            </p>
          </div>
          {currentUserRole === 'Admin' && (
            <div className="flex items-center space-x-2">
                <Button asChild>
                <Link href="/admin/positions/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Position
                </Link>
                </Button>
            </div>
          )}
        </div>
        
        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by title or department..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                }}
                className="pl-8 w-full max-w-sm"
            />
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    Array.from({length: itemsPerPage}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : paginatedPositions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{departmentsMap.get(position.departmentId) || 'N/A'}</Badge>
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
                            <Link href={`/admin/positions/${position.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          {currentUserRole === 'Admin' && (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/positions/${position.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setPositionToDelete(position)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </>
                          )}
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
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
            >
                Previous
            </Button>
             <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
            >
                Next
            </Button>
        </div>
      </div>

      <AlertDialog open={!!positionToDelete} onOpenChange={(isOpen) => !isOpen && setPositionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              position &quot;{positionToDelete?.title}&quot;.
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

    