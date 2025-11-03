
'use client';

import { TimerProvider } from "@/context/TimerContext";

export default function ProblemLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TimerProvider>
            {children}
        </TimerProvider>
    );
}
