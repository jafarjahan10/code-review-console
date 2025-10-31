
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import { useRouter } from "next/navigation";
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDocs, collection, setDoc, query, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@echologyx.com');
  const [password, setPassword] = useState('Echologyx@1234');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Attempt to sign in first
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard');
    } catch (error: any) {
      // If invalid credential, check if it's the initial admin login
      if (error.code === 'auth/invalid-credential' && email === 'admin@echologyx.com') {
        try {
          // Check if any admin user already exists
          const adminsQuery = query(collection(firestore, 'admins'), limit(1));
          const adminSnapshot = await getDocs(adminsQuery);

          if (adminSnapshot.empty) {
            // No admins exist, create the first one
            const { user: newAdminUser } = await createUserWithEmailAndPassword(auth, email, password);
            const adminDocRef = doc(firestore, 'admins', newAdminUser.uid);
            await setDoc(adminDocRef, {
              id: newAdminUser.uid,
              email: newAdminUser.email,
              name: 'Default Admin',
              role: 'Admin',
            });
            toast({
              title: 'Admin Account Created',
              description: 'Your initial admin account has been set up.',
            });
            router.push('/admin/dashboard');
          } else {
            // Admins exist, so the credentials were just wrong
            throw error;
          }
        } catch (creationError: any) {
           toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: creationError.message || 'An unknown error occurred during initial setup.',
          });
        }
      } else {
         toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message || 'An unknown error occurred.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/40">
        <div className="absolute top-4 left-4">
            <Logo />
        </div>
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline pt-6">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
