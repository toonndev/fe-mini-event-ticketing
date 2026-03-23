export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type EventCategory = 'concert' | 'conference' | 'sport' | 'workshop' | 'festival' | 'exhibition' | 'other';

export type EventStatus = 'draft' | 'published' | 'cancelled';

export type TicketStatus = 'available' | 'almost_full' | 'sold_out';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  endDate: string | null;
  venue: string;
  totalTickets: number;
  remainingTickets: number;
  ticketPrice: number;
  category: EventCategory;
  imageUrl: string | null;
  maxTicketsPerUser: number;
  tags: string[] | null;
  status: EventStatus;
  ticketStatus: TicketStatus;
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

export interface EventBooking {
  bookingId: string;
  quantity: number;
  bookedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
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
  category: EventCategory;
  endDate?: string;
  ticketPrice?: number;
  imageUrl?: string;
  maxTicketsPerUser?: number;
  status?: EventStatus;
  tags?: string[];
}

export interface UpdateEventPayload {
  name?: string;
  description?: string;
  date?: string;
  endDate?: string;
  venue?: string;
  totalTickets?: number;
  ticketPrice?: number;
  category?: EventCategory;
  imageUrl?: string;
  maxTicketsPerUser?: number;
  status?: EventStatus;
  tags?: string[];
}
