import { useEffect, useState } from 'react';
import { TicketStatus } from '../types';

interface LiveTicketData {
  remainingTickets: number;
  ticketStatus: TicketStatus;
}

// Connects once to GET /events/live and tracks live data for all events
export const useGlobalLive = () => {
  const [liveMap, setLiveMap] = useState<Map<string, LiveTicketData>>(new Map());

  useEffect(() => {
    const url = `${import.meta.env.VITE_API_URL}/events/live`;
    const es = new EventSource(url);

    es.onmessage = (e) => {
      try {
        const { eventId, remainingTickets, ticketStatus } = JSON.parse(e.data);
        setLiveMap((prev) => new Map(prev).set(eventId, { remainingTickets, ticketStatus }));
      } catch {
        // ignore malformed messages
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, []);

  return liveMap;
};
