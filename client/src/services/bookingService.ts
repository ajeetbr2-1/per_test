import api from './api';

export interface Booking {
  _id: string;
  customer: string;
  provider: {
    _id: string;
    userId: {
      name: string;
      phone: string;
    };
    services: any[];
    ratings: {
      average: number;
      count: number;
    };
  };
  service: {
    category: string;
    subcategory?: string;
    description: string;
    estimatedDuration?: number;
    hourlyRate: number;
  };
  location: {
    address: string;
    pincode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  scheduling: {
    preferredDate: string;
    preferredTime?: string;
    flexibility: 'strict' | 'flexible';
  };
  status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'ON_THE_WAY' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED';
  payment: {
    method: 'cash' | 'online' | 'card';
    amount?: number;
    status: 'pending' | 'paid' | 'refunded';
    transactionId?: string;
  };
  otp: {
    startOTP: string;
    endOTP: string;
    startOTPVerified: boolean;
    endOTPVerified: boolean;
  };
  timeline: {
    requested: string;
    accepted?: string;
    rejected?: string;
    onTheWay?: string;
    inService?: string;
    completed?: string;
    cancelled?: string;
  };
  notes: {
    customer?: string;
    provider?: string;
  };
  createdAt: string;
}

export interface CreateBookingData {
  providerId: string;
  serviceCategory: string;
  description: string;
  location: {
    address: string;
    pincode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  scheduling: {
    preferredDate: string;
    preferredTime?: string;
    flexibility: 'strict' | 'flexible';
  };
  estimatedDuration?: number;
}

export interface BookingListResponse {
  bookings: Booking[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export const bookingService = {
  async createBooking(data: CreateBookingData): Promise<{ booking: Booking; startOTP: string; endOTP: string }> {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  async getMyBookings(status?: string, page = 1, limit = 10): Promise<BookingListResponse> {
    const params: any = { page, limit };
    if (status) params.status = status;
    
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  },

  async getProviderBookings(status?: string, page = 1, limit = 10): Promise<BookingListResponse> {
    const params: any = { page, limit };
    if (status) params.status = status;
    
    const response = await api.get('/bookings/provider-bookings', { params });
    return response.data;
  },

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data.booking;
  },

  async verifyOTP(id: string, otp: string, type: 'start' | 'end'): Promise<Booking> {
    const response = await api.post(`/bookings/${id}/verify-otp`, { otp, type });
    return response.data.booking;
  }
};