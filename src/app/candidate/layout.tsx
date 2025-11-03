
'use client';

import { useEffect } from 'react';
import Link from "next/link";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';


export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until the authentication check is complete
    if (isUserLoading) {
      return;
    }
    
    // If not loading and there's no user, redirect to login page.
    // Allow access to the login page itself to avoid a redirect loop.
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [isUserLoading, user, router, pathname]);


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

  // While checking for user, show a loading skeleton UI
  if (isUserLoading && pathname !== '/login') {
      return (
         <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <Logo />
                <div className="flex-1"></div>
                <Skeleton className="h-10 w-10 rounded-full" />
            </header>
            <main className="flex-1 bg-muted/40 p-4 flex items-center justify-center">
                 <Skeleton className="h-48 w-full max-w-2xl" />
            </main>
        </div>
      );
  }

  // If there's no user and we're not on the login page, render nothing
  // as the redirect will happen shortly. This prevents flashing content.
  if (!user && pathname !== '/login') {
    return null;
  }
  
  // If we are on the login page, just render the children (the login form)
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // If user is authenticated, show the main layout
  return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Logo />
          <div className="flex-1">
          </div>
          {user && (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log Out</span>
            </Button>
          )}
        </header>
        <main className="flex-1 bg-muted/40">{children}</main>
      </div>
  );
}
