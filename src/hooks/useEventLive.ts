import { useEffect, useState } from 'react';
import { TicketStatus } from '../types';

interface LiveTicketData {
  remainingTickets: number;
  ticketStatus: TicketStatus;
}

export const useEventLive = (eventId: string | undefined) => {
  const [liveData, setLiveData] = useState<LiveTicketData | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const url = `${import.meta.env.VITE_API_URL}/events/${eventId}/live`;
    const es = new EventSource(url);

    es.onmessage = (e) => {
      try {
        const data: LiveTicketData = JSON.parse(e.data);
        setLiveData(data);
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
  }, [eventId]);

  return liveData;
};
