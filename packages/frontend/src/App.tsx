import { SessionProvider, useSession } from './SessionContext';
import { RoleSetup } from './components/RoleSetup';
import { SessionTimer } from './components/SessionTimer';

function AppContent() {
  const { credentials } = useSession();

  if (!credentials) {
    return <RoleSetup />;
  }

  return (
    <div>
      <SessionTimer />
      <h1>AWS Bedrock PDF Chat</h1>
      <p>Connected! Ready to build S3Manager and other components...</p>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
