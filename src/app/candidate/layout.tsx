
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
    if (isUserLoading) {
      return; // Wait until the user's auth state is resolved
    }

    const isPublicPage = pathname === '/login' || pathname.startsWith('/admin');

    // If the check is complete, there's no user, and we are not on a public page, redirect.
    if (!user && !isPublicPage) {
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

  const isPublicPage = pathname === '/login' || pathname.startsWith('/admin');

  // While checking for user, show a loading skeleton UI for any protected route
  if (isUserLoading && !isPublicPage) {
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

  // If there's no user and we're not on a public page yet, render nothing
  // as the redirect will happen shortly. This prevents flashing content.
  if (!user && !isPublicPage) {
    return null;
  }
  
  // If we are on a public page, just render the children
  if (isPublicPage) {
    return <>{children}</>;
  }

  // If user is authenticated, show the main layout for candidate routes
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
