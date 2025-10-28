import type { FC } from 'react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
};

const Logo: FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center", className)}>
      <h1 className="text-2xl font-bold font-headline tracking-tighter">
        CodeReveiw
      </h1>
    </div>
  );
};

export default Logo;
