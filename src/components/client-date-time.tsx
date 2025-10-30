
'use client';

import { useEffect, useState } from 'react';

type ClientDateTimeProps = {
    date: string | number | Date;
}

export default function ClientDateTime({ date }: ClientDateTimeProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        // Render a placeholder on the server
        return <span>...</span>;
    }

    const dateTime = new Date(date);
    return <span>{dateTime.toLocaleString()}</span>;
}
