import { User, UserRole } from '../types';
import axiosClient from './axiosClient';

export const getUsers = async (): Promise<User[]> => {
  const { data } = await axiosClient.get<User[]>('/admin/users');
  return data;
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<User> => {
  const { data } = await axiosClient.patch<User>(`/auth/users/${userId}/role`, { role });
  return data;
};
