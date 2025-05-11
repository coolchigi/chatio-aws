import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// For development purposes
const DEV_MODE = true;

interface AuthComponentProps {
  children: React.ReactNode;
}

const AuthComponent: React.FC<AuthComponentProps> = ({ children }) => {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // This would typically come from environment variables or a config file
    const awsConfig = {
      // Required for Amplify v6+
      Auth: {
        Cognito: {
          userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
          userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || '',
          loginWith: {
            username: true,
            email: true,
            phone: false
          },
          // Explicitly set to use USER_PASSWORD_AUTH
          authenticationFlowType: 'USER_PASSWORD_AUTH'
        }
      },
      // Specify the AWS region
      region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    };

    try {
      Amplify.configure(awsConfig);
      setIsConfigured(true);
    } catch (error) {
      console.error('Error configuring Amplify:', error);
    }
  }, []);

  // For development, bypass authentication
  if (DEV_MODE) {
    return (
      <div>
        <div className="auth-header">
          <p>Welcome, Developer! (Dev Mode)</p>
          <button>Sign out (Dev Mode)</button>
        </div>
        {children}
      </div>
    );
  }

  if (!isConfigured) {
    return <div>Loading authentication...</div>;
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <div className="auth-header">
            <p>Welcome, {user?.username}!</p>
            <button onClick={signOut}>Sign out</button>
          </div>
          {children}
        </div>
      )}
    </Authenticator>
  );
};

export default AuthComponent;