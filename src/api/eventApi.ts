import { Event, CreateEventPayload, UpdateEventPayload } from '../types';
import axiosClient from './axiosClient';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export const getEvents = async (params?: GetEventsParams): Promise<PaginatedResponse<Event>> => {
  const { data } = await axiosClient.get<PaginatedResponse<Event>>('/events', { params });
  return data;
};

export const getEventById = async (id: string): Promise<Event> => {
  const { data } = await axiosClient.get<Event>(`/events/${id}`);
  return data;
};

export const createEvent = async (payload: CreateEventPayload): Promise<Event> => {
  const { data } = await axiosClient.post<Event>('/events', payload);
  return data;
};

export const updateEvent = async (id: string, payload: UpdateEventPayload): Promise<Event> => {
  const { data } = await axiosClient.patch<Event>(`/events/${id}`, payload);
  return data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await axiosClient.delete(`/events/${id}`);
};

export const getCategories = async (): Promise<string[]> => {
  const { data } = await axiosClient.get<string[]>('/events/categories');
  return data;
};
