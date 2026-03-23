import { useState, useEffect, useCallback } from 'react';
import { Event } from '../types';
import { getEvents, getEventById, GetEventsParams } from '../api/eventApi';

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Paginated event list — used in EventListPage
export const useEvents = (params?: GetEventsParams) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 9, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEvents(params);
      setEvents(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [
    params?.page,
    params?.limit,
    params?.search,
    params?.category,
    params?.status,
  ]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, pagination, loading, error, refetch: fetchEvents };
};

// Featured events for slider + recommendations (fetches once, no deps)
export const useFeaturedEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    getEvents({ page: 1, limit: 10 }).then((res) => setEvents(res.data));
  }, []);

  return events;
};

// Single event by ID
export const useEvent = (id: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEventById(id);
      setEvent(data);
    } catch {
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, loading, error, refetch: fetchEvent };
};
