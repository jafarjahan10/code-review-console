
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";

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
        const userCredential = await signInWithEmailAndPassword(auth, email, accessCode);
        const user = userCredential.user;

        const candidateDocRef = doc(firestore, 'candidates', user.uid);
        const candidateDocSnap = await getDoc(candidateDocRef);

        if (candidateDocSnap.exists()) {
             const candidateData = candidateDocSnap.data();
             if (candidateData.accessCode === accessCode) {
                 sessionStorage.setItem('candidateId', user.uid);
                 toast({
                    title: 'Login Successful!',
                    description: `Welcome, ${candidateData.name}.`,
                });
                router.push('/');
             } else {
                throw new Error("Invalid access code.");
             }
        } else {
            throw new Error("No candidate profile found for this email.");
        }
    } catch (error: any) {
        let errorMessage = "Invalid email or access code. Please try again.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
             errorMessage = "Invalid email or access code provided.";
        } else if (error.message) {
            errorMessage = error.message;
        }
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: errorMessage,
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
                type="password" 
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
