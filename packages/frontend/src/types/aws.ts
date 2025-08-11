import { ReactNode } from "react";

export interface AuthContextType {
  // Connection state
  sessionId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Role information
  roleArn: string | null;
  expiresAt: Date | null;
  
  // Actions
  connectToRole: (roleArn: string) => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
  
  // Utility
  isSessionValid: () => boolean;
  getTimeUntilExpiry: () => number | null;
}

export interface AuthProviderProps {
  children: ReactNode;
}