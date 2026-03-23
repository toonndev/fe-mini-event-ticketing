export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type TicketStatus = 'available' | 'almost_full' | 'sold_out';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  venue: string;
  totalTickets: number;
  remainingTickets: number;
  status: TicketStatus;
}

export interface Booking {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  quantity: number;
  bookedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateEventPayload {
  name: string;
  description: string;
  date: string;
  venue: string;
  totalTickets: number;
}

export interface UpdateEventPayload {
  name?: string;
  description?: string;
  date?: string;
  venue?: string;
  totalTickets?: number;
}
