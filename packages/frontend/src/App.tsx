import { SessionProvider, useSession } from './SessionContext';
import { RoleSetup } from './components/RoleSetup';
import { SessionTimer } from './components/SessionTimer';
import { S3Manager } from './components/S3Manager';

function AppContent() {
  const { credentials } = useSession();

  if (!credentials) {
    return <RoleSetup />;
  }

  return (
    <div>
      <SessionTimer />
      <h1>AWS Bedrock PDF Chat</h1>
      <S3Manager />
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
