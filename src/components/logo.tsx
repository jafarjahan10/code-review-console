'use client';

import type { FC } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';

type LogoProps = {
  className?: string;
};

const Logo: FC<LogoProps> = ({ className }) => {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  
  // Determine the link's destination based on the current path.
  const href = pathname.startsWith('/admin') ? '/login' : '/admin';

  const logoContent = (
    <h1 className="text-2xl font-bold font-headline tracking-tighter">
        CodeReview
    </h1>
  );

  // While checking auth state, or if user is logged in, render as a plain div.
  if (isUserLoading || user) {
      return (
          <div className={cn("flex items-center justify-center", className)}>
              {logoContent}
          </div>
      );
  }

  // If the user is logged out, render as a link.
  return (
    <Link href={href} className={cn("flex items-center justify-center", className)}>
      {logoContent}
    </Link>
  );
};

export default Logo;
