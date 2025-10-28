import type { FC } from 'react';
import { FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
};

const Logo: FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <FileCode className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold font-headline tracking-tighter">
        CodeReview Console
      </h1>
    </div>
  );
};

export default Logo;
