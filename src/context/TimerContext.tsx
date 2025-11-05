
'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

interface TimerContextProps {
    time: number;
    isRunning: boolean;
    startTimer: () => void;
    stopTimer: () => void;
}

const toDate = (timestamp: any): Date | undefined => {
    if (!timestamp) return undefined;
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return timestamp;
};


const TimerContext = createContext<TimerContextProps | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode; scheduledTime: any; submitTime: any; }> = ({ children, scheduledTime, submitTime }) => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startTimer = useCallback(() => {
        if (!isRunning) {
            setIsRunning(true);
        }
    }, [isRunning]);

    const stopTimer = useCallback(() => {
        if (isRunning) {
            setIsRunning(false);
        }
    }, [isRunning]);

    useEffect(() => {
        const startTime = toDate(scheduledTime);
        const endTime = toDate(submitTime);

        if (startTime) {
            if (endTime) {
                // If there is a submit time, calculate final duration and stop.
                const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
                setTime(duration > 0 ? duration : 0);
                stopTimer();
            } else {
                // No submit time, start a running timer.
                const initialSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
                setTime(initialSeconds > 0 ? initialSeconds : 0);
                startTimer();
            }
        }
    }, [scheduledTime, submitTime, startTimer, stopTimer]);


    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    return (
        <TimerContext.Provider value={{ time, isRunning, startTimer, stopTimer }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
};
