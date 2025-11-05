
'use client';

import { useTimer } from '@/context/TimerContext';
import { Clock } from 'lucide-react';

export function TimerDisplay() {
    const { time, isRunning } = useTimer();

    if (!isRunning) {
        return null;
    }

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return (
        <div className="flex items-center justify-center rounded-md bg-muted px-4 py-2 font-mono text-lg text-muted-foreground">
            <Clock className="mr-2 h-5 w-5" />
            <span>{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
    );
}
