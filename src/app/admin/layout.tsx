
'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import AdminSidebar from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const isLoginPage = pathname === '/admin' || pathname === '/admin/login';

  useEffect(() => {
    if (!isUserLoading && !user && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isUserLoading, user, isLoginPage, router]);


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

  if(isLoginPage) {
    return <>{children}</>
  }

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
