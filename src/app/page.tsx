import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Code, User, Shield } from 'lucide-react';
import Logo from '@/components/logo';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-background">
      <div className="text-center mb-12">
        <Logo className="justify-center mb-4" />
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          The seamless platform for administering coding challenges and reviewing submissions with AI-powered insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Shield className="w-10 h-10 text-primary" />
              <div>
                <CardTitle className="font-headline text-2xl">Admin Portal</CardTitle>
                <CardDescription>Manage problems, invite candidates, and review submissions.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/dashboard">
                Enter Admin Portal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
              <User className="w-10 h-10 text-primary" />
              <div>
                <CardTitle className="font-headline text-2xl">Candidate Portal</CardTitle>
                <CardDescription>Access your assigned coding challenge and submit your solution.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/candidate/dashboard">
                Enter Candidate Portal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <footer className="mt-16 text-center text-muted-foreground text-sm">
        <p>Copyright © {new Date().getFullYear()} CodeReview Console. All rights reserved.</p>
      </footer>
    </main>
  );
}
