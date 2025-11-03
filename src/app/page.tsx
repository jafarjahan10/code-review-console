
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import ProblemDisplay from "@/components/candidate/problem-display";
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';


export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // If auth state is determined and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      router.push('/login');
      toast({ title: "Logged out successfully." });
    } catch (error: any) {
       toast({ variant: 'destructive', title: "Logout Failed", description: error.message });
    }
  }

  // Show a loading indicator while checking auth state.
  if (isUserLoading) {
    return (
       <div className="flex flex-col min-h-screen">
         <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Logo />
          <div className="flex-1 text-center">
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </header>
        <main className="flex-1 bg-muted/40 flex items-center justify-center p-4">
             <Card className="w-full max-w-2xl animate-pulse">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-40" />
                </CardContent>
            </Card>
        </main>
      </div>
    )
  }

  // Only render the page content if the user is authenticated.
  if (user) {
    return (
      <div className="flex flex-col min-h-screen">
         <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Logo />
          <div className="flex-1 text-center">
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log Out</span>
          </Button>
        </header>
        <main className="flex-1 bg-muted/40 flex items-center justify-center p-4">
          <ProblemDisplay />
        </main>
      </div>
    );
  }

  // Render nothing or a fallback while redirecting
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
       <Logo />
       <div className="flex-1 text-center">
       </div>
       <Skeleton className="h-10 w-10 rounded-full" />
     </header>
     <main className="flex-1 bg-muted/40 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl animate-pulse">
             <CardHeader>
                 <Skeleton className="h-8 w-3/4" />
                 <Skeleton className="h-4 w-1/2 mt-2" />
             </CardHeader>
             <CardContent>
                 <Skeleton className="h-10 w-40" />
             </CardContent>
         </Card>
     </main>
   </div>
  );
}
