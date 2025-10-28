'use client';

import Link from "next/link";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Timer from "@/components/candidate/timer";
import { usePathname } from "next/navigation";


export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isProblemPage = pathname.includes('/candidate/problem');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex-1">
          {isProblemPage && <Timer />}
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/login">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Log Out</span>
          </Link>
        </Button>
      </header>
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
