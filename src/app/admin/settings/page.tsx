
'use client';

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from "firebase/firestore";
import { updatePassword, updateProfile, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default function SettingsPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();

  const [name, setName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
        setName(currentUser.displayName || '');
    }
  }, [currentUser]);


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !firestore) return;
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

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Settings
          </h2>
          <p className="text-muted-foreground">
            Manage your account settings.
          </p>
        </div>

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
      </div>
    </>
  );
}
