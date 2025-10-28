
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CandidateLoginPage() {
  const router = useRouter();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, you'd handle candidate authentication here.
    // For this prototype, we'll set a session item and navigate.
    sessionStorage.setItem('authenticated', 'true');
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline">Candidate Portal</CardTitle>
          <CardDescription>
            Enter your credentials to access the coding challenge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="candidate@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="access-code">Access Code</Label>
              <Input id="access-code" type="text" required />
            </div>
            <Button type="submit" className="w-full mt-2">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
