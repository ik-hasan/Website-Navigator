import React, { useEffect, useRef } from 'react';

function LogConsole({ logs }) {
    const consoleRef = useRef(null);

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [logs]);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };

    return (
        <div
            ref={consoleRef}
            className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm"
        >
            {logs.length === 0 ? (
                <p className="text-gray-400">No logs yet...</p>
            ) : (
                logs.map((log, index) => (
                    <div
                        key={index}
                        className={`py-1 px-2 mb-1 rounded ${log.level === 'success'
                                ? 'text-green-400'
                                : log.level === 'error'
                                    ? 'text-red-400'
                                    : 'text-gray-300'
                            }`}
                    >
                        <span className="text-gray-500 mr-2">
                            [{formatTime(log.timestamp)}]
                        </span>
                        <span
                            className={`mr-2 font-bold ${log.level === 'success'
                                    ? 'text-green-500'
                                    : log.level === 'error'
                                        ? 'text-red-500'
                                        : 'text-blue-500'
                                }`}
                        >
                            {log.level.toUpperCase()}
                        </span>
                        <span>{log.message}</span>
                    </div>
                ))
            )}
        </div>
    );
}

export default LogConsole;
