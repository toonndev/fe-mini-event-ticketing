import { Event } from '../types';
import axiosClient from './axiosClient';

export const getEvents = async (): Promise<Event[]> => {
  const { data } = await axiosClient.get<Event[]>('/events');
  return data;
};

export const getEventById = async (id: string): Promise<Event> => {
  const { data } = await axiosClient.get<Event>(`/events/${id}`);
  return data;
};
