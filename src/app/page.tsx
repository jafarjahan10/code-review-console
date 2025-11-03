
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import ProblemDisplay from "@/components/candidate/problem-display";
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';


export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [candidateId, setCandidateId] = useState<string | null>(null);

  useEffect(() => {
    // This now relies on Firebase Auth state and sessionStorage for candidate data
    const storedCandidateId = sessionStorage.getItem('candidateId');
    setCandidateId(storedCandidateId);

    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleLogout = () => {
    sessionStorage.removeItem('candidateId');
    sessionStorage.removeItem('candidateData');
    // Firebase sign out will be handled by the sidebar/header component
    router.push('/login');
  }

  if (isUserLoading || (!user && !candidateId)) {
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
