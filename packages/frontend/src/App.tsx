import { AuthProvider } from './contexts/AuthContext';
import RoleSetup from './components/RoleSetup';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <main>
          <RoleSetup />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;