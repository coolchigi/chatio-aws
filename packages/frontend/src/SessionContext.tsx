import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SessionCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
}

interface SessionResource {
  type: 's3' | 'kb' | 'datasource' | 'vectorstore';
  id: string;
  name: string;
}

interface SessionContextType {
  credentials: SessionCredentials | null;
  resources: SessionResource[];
  roleArn: string | null;
  setCredentials: (creds: SessionCredentials | null) => void;
  setRoleArn: (arn: string | null) => void;
  addResource: (resource: SessionResource) => void;
  clearSession: () => void;
  isExpired: () => boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<SessionCredentials | null>(() => {
    const saved = localStorage.getItem('session-credentials');
    return saved ? JSON.parse(saved) : null;
  });

  const [roleArn, setRoleArn] = useState<string | null>(() => {
    return localStorage.getItem('role-arn');
  });

  const [resources, setResources] = useState<SessionResource[]>(() => {
    const saved = localStorage.getItem('session-resources');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (credentials) {
      localStorage.setItem('session-credentials', JSON.stringify(credentials));
    } else {
      localStorage.removeItem('session-credentials');
    }
  }, [credentials]);

  useEffect(() => {
    if (roleArn) {
      localStorage.setItem('role-arn', roleArn);
    } else {
      localStorage.removeItem('role-arn');
    }
  }, [roleArn]);

  useEffect(() => {
    localStorage.setItem('session-resources', JSON.stringify(resources));
  }, [resources]);

  const isExpired = () => {
    if (!credentials) return true;
    return new Date(credentials.expiration) <= new Date();
  };

  const addResource = (resource: SessionResource) => {
    setResources(prev => [...prev, resource]);
  };

  const clearSession = () => {
    setCredentials(null);
    setRoleArn(null);
    setResources([]);
    localStorage.clear();
  };

  return (
    <SessionContext.Provider
      value={{
        credentials,
        resources,
        roleArn,
        setCredentials,
        setRoleArn,
        addResource,
        clearSession,
        isExpired
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
