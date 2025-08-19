import api from './api';

export interface Provider {
  _id: string;
  userId: {
    name: string;
    phone: string;
    email: string;
  };
  businessName?: string;
  services: {
    category: string;
    subcategory?: string;
    hourlyRate: number;
    description?: string;
  }[];
  serviceArea: {
    pincode: string;
    radius: number;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  verification: {
    aadhaarVerified: boolean;
    aadhaarNumber?: string;
    policeVerification: boolean;
    backgroundCheck: boolean;
  };
  profile: {
    experience: number;
    portfolio: string[];
    certifications: string[];
    languages: string[];
  };
  status: 'online' | 'offline' | 'busy';
  ratings: {
    average: number;
    count: number;
  };
  stats: {
    totalJobs: number;
    completedJobs: number;
    acceptanceRate: number;
    responseTime: number;
    totalEarnings: number;
  };
  badges: string[];
  isQuickAdd: boolean;
  onboardingCompleted: boolean;
  smartScore?: number;
}

export interface ProviderSearchParams {
  pincode?: string;
  radius?: number;
  category?: string;
  status?: string;
  minRating?: number;
  maxPrice?: number;
  aadhaarVerified?: boolean;
  sortBy?: 'smart' | 'rating' | 'price';
}

export interface QuickAddData {
  name: string;
  phone: string;
  serviceCategory: string;
  hourlyRate: number;
  pincode: string;
  serviceRadius: number;
}

export const providerService = {
  async searchProviders(params: ProviderSearchParams): Promise<Provider[]> {
    const response = await api.get('/providers/search', { params });
    return response.data;
  },

  async getProvider(id: string): Promise<Provider> {
    const response = await api.get(`/providers/${id}`);
    return response.data;
  },

  async createQuickAddProvider(data: QuickAddData): Promise<{ providerId: string; userId: string }> {
    const response = await api.post('/providers/quick-add', data);
    return response.data;
  },

  async updateProviderStatus(id: string, status: string): Promise<void> {
    await api.patch(`/providers/${id}/status`, { status });
  }
};