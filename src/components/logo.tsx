import type { FC } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type LogoProps = {
  className?: string;
};

const Logo: FC<LogoProps> = ({ className }) => {
  return (
    <Link href="/admin" className={cn("flex items-center justify-center", className)}>
      <h1 className="text-2xl font-bold font-headline tracking-tighter">
        CodeReview
      </h1>
    </Link>
  );
};

export default Logo;
