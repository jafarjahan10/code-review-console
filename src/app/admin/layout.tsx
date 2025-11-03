
'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import AdminSidebar from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, adminUser, isUserLoading } = useUser();
  const { toast } = useToast();
  const [wasOnAdmin, setWasOnAdmin] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      setWasOnAdmin(true);
    }
  }, [pathname]);

  const isLoginPage = pathname === '/admin' || pathname === '/admin/login';

  useEffect(() => {
    if (isUserLoading) return; // Wait until user auth state is resolved

    // If no user is logged in at all, redirect to the admin login page.
    if (!user && !isLoginPage) {
      router.push('/admin/login');
      return;
    }

    // If a user is logged in, but we can't find their profile in the 'admins' collection,
    // or their role is not 'Admin' or 'User', they are not authorized.
    if (user && !adminUser && !isLoginPage) {
        toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "You are not authorized to access this page."
        });
        
        // If the user was trying to access an admin page, redirect to admin login.
        if (wasOnAdmin || pathname.startsWith('/admin')) {
            router.push('/admin/login');
        } else {
            // Fallback for other cases, though less likely in this layout.
            router.push('/login');
        }
        return;
    }

  }, [isUserLoading, user, adminUser, isLoginPage, router, toast, wasOnAdmin, pathname]);


  // Show a loading skeleton while the user and their role are being verified.
  if (isUserLoading && !isLoginPage) {
    return (
        <div className="flex" style={{height: '100dvh'}}>
            <div className="hidden md:flex">
                <div className="w-64 h-full border-r p-4 space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>
            </div>
            <main className="flex-1 p-8">
                <Skeleton className="h-10 w-64 mb-4" />
                <Skeleton className="h-4 w-96 mb-8" />
                <Skeleton className="w-full h-96" />
            </main>
      </div>
    )
  }

  // Render the login page without the admin sidebar.
  if (isLoginPage) {
      return <>{children}</>;
  }
      
  // If the user is authenticated and authorized, show the admin panel.
  if (user && adminUser) {
    return (
        <div className="flex" style={{height: '100dvh'}}>
            <div className="hidden md:flex">
                <AdminSidebar />
            </div>
            <main className="flex-1 bg-background overflow-y-auto no-scrollbar">
                <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Admin Menu</SheetTitle>
                            <SheetDescription>Navigation links for the admin dashboard.</SheetDescription>
                        </SheetHeader>
                    <AdminSidebar />
                    </SheetContent>
                </Sheet>
                </header>
                {children}
            </main>
        </div>
    );
  }

  // Fallback for the brief moment before redirection for unauthenticated/unauthorized users.
  return (
    <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
    </div>
  );
}
