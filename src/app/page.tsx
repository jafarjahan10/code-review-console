
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import ProblemDisplay from "@/components/candidate/problem-display";
import { useRouter } from 'next/navigation';

// Mock authentication state
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would check for a session token.
    // For this prototype, we'll simulate an unauthenticated user by default.
    // To proceed to the main content, the user must "log in" via the /login page.
    if (typeof window !== 'undefined') {
      const session = sessionStorage.getItem('authenticated');
      if (session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }
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
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Logo />
        <div className="flex-1 text-center">
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/login" onClick={() => sessionStorage.removeItem('authenticated')}>
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
