import { User, UserRole, EventBooking, PaginatedResponse } from '../types';
import axiosClient from './axiosClient';

export const getUsers = async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
  const { data } = await axiosClient.get<PaginatedResponse<User>>('/admin/users', { params: { page, limit } });
  return data;
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<User> => {
  const { data } = await axiosClient.patch<User>(`/auth/users/${userId}/role`, { role });
  return data;
};

export const getEventBookings = async (eventId: string, page = 1, limit = 10): Promise<PaginatedResponse<EventBooking>> => {
  const { data } = await axiosClient.get<PaginatedResponse<EventBooking>>(`/admin/events/${eventId}/bookings`, { params: { page, limit } });
  return data;
};
