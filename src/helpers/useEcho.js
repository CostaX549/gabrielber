
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';


window.Pusher = Pusher;

export const useEcho = () => {
    const echo = new Echo({
        Pusher: Pusher,
        broadcaster: 'reverb', 
        key: import.meta.env.VITE_REVERB_APP_KEY, 
        wsHost: import.meta.env.VITE_REVERB_HOST, 
        wsPort: import.meta.env.VITE_REVERB_PORT, 
        wssPort: import.meta.env.VITE_REVERB_PORT, 
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });

    return echo;
};
