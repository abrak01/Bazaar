import React from 'react';
import { Button } from './ui/Button';

interface WalletConnectProps {
  onConnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  return (
    <Button onClick={onConnect} className="font-semibold shadow-md">
      Connect Freighter Wallet
    </Button>
  );
};
