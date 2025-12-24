import { useState, useEffect } from 'react';
import { useSession } from '../SessionContext';

export function SessionTimer() {
  const { credentials, isExpired, clearSession } = useSession();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!credentials) return;

    const timer = setInterval(() => {
      if (isExpired()) {
        clearSession();
        alert('Session expired. Please reconnect.');
        return;
      }

      const now = new Date().getTime();
      const exp = new Date(credentials.expiration).getTime();
      const diff = exp - now;

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [credentials, isExpired, clearSession]);

  if (!credentials) return null;

  return (
    <div style={{ padding: '10px', background: '#f0f0f0' }}>
      Session expires in: <strong>{timeLeft}</strong>
      <button onClick={clearSession} style={{ marginLeft: '20px' }}>
        Disconnect
      </button>
    </div>
  );
}
