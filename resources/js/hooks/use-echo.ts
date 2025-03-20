import { useEffect, useRef } from 'react';

// Echo is already initialized in echo.js and available globally
// This hook provides a convenient way to use it in React components

interface ChannelData {
    count: number;
    channel: any; // You can replace `any` with a more specific type if available (e.g., Echo.Channel)
  }
  
  interface Channels {
    [channelName: string]: ChannelData;
  }

const channels: Channels = {};

export default function useEcho(channel: string, event: string | string[], callback: (payload: any) => void, dependencies = [], visibility: 'private' | 'public' = 'private') {
    const eventRef = useRef(callback);

    useEffect(() => {
        eventRef.current = callback;

        const channelName: any = visibility === 'public' ? channel : `${visibility}-${channel}`;

        if (!channels[channelName]) {
            channels[channelName] = {
                count: 1,
                channel: visibility === 'public' 
                    ? window.Echo.channel(channel) 
                    : window.Echo.private(channel),
            };
        } else {
            channels[channelName].count += 1;
        }

        const subscription = channels[channelName].channel;

        const listener = (payload: any) => {
            eventRef.current(payload);
        };

        const events = Array.isArray(event) ? event : [event];

        events.forEach((e) => {
            subscription.listen(e, listener);
        });

        return () => {
            events.forEach((e) => {
                subscription.stopListening(e, listener);
            });
            channels[channelName].count -= 1;
            if (channels[channelName].count === 0) {
                window.Echo.leaveChannel(channelName);
                delete channels[channelName];
            }
        };
    }, [...dependencies]); // eslint-disable-line
}