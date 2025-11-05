
'use client';

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import type { WithId } from "@/firebase";

type Department = {
    id: string;
    name: string;
}

type AdminUser = {
    id: string;
    role: "Admin" | "User";
}

export default function DepartmentsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const [newDepartment, setNewDepartment] = useState("");
  const [departmentToDelete, setDepartmentToDelete] = useState<WithId<Department> | null>(null);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [departmentCurrentPage, setDepartmentCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isAddDeptDialogOpen, setAddDeptDialogOpen] = useState(false);

  const deptsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'departments') : null, [firestore]);
  const { data: departmentsData } = useCollection<Department>(deptsColRef);
  
  const departments = departmentsData || [];

  const adminsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'admins') : null, [firestore]);
  const { data: admins } = useCollection<AdminUser>(adminsColRef);

  const currentUserRole = useMemo(() => {
    if (!currentUser || !admins) return null;
    return admins.find(admin => admin.id === currentUser.uid)?.role;
  }, [currentUser, admins]);

  const filteredDepartments = useMemo(() => {
    if (!departments) return [];
    return departments.filter(department =>
      department.name.toLowerCase().includes(departmentSearchTerm.toLowerCase())
    );
  }, [departments, departmentSearchTerm]);

  const totalDepartmentPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = useMemo(() => {
    const startIndex = (departmentCurrentPage - 1) * itemsPerPage;
    return filteredDepartments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDepartments, departmentCurrentPage]);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.trim()) {
      toast({ variant: "destructive", title: "Department name cannot be empty." });
      return;
    }
    if (departments && departments.find(d => d.name.toLowerCase() === newDepartment.toLowerCase())) {
        toast({ variant: "destructive", title: "Department already exists." });
        return;
    }
    if (!firestore) return;
    try {
        const deptsColRef = collection(firestore, 'departments');
        await addDoc(deptsColRef, { name: newDepartment.trim() });
        setNewDepartment("");
        setAddDeptDialogOpen(false);
        toast({ title: `Department "${newDepartment.trim()}" added.` });
    } catch (error: any) {
         toast({ variant: "destructive", title: "Failed to add department", description: error.message });
    }
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete || !firestore) return;
    try {
        const deptDocRef = doc(firestore, 'departments', departmentToDelete.id);
        await deleteDoc(deptDocRef);
        toast({
            title: "Department Removed",
            description: `The department "${departmentToDelete.name}" has been removed.`,
        });
    } catch(error: any) {
        toast({ variant: "destructive", title: "Failed to remove department", description: error.message });
    } finally {
        setDepartmentToDelete(null);
    }
  };


  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Departments</h2>
                <p className="text-muted-foreground">Manage your organization's departments.</p>
            </div>
             {currentUserRole === 'Admin' && (
                <Dialog open={isAddDeptDialogOpen} onOpenChange={setAddDeptDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Department
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Department</DialogTitle>
                            <DialogDescription>Create a new department for positions.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddDepartment} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="department-name">Department Name</Label>
                                <Input 
                                id="department-name"
                                placeholder="e.g., Quality Assurance"
                                value={newDepartment}
                                onChange={(e) => setNewDepartment(e.target.value)} 
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full md:w-auto">
                                    Add Department
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Existing Departments</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="mb-4 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Search by department name..."
                      value={departmentSearchTerm}
                      onChange={(e) => {
                          setDepartmentSearchTerm(e.target.value);
                          setDepartmentCurrentPage(1);
                      }}
                      className="pl-8 w-full"
                  />
              </div>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Department Name</TableHead>
                          {currentUserRole === 'Admin' && <TableHead><span className="sr-only">Actions</span></TableHead>}
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {paginatedDepartments && paginatedDepartments.map((dept) => (
                          <TableRow key={dept.id}>
                              <TableCell className="font-medium">{dept.name}</TableCell>
                              {currentUserRole === 'Admin' && (
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDepartmentToDelete(dept)}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove {dept.name}</span>
                                    </Button>
                                </TableCell>
                              )}
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
               <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDepartmentCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={departmentCurrentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {departmentCurrentPage} of {totalDepartmentPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDepartmentCurrentPage(prev => Math.min(prev + 1, totalDepartmentPages))}
                        disabled={departmentCurrentPage === totalDepartmentPages}
                    >
                        Next
                    </Button>
                </div>
          </CardContent>
        </Card>
      </div>

       <AlertDialog open={!!departmentToDelete} onOpenChange={(isOpen) => !isOpen && setDepartmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the department &quot;{departmentToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDepartment}
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
