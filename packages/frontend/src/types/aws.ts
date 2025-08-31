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
  justConnected: boolean; 
  
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

export interface UploadedFile {
  key: string;
  fileName: string;
  size: number;
  lastModified: Date;
  url?: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export interface BucketValidation {
  isValid: boolean;
  error?: string;
}

export interface PDFUploadProps {
  bucketName: string;
  onUploadSuccess: () => void;
  onError: (error: string) => void;
}
