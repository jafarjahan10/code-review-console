'use client';

import type { FC } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect, useState } from 'react';

type LogoProps = {
  className?: string;
};

const Logo: FC<LogoProps> = ({ className }) => {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Determine the link's destination based on the current path.
  const href = pathname.startsWith('/admin') ? '/login' : '/admin';

  const logoContent = (
    <h1 className="text-2xl font-bold font-headline tracking-tighter">
        CodeReview
    </h1>
  );
  
  const isLinkActive = isClient && !isUserLoading && !user;

  return (
    <Link 
        href={isLinkActive ? href : '#'} 
        className={cn(
            "flex items-center justify-center",
            !isLinkActive && "pointer-events-none",
            className
        )}
        aria-disabled={!isLinkActive}
        tabIndex={isLinkActive ? 0 : -1}
    >
      {logoContent}
    </Link>
  );
};

export default Logo;
