
'use client';

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
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

export default function InterviewPanelPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();

  const [interviewerEmail, setInterviewerEmail] = useState('');
  const [interviewerPassword, setInterviewerPassword] = useState('');
  const [isAddingInterviewer, setIsAddingInterviewer] = useState(false);
  const [interviewerToDelete, setInterviewerToDelete] = useState<WithId<AdminUser> | null>(null);
  const [interviewerSearchTerm, setInterviewerSearchTerm] = useState("");
  const [interviewerCurrentPage, setInterviewerCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);

  const adminsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'admins') : null, [firestore]);
  const { data: interviewers } = useCollection<AdminUser>(adminsColRef);

  const currentUserInPanel = useMemo(() => {
    if (!currentUser || !interviewers) return null;
    return interviewers.find(interviewer => interviewer.id === currentUser.uid);
  }, [currentUser, interviewers]);

  const currentUserRole = currentUserInPanel?.role;

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
  }, [filteredInterviewers, interviewerCurrentPage]);

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
    
    const tempAppName = `temp-user-creation-${Date.now()}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    try {
        const { user: newInterviewer } = await createUserWithEmailAndPassword(tempAuth, interviewerEmail, interviewerPassword);
        
        const adminDocRef = doc(firestore, 'admins', newInterviewer.uid);
        await setDoc(adminDocRef, {
            id: newInterviewer.uid,
            email: interviewerEmail,
            role: 'User',
            name: interviewerEmail.split('@')[0],
        });
        
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

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Interview Panel</h2>
                <p className="text-muted-foreground">Manage your existing interview panel.</p>
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>The list of users with access to this panel.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="mb-4 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Search by name or email..."
                      value={interviewerSearchTerm}
                      onChange={(e) => {
                          setInterviewerSearchTerm(e.target.value);
                          setInterviewerCurrentPage(1);
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
    </>
  );
}
