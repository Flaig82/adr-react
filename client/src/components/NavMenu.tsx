import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';
import { api } from '../api/client';

const navItems = [
  { path: '/character', label: 'Character', icon: '👤' },
  { path: '/battle', label: 'Battle', icon: '⚔️' },
  { path: '/inventory', label: 'Inventory', icon: '🎒' },
  { path: '/shop', label: 'Shop', icon: '🏪' },
  { path: '/forge', label: 'Forge', icon: '🔨' },
  { path: '/vault', label: 'Vault', icon: '🏦' },
  { path: '/town', label: 'Town', icon: '🏘️' },
  { path: '/chat', label: 'Chat', icon: '💬' },
  { path: '/characters', label: 'Characters', icon: '📜' },
  { path: '/jail', label: 'Jail', icon: '⛓️' },
];

export function NavMenu() {
  const location = useLocation();
  const { username, logout } = useAuthStore();
  const [isJailed, setIsJailed] = useState(false);

  // Check jail status periodically
  useEffect(() => {
    const checkJail = async () => {
      try {
        const status = await api.getJailStatus();
        setIsJailed(status.isJailed);
      } catch { /* ignore */ }
    };
    checkJail();
    const interval = setInterval(checkJail, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-adr-darker border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-adr-gold">ADR</span>
            <span className="text-sm text-gray-400 hidden sm:inline">Adventure RPG</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isJailLink = item.path === '/jail';
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                    ${isActive
                      ? 'bg-adr-blue text-white'
                      : isJailLink && isJailed
                      ? 'text-red-400 bg-red-900/20 hover:bg-red-900/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden md:inline">{item.label}</span>
                  {isJailLink && isJailed && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{username}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-adr-red transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
