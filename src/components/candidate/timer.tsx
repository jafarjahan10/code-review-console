
'use client';
import { useTimer } from '@/context/TimerContext';
import { Clock } from 'lucide-react';

export default function Timer() {
    const { time } = useTimer();

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return (
        <div className="flex items-center justify-center font-mono text-lg">
            <Clock className="mr-2 h-5 w-5" />
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
    );
}
