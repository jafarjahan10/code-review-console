
'use client';

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Trash2, Loader2, Search } from "lucide-react";
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
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { updatePassword, updateProfile, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import type { WithId } from "@/firebase";

type AdminUser = {
    id: string;
    name: string | null;
    email: string;
    role: "Admin" | "User";
}

type Department = {
    name: string;
}


export default function SettingsPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();

  const [name, setName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [newDepartment, setNewDepartment] = useState("");
  const [departmentToDelete, setDepartmentToDelete] = useState<WithId<Department> | null>(null);

  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  
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


  useEffect(() => {
    if (currentUser) {
        setName(currentUser.displayName || '');
    }
  }, [currentUser]);


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsProfileUpdating(true);
    try {
        await updateProfile(currentUser, { displayName: name });
        const adminDocRef = doc(firestore, 'admins', currentUser.uid);
        await setDoc(adminDocRef, { name }, { merge: true });
        toast({ title: "Profile updated successfully!" });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Failed to update profile", description: error.message });
    } finally {
        setIsProfileUpdating(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.email) return;

    if (!oldPassword) {
      toast({ variant: "destructive", title: "Old password is required." });
      return;
    }
    if (newPassword !== confirmPassword) {
        toast({ variant: "destructive", title: "New passwords do not match." });
        return;
    }
    if (newPassword.length < 6) {
        toast({ variant: "destructive", title: "New password must be at least 6 characters." });
        return;
    }

    setIsPasswordUpdating(true);
    try {
        const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        
        toast({ title: "Password updated successfully!" });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    } catch (error: any) {
        toast({ variant: "destructive", title: "Failed to update password", description: "Please check your old password and try again." });
    } finally {
        setIsPasswordUpdating(false);
    }
  };

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
    if (!departmentToDelete) return;
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
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Settings
          </h2>
          <p className="text-muted-foreground">
            Manage your account and application settings.
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="space-y-4">
              <div className="space-y-8">
                  <Card>
                    <form onSubmit={handleUpdateProfile}>
                      <CardHeader>
                          <CardTitle>Profile</CardTitle>
                          <CardDescription>Update your personal information.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="name">Name</Label>
                                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isUserLoading} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="email">Email</Label>
                                  <Input id="email" type="email" value={currentUser?.email || ''} disabled />
                              </div>
                          </div>
                      </CardContent>
                      <CardFooter>
                         <Button type="submit" disabled={isProfileUpdating}>
                            {isProfileUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Profile
                          </Button>
                      </CardFooter>
                      </form>
                  </Card>

                   <Card>
                    <form onSubmit={handleUpdatePassword}>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your login password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="old-password">Old Password</Label>
                                    <Input id="old-password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Your current password" />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter>
                           <Button type="submit" disabled={isPasswordUpdating}>
                                {isPasswordUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                         </CardFooter>
                    </form>
                  </Card>
              </div>
          </TabsContent>
           <TabsContent value="departments" className="space-y-4">
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle>Manage Departments</CardTitle>
                        <CardDescription>Your existing departments.</CardDescription>
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
          </TabsContent>
        </Tabs>
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
