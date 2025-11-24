// API Service for communicating with the backend
import {
  ApiResponse,
  User,
  LoginResponse,
  GasStation,
  Pump,
  VerificationRequest,
  VerificationResponse,
  AuditLog,
  DashboardStats,
} from './types';

class ApiServiceClass {
  private baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  private currentUser: User | null = null;

  // Get current user info
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    if (!this.currentUser) {
      const userString = localStorage.getItem('user');
      if (userString) {
        this.currentUser = JSON.parse(userString);
      }
    }
    return this.currentUser;
  }

  // Set the current user
  setCurrentUser(user: User | null): void {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    }
  }

  // Clear the authentication token
  clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      // Clear cookie
      document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Strict';
    }
    this.currentUser = null;
  }

  // Get auth token
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  // Generic method for making API requests
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const token = this.getAuthToken();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };

      const response = await fetch(url, config);
      const jsonData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: jsonData.error || {
            code: 'UNKNOWN_ERROR',
            message: 'An error occurred',
          },
        };
      }

      return jsonData;
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }

  // ===== AUTHENTICATION =====

  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', 'POST', {
      username,
      password,
    });

    if (response.success && response.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Set cookie for middleware
        document.cookie = `accessToken=${response.data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      }
      this.currentUser = response.data.user;
    }

    return response;
  }

  async getMe(): Promise<ApiResponse<User>> {
    const response = await this.request<User>('/auth/me', 'GET');

    if (response.success && response.data) {
      this.currentUser = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    }

    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>('/auth/logout', 'POST', {});
    this.clearAuthToken();
    return response;
  }

  // ===== GAS STATION MANAGEMENT =====

  async getAllStations(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<GasStation[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/stations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<GasStation[]>(endpoint, 'GET');
  }

  async getStation(id: number): Promise<ApiResponse<GasStation>> {
    return this.request<GasStation>(`/stations/${id}`, 'GET');
  }

  async createStation(name: string, location: string): Promise<ApiResponse<GasStation>> {
    return this.request<GasStation>('/stations', 'POST', {
      name,
      location,
    });
  }

  async updateStation(id: number, updates: {
    name?: string;
    location?: string;
    status?: string;
  }): Promise<ApiResponse<GasStation>> {
    return this.request<GasStation>(`/stations/${id}`, 'PUT', updates);
  }

  async deleteStation(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/stations/${id}`, 'DELETE');
  }

  // ===== PUMP MANAGEMENT =====

  async getPumpsByStation(stationId: number): Promise<ApiResponse<Pump[]>> {
    return this.request<Pump[]>(`/stations/${stationId}/pumps`, 'GET');
  }

  async getAllPumps(): Promise<ApiResponse<Pump[]>> {
    return this.request<Pump[]>('/pumps', 'GET');
  }

  async getPump(id: number): Promise<ApiResponse<Pump>> {
    return this.request<Pump>(`/pumps/${id}`, 'GET');
  }

  async createPump(
    stationId: number,
    pumpData: {
      pumpNumber: number;
      mainRfidTag: string;
      expectedChildTags: Array<{ tagId: string; description: string }>;
    }
  ): Promise<ApiResponse<Pump>> {
    return this.request<Pump>(`/stations/${stationId}/pumps`, 'POST', pumpData);
  }

  async updatePump(id: number, updates: {
    pumpNumber?: number;
    mainRfidTag?: string;
    status?: string;
  }): Promise<ApiResponse<Pump>> {
    return this.request<Pump>(`/pumps/${id}`, 'PUT', updates);
  }

  async deletePump(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/pumps/${id}`, 'DELETE');
  }

  // ===== RFID VERIFICATION =====

  async verifyRfidTags(
    pumpId: number,
    verificationData: VerificationRequest
  ): Promise<ApiResponse<VerificationResponse>> {
    return this.request<VerificationResponse>(
      `/pumps/${pumpId}/verify`,
      'POST',
      verificationData
    );
  }

  async getVerificationHistory(
    pumpId: number,
    params?: {
      page?: number;
      limit?: number;
      result?: 'success' | 'failed';
    }
  ): Promise<ApiResponse<VerificationResponse[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.result) queryParams.append('result', params.result);

    const endpoint = `/pumps/${pumpId}/verifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<VerificationResponse[]>(endpoint, 'GET');
  }

  async getAllVerifications(params?: {
    page?: number;
    limit?: number;
    result?: 'success' | 'failed';
    stationId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<VerificationResponse[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.result) queryParams.append('result', params.result);
    if (params?.stationId) queryParams.append('stationId', params.stationId.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const endpoint = `/admin/verifications/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<VerificationResponse[]>(endpoint, 'GET');
  }

  // ===== ADMIN ANALYTICS =====

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/admin/analytics', 'GET');
  }

  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<AuditLog[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.action) queryParams.append('action', params.action);
    if (params?.entityType) queryParams.append('entityType', params.entityType);
    if (params?.userId) queryParams.append('userId', params.userId.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const endpoint = `/admin/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<AuditLog[]>(endpoint, 'GET');
  }

  async getStationActivity(stationId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/stations/${stationId}/logs`, 'GET');
  }

  // ===== HELPER METHODS =====

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api/v1', '')}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const ApiService = new ApiServiceClass();
