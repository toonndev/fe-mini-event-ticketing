import { Booking } from '../types';
import axiosClient from './axiosClient';


export const createBooking = async (eventId: string, quantity: number): Promise<Booking> => {
  const { data } = await axiosClient.post<Booking>('/bookings', { eventId, quantity });
  return data;
};

export const getMyBookings = async (): Promise<Booking[]> => {
  const { data } = await axiosClient.get<Booking[]>('/bookings/me');
  return data;
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
  await axiosClient.delete(`/bookings/${bookingId}`);
};
