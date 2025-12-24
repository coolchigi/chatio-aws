import { useState } from 'react';
import { useSession } from '../SessionContext';
import { config } from '../config';

export function RoleSetup() {
  const [roleArn, setRoleArnInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setCredentials, setRoleArn } = useSession();

  const handleConnect = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${config.backendUrl}/api/auth/assume-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleArn })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assume role');
      }

      setCredentials(data);
      setRoleArn(roleArn);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Connect AWS Account</h2>
      <p>Enter your IAM role ARN (created via CloudFormation template)</p>
      
      <input
        type="text"
        placeholder="arn:aws:iam::123456789012:role/ChatPDFRole-xxx"
        value={roleArn}
        onChange={(e) => setRoleArnInput(e.target.value)}
        disabled={loading}
      />

      <button onClick={handleConnect} disabled={loading || !roleArn}>
        {loading ? 'Connecting...' : 'Connect'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <details>
        <summary>Setup Instructions</summary>
        <ol>
          <li>Deploy CloudFormation template in your AWS account</li>
          <li>Copy the Role ARN from stack outputs</li>
          <li>Paste ARN above and click Connect</li>
        </ol>
      </details>
    </div>
  );
}
