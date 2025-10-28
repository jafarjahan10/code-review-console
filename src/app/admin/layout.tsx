
'use client';
import AdminSidebar from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin' || pathname === '/admin/login';

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
