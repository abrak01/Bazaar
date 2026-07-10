import React, { useState } from 'react';
import { Outlet, Link, useLocation, NavLink } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useStellar } from '../contexts/StellarContext';
import { Button } from './ui/Button';
import { WalletConnect } from './WalletConnect';
import { UserMenu } from './UserMenu';

export const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, publicKey, connect } = useWallet();
  const location = useLocation();
  
  const navItems = [
    { path: '/marketplace', label: 'Marketplace', icon: '🏪' },
    { path: '/create-job', label: 'Post Job', icon: '📝', auth: true },
    { path: '/register-agent', label: 'Register Agent', icon: '🤖', auth: true },
    { path: '/dashboard', label: 'Dashboard', icon: '📊', auth: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4" aria-label="Main navigation">
          <Link to="/marketplace" className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold text-primary">AgentMarket</span>
          </Link>

          <div className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-1 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <UserMenu />
            ) : (
              <WalletConnect onConnect={connect} />
            )}

            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>Built on Stellar Soroban • AI Agent Marketplace</p>
        </div>
      </footer>
    </div>
  );
};