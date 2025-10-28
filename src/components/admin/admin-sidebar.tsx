
"use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileCode, Users, BookCopy, LogOut, Settings } from "lucide-react";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const navItems = [
  { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/problems", icon: FileCode, label: "Problems" },
  { href: "/admin/candidates", icon: Users, label: "Candidates" },
  { href: "/admin/submissions", icon: BookCopy, label: "Submissions" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't render sidebar on the login page
  if (pathname === '/admin/login' || pathname === '/admin') {
    return null;
  }

  const handleSignOut = () => {
    // In a real app, you'd handle the sign-out logic here.
    // For this prototype, we'll just navigate to the login page.
    router.push('/admin/login');
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-card text-card-foreground flex flex-col">
      <div className="p-4 border-b">
        <Logo />
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href)) ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="p-4 border-t mt-auto space-y-2">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="#">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
