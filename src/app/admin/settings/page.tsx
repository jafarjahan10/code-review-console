
'use client';

import { useState } from "react";
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
import { PlusCircle, Trash2 } from "lucide-react";
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


// Mock data for interviewers
const interviewers = [
    {
        id: "user_1",
        name: "Jane Doe",
        email: "jane.d@example.com",
    },
    {
        id: "user_2",
        name: "Mark Johnson",
        email: "mark.j@example.com",
    },
];

const initialDepartments = ["Engineering", "Design", "Product", "Marketing", "HR"];


export default function SettingsPage() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<string[]>(initialDepartments);
  const [newDepartment, setNewDepartment] = useState("");
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.trim()) {
      toast({ variant: "destructive", title: "Department name cannot be empty." });
      return;
    }
    if (departments.find(d => d.toLowerCase() === newDepartment.toLowerCase())) {
        toast({ variant: "destructive", title: "Department already exists." });
        return;
    }

    setDepartments([...departments, newDepartment.trim()]);
    setNewDepartment("");
    toast({ title: `Department "${newDepartment.trim()}" added.` });
  };

  const handleDeleteDepartment = () => {
    if (!departmentToDelete) return;
    setDepartments(departments.filter(d => d !== departmentToDelete));
    toast({
        title: "Department Removed",
        description: `The department "${departmentToDelete}" has been removed.`,
    });
    setDepartmentToDelete(null);
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
                  <CardHeader>
                      <CardTitle>Profile</CardTitle>
                      <CardDescription>Update your personal information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input id="name" defaultValue="Admin User" />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" defaultValue="admin@example.com" disabled />
                          </div>
                      </div>
                      <Button>Update Profile</Button>
                  </CardContent>
                  </Card>

                  <Card>
                  <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>Customize the look and feel of the application.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                          <div>
                              <Label htmlFor="theme">Theme</Label>
                              <p className="text-sm text-muted-foreground">The application is currently in dark mode.</p>
                          </div>
                          {/* Future theme toggle can go here */}
                      </div>
                  </CardContent>
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
              <Card>
                  <CardHeader>
                      <CardTitle>Add Interviewer</CardTitle>
                      <CardDescription>Invite a new interviewer to the panel by email.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <form className="flex flex-col md:flex-row items-end gap-4">
                          <div className="flex-1 w-full space-y-2">
                              <Label htmlFor="interviewer-email">Email</Label>
                              <Input id="interviewer-email" type="email" placeholder="interviewer@example.com" />
                          </div>
                          <Button type="submit" className="w-full md:w-auto">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add Interviewer
                          </Button>
                      </form>
                  </CardContent>
              </Card>
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
                                  <TableHead><span className="sr-only">Actions</span></TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {interviewers.map((interviewer) => (
                                  <TableRow key={interviewer.id}>
                                      <TableCell>
                                          <div className="flex items-center gap-3">
                                              <Avatar className="hidden h-9 w-9 sm:flex">
                                                  <AvatarImage src={`https://avatar.vercel.sh/${interviewer.email}.png`} alt="Avatar" />
                                                  <AvatarFallback>{interviewer.name.charAt(0)}</AvatarFallback>
                                              </Avatar>
                                              <div>
                                                <p className="font-medium">{interviewer.name}</p>
                                                <p className="text-sm text-muted-foreground md:hidden">{interviewer.email}</p>
                                              </div>
                                          </div>
                                      </TableCell>
                                      <TableCell className="hidden md:table-cell">{interviewer.email}</TableCell>
                                      <TableCell className="text-right">
                                          <Button variant="ghost" size="icon" className="text-destructive">
                                              <Trash2 className="h-4 w-4" />
                                              <span className="sr-only">Remove</span>
                                          </Button>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
               </Card>
          </TabsContent>
           <TabsContent value="departments" className="space-y-4">
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
                                  <TableHead><span className="sr-only">Actions</span></TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {departments.map((dept) => (
                                  <TableRow key={dept}>
                                      <TableCell className="font-medium">{dept}</TableCell>
                                      <TableCell className="text-right">
                                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDepartmentToDelete(dept)}>
                                              <Trash2 className="h-4 w-4" />
                                              <span className="sr-only">Remove {dept}</span>
                                          </Button>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
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
              This action cannot be undone. This will permanently remove the department &quot;{departmentToDelete}&quot;.
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
