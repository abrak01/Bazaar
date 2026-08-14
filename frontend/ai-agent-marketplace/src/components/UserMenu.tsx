import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button } from './ui/Button';
import { Link } from 'react-router-dom';

export const UserMenu: React.FC = () => {
  const { publicKey, disconnect } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const shortAddr = publicKey
    ? `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 4)}`
    : '';

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 border-primary/40 bg-card/60"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{shortAddr}</span>
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl border bg-card p-2 shadow-xl z-50"
          onClick={() => setIsOpen(false)}
        >
          <Link
            to="/dashboard"
            className="block px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
          >
            📊 Dashboard
          </Link>
          <Link
            to="/settings"
            className="block px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
          >
            ⚙️ Settings
          </Link>
          <hr className="my-1 border-border" />
          <button
            onClick={disconnect}
            className="w-full text-left px-3 py-2 text-sm rounded-lg text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            🚪 Disconnect
          </button>
        </div>
      )}
    </div>
  );
};
