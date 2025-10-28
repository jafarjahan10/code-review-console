
'use client';
import AdminSidebar from "@/components/admin/admin-sidebar";
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
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}
