
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import ProblemDisplay from "@/components/candidate/problem-display";
import { useRouter } from 'next/navigation';

// Mock authentication state
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd check for a valid session token.
    // Here we'll simulate a check. For the prototype, we assume the user is "logged in" if they aren't on the login page.
    // To properly test the login flow, you'd implement a real auth check here.
    // For now, let's just assume they are authenticated if they land here.
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  return { isAuthenticated, isLoading };
};


export default function Home() {
  const router = useRouter();
  const {isAuthenticated, isLoading} = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
       <div className="flex min-h-screen items-center justify-center">
        {/* You can replace this with a proper loading spinner component */}
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex-1 text-center">
        </div>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
          <span className="sr-only">Profile</span>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/login">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Log Out</span>
          </Link>
        </Button>
      </header>
      <main className="flex-1 bg-muted/40 flex items-center justify-center p-4">
        <ProblemDisplay />
      </main>
    </div>
  );
}
