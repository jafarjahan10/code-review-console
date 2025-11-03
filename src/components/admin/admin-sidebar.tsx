
"use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileCode, Users, BookCopy, LogOut, Settings, Layers, Briefcase } from "lucide-react";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/problems", icon: FileCode, label: "Problems" },
  { href: "/admin/technologies", icon: Layers, label: "Technologies" },
  { href: "/admin/positions", icon: Briefcase, label: "Positions" },
  { href: "/admin/candidates", icon: Users, label: "Candidates" },
  { href: "/admin/submissions", icon: BookCopy, label: "Submissions" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
      toast({ title: "Signed out successfully." });
    } catch (error) {
      console.error("Sign out error", error);
      toast({ variant: "destructive", title: "Failed to sign out." });
    }
  }

  return (
    <aside className="w-full h-full flex-shrink-0 border-r bg-card text-card-foreground flex flex-col md:w-64">
      <div className="p-4 border-b">
        <Logo />
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
           const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && String(pathname).startsWith(item.href));
           return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive && "bg-accent text-accent-foreground hover:bg-accent/80 hover:text-accent-foreground"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
           )
        })}
      </nav>
      <div className="p-4 border-t mt-auto space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
