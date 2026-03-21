import { AuthResponse } from '../types';
import axiosClient from './axiosClient';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await axiosClient.post<AuthResponse>('/auth/login', { email, password });
  return data;
};

export const register = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const { data } = await axiosClient.post<AuthResponse>('/auth/register', { name, email, password });
  return data;
};
