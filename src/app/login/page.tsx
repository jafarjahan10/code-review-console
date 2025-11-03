
'use client';

import { useState } from "react";
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
import { useAuth, useFirestore } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function CandidateLoginPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!firestore || !auth) {
        toast({ variant: 'destructive', title: 'Firebase not initialized.'});
        setIsLoading(false);
        return;
    }

    try {
        // First, sign in anonymously to get permissions for the query
        const userCredential = await signInAnonymously(auth);
        
        const candidatesRef = collection(firestore, 'candidates');
        const q = query(
            candidatesRef, 
            where('email', '==', email), 
            where('accessCode', '==', accessCode)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // If login fails, sign out the anonymous user
            await userCredential.user.delete();
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid email or access code. Please try again.',
            });
        } else {
            // Found candidate, proceed
            const candidateData = querySnapshot.docs[0].data();
            const candidateId = querySnapshot.docs[0].id;
            
            // Store candidate info for the session
            sessionStorage.setItem('candidateId', candidateId);
            sessionStorage.setItem('candidateData', JSON.stringify(candidateData));
            
            toast({
                title: 'Login Successful!',
                description: `Welcome, ${candidateData.name}.`,
            });
            router.push('/');
        }
    } catch (error: any) {
        if (auth.currentUser) {
            await auth.currentUser.delete().catch(delError => console.error("Failed to clean up anonymous user:", delError));
        }
        toast({
            variant: 'destructive',
            title: 'An Error Occurred',
            description: error.message,
        });
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
          <CardTitle className="text-2xl font-headline pt-6">Candidate Portal</CardTitle>
          <CardDescription>
            Enter your credentials to access the coding challenge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="candidate@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="access-code">Access Code</Label>
              <Input 
                id="access-code" 
                type="text" 
                placeholder="Enter your access code" 
                required 
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
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
