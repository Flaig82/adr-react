import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { NavMenu } from './components/NavMenu';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CharacterCreate } from './pages/CharacterCreate';
import { CharacterProfile } from './pages/CharacterProfile';
import { Battle } from './pages/Battle';
import { Inventory } from './pages/Inventory';
import { Shop } from './pages/Shop';
import { Forge } from './pages/Forge';
import { Vault } from './pages/Vault';
import { Town } from './pages/Town';
import { Chat } from './pages/Chat';
import { CharacterList } from './pages/CharacterList';
import { Jail } from './pages/Jail';

function AuthenticatedApp() {
  const { hasCharacter } = useAuthStore();

  if (!hasCharacter) {
    return (
      <Routes>
        <Route path="/create-character" element={<CharacterCreate />} />
        <Route path="*" element={<Navigate to="/create-character" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <NavMenu />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/character" replace />} />
          <Route path="/character" element={<CharacterProfile />} />
          <Route path="/create-character" element={<Navigate to="/character" replace />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/forge" element={<Forge />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/town" element={<Town />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/characters" element={<CharacterList />} />
          <Route path="/jail" element={<Jail />} />
          <Route path="*" element={<Navigate to="/character" replace />} />
        </Routes>
      </main>
    </>
  );
}

function UnauthenticatedApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  const { userId, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-adr-gold mb-2">ADR</div>
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {userId ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </BrowserRouter>
  );
}
