
'use client';

import { TimerProvider } from "@/context/TimerContext";
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Candidate } from '@/types';
import { usePathname } from "next/navigation";
import { TimerDisplay } from "@/components/candidate/timer-display";
import { LogOut } from "lucide-react";
import Logo from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


export default function ProblemLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const candidateId = user?.uid;

    const candidateDocRef = useMemoFirebase(() => (firestore && candidateId ? doc(firestore, 'candidates', candidateId) : null), [firestore, candidateId]);
    const { data: candidate } = useDoc<Candidate>(candidateDocRef);
    
    const router = useRouter();
    const auth = useAuth();
    const { toast } = useToast();

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


    return (
        <TimerProvider scheduledTime={candidate?.scheduledTime} submitTime={candidate?.submitTime}>
             <div className="flex flex-col min-h-screen">
                <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                    <Logo />
                    <div className="flex-1 flex justify-center">
                        <TimerDisplay />
                    </div>
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Log Out</span>
                    </Button>
                </header>
                <main className="flex-1 bg-muted/40">{children}</main>
            </div>
        </TimerProvider>
    );
}
