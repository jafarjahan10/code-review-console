'use client';

import type { FC } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type LogoProps = {
  className?: string;
};

const Logo: FC<LogoProps> = ({ className }) => {
  const pathname = usePathname();
  
  // If on any admin page, link to the candidate login. Otherwise, link to the admin area.
  const href = pathname.startsWith('/admin') ? '/login' : '/admin';

  return (
    <Link href={href} className={cn("flex items-center justify-center", className)}>
      <h1 className="text-2xl font-bold font-headline tracking-tighter">
        CodeReview
      </h1>
    </Link>
  );
};

export default Logo;
