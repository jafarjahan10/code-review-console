
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


export default function SettingsPage() {
  return (
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
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="interview-panel">Interview Panel</TabsTrigger>
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
                    <form className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="interviewer-email">Email</Label>
                            <Input id="interviewer-email" type="email" placeholder="interviewer@example.com" />
                        </div>
                        <Button type="submit">
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
                                <TableHead>Email</TableHead>
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
                                            <p className="font-medium">{interviewer.name}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{interviewer.email}</TableCell>
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
      </Tabs>
    </div>
  );
}
