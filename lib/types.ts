// Type definitions matching the backend API schema

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'OPERATOR' | 'SUPER_ADMIN';
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface GasStation {
  id: number;
  name: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: number;
  lastVerificationAt?: string;
}

export interface ExpectedChildTag {
  id: number;
  tagId: string;
  description: string;
}

export interface Pump {
  id: number;
  gasStationId: number;
  pumpNumber: number;
  mainRfidTag: string;
  status: 'LOCKED' | 'UNLOCKED' | 'BROKEN' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: number;
  lastVerificationAt?: string;
  expectedChildTags?: ExpectedChildTag[];
}

export interface VerificationRequest {
  mainTagScanned: string;
  scannedChildTags: string[];
}

export interface VerificationResponse {
  sessionId: number;
  result: 'success' | 'failed';
  message: string;
  details: {
    expectedCount: number;
    scannedCount: number;
    missingTags: string[];
    unexpectedTags: string[];
  };
  pumpStatus: 'LOCKED' | 'BROKEN';
  timestamp: string;
  pumpId?: number;
  userId?: number;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'STATION' | 'PUMP' | 'USER' | 'VERIFICATION';
  entityId: number;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalStations: number;
  totalPumps: number;
  activeStations: number;
  verificationsTodayCount: number;
  verificationsWeekCount: number;
  failedVerificationsWeek: number;
  successRate: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}
