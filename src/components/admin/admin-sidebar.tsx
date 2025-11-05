
"use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileCode, Users, BookCopy, LogOut, Settings, Layers, Briefcase, ChevronDown, SlidersHorizontal, Building } from "lucide-react";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "../theme-toggle";
import { Separator } from "../ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const mainNavItems = [
  { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/problems", icon: FileCode, label: "Problems" },
  { href: "/admin/candidates", icon: Users, label: "Candidates" },
  { href: "/admin/submissions", icon: BookCopy, label: "Submissions" },
];

const adminManagementItems = [
  { href: "/admin/interview-panel", icon: Users, label: "Interview Panel" },
  { href: "/admin/technologies", icon: Layers, label: "Technologies" },
  { href: "/admin/positions", icon: Briefcase, label: "Positions" },
  { href: "/admin/departments", icon: Building, label: "Departments" },
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

  const isManagementRouteActive = adminManagementItems.some(item => pathname.startsWith(item.href));


  return (
    <aside className="w-full h-full flex-shrink-0 border-r bg-card text-card-foreground flex flex-col md:w-64">
      <div className="p-4 border-b">
        <Logo />
      </div>
      <nav className="flex-1 p-4 space-y-2 flex flex-col">
        {mainNavItems.map((item) => {
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
        <Accordion type="single" collapsible defaultValue={isManagementRouteActive ? "admin-management" : undefined} className="w-full">
            <AccordionItem value="admin-management" className="border-b-0">
                 <AccordionTrigger className="py-2 px-4 text-sm font-medium hover:bg-muted rounded-md hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    <span className="flex items-center">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Admin Management
                    </span>
                </AccordionTrigger>
                <AccordionContent className="pt-1">
                    <div className="flex flex-col space-y-1 pl-6 border-l ml-4">
                        {adminManagementItems.map((item) => {
                             const isActive = pathname.startsWith(item.href);
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
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </nav>
      <div className="p-4 border-t space-y-3">
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
        </div>
        <Separator />
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
