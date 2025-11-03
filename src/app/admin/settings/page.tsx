
'use client';

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
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
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updatePassword, updateProfile } from "firebase/auth";
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

  // Fetch Admins
  const adminsColRef = useMemoFirebase(() => collection(firestore, 'admins'), [firestore]);
  const { data: interviewers, isLoading: isLoadingAdmins } = useCollection<AdminUser>(adminsColRef);
  
  // Fetch Departments
  const deptsColRef = useMemoFirebase(() => collection(firestore, 'departments'), [firestore]);
  const { data: departments = [], isLoading: isLoadingDepts } = useCollection<Department>(deptsColRef);


  const currentUserRole = useMemo(() => {
    if (!currentUser || !interviewers) return null;
    const adminData = interviewers.find(interviewer => interviewer.id === currentUser.uid);
    return adminData?.role;
  }, [currentUser, interviewers]);


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
    if (!currentUser) return;
    if (newPassword !== confirmPassword) {
        toast({ variant: "destructive", title: "Passwords do not match." });
        return;
    }
    if (newPassword.length < 6) {
        toast({ variant: "destructive", title: "Password must be at least 6 characters." });
        return;
    }

    setIsPasswordUpdating(true);
    try {
        await updatePassword(currentUser, newPassword);
        toast({ title: "Password updated successfully!" });
        setNewPassword('');
        setConfirmPassword('');
    } catch (error: any) {
        toast({ variant: "destructive", title: "Failed to update password", description: error.message });
    } finally {
        setIsPasswordUpdating(false);
    }
  };

  const handleAddInterviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewerEmail.trim() || !interviewerPassword.trim()) {
        toast({ variant: "destructive", title: "Email and password cannot be empty." });
        return;
    }
    setIsAddingInterviewer(true);

    try {
        const { user: newInterviewer } = await createUserWithEmailAndPassword(auth, interviewerEmail, interviewerPassword);
        
        const adminDocRef = doc(firestore, 'admins', newInterviewer.uid);
        await setDoc(adminDocRef, {
            id: newInterviewer.uid,
            email: interviewerEmail,
            role: 'User',
            name: interviewerEmail.split('@')[0],
        });
        
        setInterviewerEmail('');
        setInterviewerPassword('');
        toast({
            title: "Interviewer Added",
            description: "The new user has been successfully added to the panel.",
        });

    } catch (error: any) {
        toast({ variant: "destructive", title: "Failed to add interviewer", description: error.message });
    } finally {
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
    if (departments.find(d => d.name.toLowerCase() === newDepartment.toLowerCase())) {
        toast({ variant: "destructive", title: "Department already exists." });
        return;
    }

    try {
        const deptsColRef = collection(firestore, 'departments');
        await addDoc(deptsColRef, { name: newDepartment.trim() });
        setNewDepartment("");
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
                          <Button type="submit" disabled={isProfileUpdating}>
                            {isProfileUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Profile
                          </Button>
                      </CardContent>
                      </form>
                  </Card>

                   <Card>
                    <form onSubmit={handleUpdatePassword}>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your login password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
                                </div>
                            </div>
                            <Button type="submit" disabled={isPasswordUpdating}>
                                {isPasswordUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                        </CardContent>
                    </form>
                  </Card>

                  <Card>
                  <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>Manage how you receive notifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                          <div>
                              <Label htmlFor="new-submission-emails">New Submissions</Label>
                              <p className="text-sm text-muted-foreground">Receive an email for every new submission.</p>
                          </div>
                          <Switch id="new-submission-emails" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                          <div>
                              <Label htmlFor="candidate-completed-emails">Candidate Completed</Label>
                              <p className="text-sm text-muted-foreground">Receive an email when a candidate completes a challenge.</p>
                          </div>
                          <Switch id="candidate-completed-emails" defaultChecked />
                      </div>
                      <Button>Update Notifications</Button>
                  </CardContent>
                  </Card>
              </div>
          </TabsContent>
          <TabsContent value="interview-panel" className="space-y-4">
              {currentUserRole === 'Admin' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Interviewer</CardTitle>
                        <CardDescription>Invite a new interviewer to the panel by email.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddInterviewer} className="space-y-4">
                            <div className="flex flex-col md:flex-row items-end gap-4">
                              <div className="flex-1 w-full space-y-2">
                                  <Label htmlFor="interviewer-email">Email</Label>
                                  <Input id="interviewer-email" type="email" placeholder="interviewer@example.com" value={interviewerEmail} onChange={(e) => setInterviewerEmail(e.target.value)} disabled={isAddingInterviewer} />
                              </div>
                              <div className="flex-1 w-full space-y-2">
                                  <Label htmlFor="interviewer-password">Set Password</Label>
                                  <Input id="interviewer-password" type="password" placeholder="Set a temporary password" value={interviewerPassword} onChange={(e) => setInterviewerPassword(e.target.value)} disabled={isAddingInterviewer} />
                              </div>
                            </div>
                            <Button type="submit" className="w-full md:w-auto" disabled={isAddingInterviewer}>
                                {isAddingInterviewer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Interviewer
                            </Button>
                        </form>
                    </CardContent>
                </Card>
              )}
               <Card>
                  <CardHeader>
                      <CardTitle>Interview Panel</CardTitle>
                      <CardDescription>Manage your existing interview panel.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead className="hidden md:table-cell">Email</TableHead>
                                  <TableHead className="hidden md:table-cell">Role</TableHead>
                                  {currentUserRole === 'Admin' && <TableHead><span className="sr-only">Actions</span></TableHead>}
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {interviewers && interviewers.map((interviewer) => (
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
                                       <TableCell className="hidden md:table-cell">{interviewer.role}</TableCell>
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
                  </CardContent>
               </Card>
          </TabsContent>
           <TabsContent value="departments" className="space-y-4">
              {currentUserRole === 'Admin' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Department</CardTitle>
                        <CardDescription>Create a new department for positions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddDepartment} className="flex flex-col md:flex-row items-end gap-4">
                            <div className="flex-1 w-full space-y-2">
                                <Label htmlFor="department-name">Department Name</Label>
                                <Input 
                                id="department-name"
                                placeholder="e.g., Quality Assurance"
                                value={newDepartment}
                                onChange={(e) => setNewDepartment(e.target.value)} 
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Department
                            </Button>
                        </form>
                    </CardContent>
                </Card>
              )}
               <Card>
                  <CardHeader>
                      <CardTitle>Manage Departments</CardTitle>
                      <CardDescription>Your existing departments.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Department Name</TableHead>
                                  {currentUserRole === 'Admin' && <TableHead><span className="sr-only">Actions</span></TableHead>}
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {departments.map((dept) => (
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
