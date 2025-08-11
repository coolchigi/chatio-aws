import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AuthContextType, AuthProviderProps } from '../types/aws';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleArn, setRoleArn] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  // Derived state
  const isConnected = !!sessionId;

  const connectToRole = useCallback(async (roleArnInput: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/auth/assume-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleArn: roleArnInput.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        setRoleArn(roleArnInput.trim());
        setExpiresAt(data.expiresAt ? new Date(data.expiresAt) : null);
      } else {
        setError(data.error || 'Failed to connect to AWS role');
      }
    } catch (err) {
      setError('Network error. Please check if the backend is running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Call logout endpoint to clear backend session
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
    } catch (err) {
      console.warn('Failed to logout from backend:', err);
    } finally {
      // Clear local state regardless of backend response
      setSessionId(null);
      setRoleArn(null);
      setExpiresAt(null);
      setError(null);
    }
  }, [sessionId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isSessionValid = useCallback(() => {
    if (!sessionId || !expiresAt) return false;
    return new Date() < expiresAt;
  }, [sessionId, expiresAt]);

  const getTimeUntilExpiry = useCallback(() => {
    if (!expiresAt) return null;
    return expiresAt.getTime() - new Date().getTime();
  }, [expiresAt]);

  const value: AuthContextType = {
    // State
    sessionId,
    isConnected,
    isLoading,
    error,
    roleArn,
    expiresAt,
    
    // Actions
    connectToRole,
    disconnect,
    clearError,
    
    // Utility
    isSessionValid,
    getTimeUntilExpiry,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;

}