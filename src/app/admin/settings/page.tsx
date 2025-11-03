
'use client';

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { collection, doc, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, updatePassword, updateProfile, signOut, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import type { WithId } from "@/firebase";
import { initializeApp, deleteApp } from "firebase/app";
import { firebaseConfig } from "@/firebase/config";
import { Switch } from "@/components/ui/switch";


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

  const [interviewerEmail, setInterviewerEmail] = useState('');
  const [interviewerPassword, setInterviewerPassword] = useState('');
  
  const [newDepartment, setNewDepartment] = useState("");
  const [departmentToDelete, setDepartmentToDelete] = useState<WithId<Department> | null>(null);

  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [isAddingInterviewer, setIsAddingInterviewer] = useState(false);
  const [interviewerToDelete, setInterviewerToDelete] = useState<WithId<AdminUser> | null>(null);

  const [interviewerSearchTerm, setInterviewerSearchTerm] = useState("");
  const [interviewerCurrentPage, setInterviewerCurrentPage] = useState(1);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [departmentCurrentPage, setDepartmentCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [isAddDeptDialogOpen, setAddDeptDialogOpen] = useState(false);


  // Fetch Admins
  const adminsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'admins') : null, [firestore]);
  const { data: interviewers, isLoading: isLoadingAdmins } = useCollection<AdminUser>(adminsColRef);
  
  // Fetch Departments
  const deptsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'departments') : null, [firestore]);
  const { data: departmentsData, isLoading: isLoadingDepts } = useCollection<Department>(deptsColRef);
  
  const departments = departmentsData || [];

  const currentUserInPanel = useMemo(() => {
    if (!currentUser || !interviewers) return null;
    return interviewers.find(interviewer => interviewer.id === currentUser.uid);
  }, [currentUser, interviewers]);

  const currentUserRole = currentUserInPanel?.role;

  // Search and Pagination Logic for Interviewers
  const filteredInterviewers = useMemo(() => {
    if (!interviewers) return [];
    return interviewers.filter(interviewer =>
      (interviewer.name?.toLowerCase().includes(interviewerSearchTerm.toLowerCase()) ||
       interviewer.email.toLowerCase().includes(interviewerSearchTerm.toLowerCase()))
    );
  }, [interviewers, interviewerSearchTerm]);

  const totalInterviewerPages = Math.ceil(filteredInterviewers.length / itemsPerPage);
  const paginatedInterviewers = useMemo(() => {
    const startIndex = (interviewerCurrentPage - 1) * itemsPerPage;
    return filteredInterviewers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInterviewers, interviewerCurrentPage, itemsPerPage]);

  // Search and Pagination Logic for Departments
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
  }, [filteredDepartments, departmentCurrentPage, itemsPerPage]);


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

  const handleRoleChange = async (userId: string, newRole: "Admin" | "User") => {
    try {
        const adminDocRef = doc(firestore, 'admins', userId);
        await setDoc(adminDocRef, { role: newRole }, { merge: true });
        toast({ title: "User role updated." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Failed to update role", description: error.message });
    }
  };


  const handleAddInterviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewerEmail.trim() || !interviewerPassword.trim()) {
        toast({ variant: "destructive", title: "Email and password cannot be empty." });
        return;
    }
    setIsAddingInterviewer(true);
    
    // 1. Create a secondary, temporary Firebase app instance.
    const tempAppName = `temp-user-creation-${Date.now()}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    try {
        // 2. Create the new user in the temporary app instance.
        const { user: newInterviewer } = await createUserWithEmailAndPassword(tempAuth, interviewerEmail, interviewerPassword);
        
        // 3. Save the new user's data to Firestore using the main app instance.
        const adminDocRef = doc(firestore, 'admins', newInterviewer.uid);
        await setDoc(adminDocRef, {
            id: newInterviewer.uid,
            email: interviewerEmail,
            role: 'User',
            name: interviewerEmail.split('@')[0],
        });
        
        // 4. Sign out the new user from the temporary instance.
        await signOut(tempAuth);
        
        setInterviewerEmail('');
        setInterviewerPassword('');
        setAddUserDialogOpen(false);
        toast({
            title: "Interviewer Added",
            description: "The new user has been successfully added to the panel.",
        });

    } catch (error: any) {
        toast({ variant: "destructive", title: "Failed to add interviewer", description: error.message });
    } finally {
        // 5. Clean up the temporary app instance.
        await deleteApp(tempApp);
        setIsAddingInterviewer(false);
    }
  };

  const handleDeleteInterviewer = async () => {
    if (!interviewerToDelete) return;
    try {
        const adminDocRef = doc(firestore, 'admins', interviewerToDelete.id);
        await deleteDoc(adminDocRef);
        toast({ title: "Interviewer Removed", description: `"${interviewerToDelete.name}" has been removed from the panel.` });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Failed to remove interviewer", description: error.message });
    } finally {
        setInterviewerToDelete(null);
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
            <TabsTrigger value="interview-panel">Interview Panel</TabsTrigger>
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
          <TabsContent value="interview-panel" className="space-y-4">
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle>Interview Panel</CardTitle>
                        <CardDescription>Manage your existing interview panel.</CardDescription>
                      </div>
                       {currentUserRole === 'Admin' && (
                         <Dialog open={isAddUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Interviewer
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                <DialogTitle>Add Interviewer</DialogTitle>
                                <DialogDescription>
                                    Invite a new interviewer to the panel by email.
                                </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddInterviewer} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="interviewer-email">Email</Label>
                                        <Input id="interviewer-email" type="email" placeholder="interviewer@example.com" value={interviewerEmail} onChange={(e) => setInterviewerEmail(e.target.value)} disabled={isAddingInterviewer} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="interviewer-password">Set Password</Label>
                                        <Input id="interviewer-password" type="password" placeholder="Set a temporary password" value={interviewerPassword} onChange={(e) => setInterviewerPassword(e.target.value)} disabled={isAddingInterviewer} />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full md:w-auto" disabled={isAddingInterviewer}>
                                            {isAddingInterviewer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Add Interviewer
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
                              placeholder="Search by name or email..."
                              value={interviewerSearchTerm}
                              onChange={(e) => {
                                  setInterviewerSearchTerm(e.target.value);
                                  setInterviewerCurrentPage(1); // Reset to first page on search
                              }}
                              className="pl-8 w-full"
                          />
                      </div>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead className="hidden md:table-cell">Email</TableHead>
                                  <TableHead>Role</TableHead>
                                  {currentUserRole === 'Admin' && <TableHead><span className="sr-only">Actions</span></TableHead>}
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {paginatedInterviewers && paginatedInterviewers.map((interviewer) => (
                                  <TableRow key={interviewer.id}>
                                      <TableCell>
                                          <div className="flex items-center gap-3">
                                              <Avatar className="hidden h-9 w-9 sm:flex">
                                                  <AvatarImage src={`https://avatar.vercel.sh/${interviewer.email}.png`} alt="Avatar" />
                                                  <AvatarFallback>{interviewer.name?.charAt(0) || 'U'}</AvatarFallback>
                                              </Avatar>
                                              <div>
                                                <p className="font-medium">{interviewer.name || 'No Name'}</p>
                                                <p className="text-sm text-muted-foreground md:hidden">{interviewer.email}</p>
                                              </div>
                                          </div>
                                      </TableCell>
                                      <TableCell className="hidden md:table-cell">{interviewer.email}</TableCell>
                                      <TableCell>
                                        {currentUserRole === 'Admin' ? (
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`role-switch-${interviewer.id}`}
                                                    checked={interviewer.role === 'Admin'}
                                                    onCheckedChange={(checked) =>
                                                        handleRoleChange(interviewer.id, checked ? 'Admin' : 'User')
                                                    }
                                                    disabled={currentUser?.uid === interviewer.id}
                                                />
                                                <Label htmlFor={`role-switch-${interviewer.id}`}>{interviewer.role}</Label>
                                            </div>
                                        ) : (
                                            interviewer.role
                                        )}
                                      </TableCell>
                                      {currentUserRole === 'Admin' && (
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setInterviewerToDelete(interviewer)} disabled={currentUser?.uid === interviewer.id}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Remove</span>
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
                                onClick={() => setInterviewerCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={interviewerCurrentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {interviewerCurrentPage} of {totalInterviewerPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setInterviewerCurrentPage(prev => Math.min(prev + 1, totalInterviewerPages))}
                                disabled={interviewerCurrentPage === totalInterviewerPages}
                            >
                                Next
                            </Button>
                        </div>
                  </CardContent>
               </Card>
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
                                  setDepartmentCurrentPage(1); // Reset to first page on search
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
       <AlertDialog open={!!interviewerToDelete} onOpenChange={(isOpen) => !isOpen && setInterviewerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the
              interviewer &quot;{interviewerToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInterviewer}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
