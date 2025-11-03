
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

type AdminUser = {
    id: string;
    name: string | null;
    email: string;
    role: "Admin" | "User";
}

export default function NewTechnologyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();

  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const adminsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'admins') : null, [firestore]);
  const { data: admins, isLoading: isLoadingAdmins } = useCollection<AdminUser>(adminsColRef);

  const currentUserRole = useMemo(() => {
    if (!currentUser || !admins) return null;
    const adminUser = admins.find(admin => admin.id === currentUser.uid);
    return adminUser?.role;
  }, [currentUser, admins]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (currentUserRole !== 'Admin') {
        toast({ variant: 'destructive', title: 'Permission Denied', description: 'You do not have permission to create technologies.' });
        return;
    }
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Missing Name',
        description: 'Please provide a name for the technology.',
      });
      return;
    }
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available' });
        return;
    }
    setIsLoading(true);

    try {
        await addDoc(collection(firestore, 'technologies'), {
            name,
            name_lowercase: name.toLowerCase(),
            createdAt: serverTimestamp(),
        });

        toast({
            title: 'Technology Created!',
            description: `The technology "${name}" has been successfully created.`,
        });
        router.push('/admin/technologies');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: 'Creation Failed',
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (isLoadingAdmins) {
    return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">Loading...</div>
  }

  if (currentUserRole !== 'Admin') {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                <Link href="/admin/technologies">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight font-headline">
                    Access Denied
                </h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                        Permission Required
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have the necessary permissions to create a new technology. Please contact an administrator.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/admin/technologies">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Add New Technology
          </h2>
          <p className="text-muted-foreground">
            Create a new technology entry.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-2">
                <Label htmlFor="name">Technology Name</Label>
                <Input
                    id="name"
                    placeholder="e.g., JavaScript"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Technology
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
