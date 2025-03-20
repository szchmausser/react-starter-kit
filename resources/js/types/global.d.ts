import type { route as routeFn } from 'ziggy-js';

interface Channel {
    listen(event: string, callback: (payload: any) => void): Channel;
    stopListening(event: string, callback?: (payload: any) => void): Channel;
}

declare global {
    const route: typeof routeFn;
    
    interface Window {
        Pusher: any;
        Echo: any; 
    }
}
