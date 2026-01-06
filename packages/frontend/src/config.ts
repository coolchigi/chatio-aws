/// <reference types="vite/client" />

export const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  externalId: import.meta.env.VITE_EXTERNAL_ID,
  region: 'us-east-1'
};
