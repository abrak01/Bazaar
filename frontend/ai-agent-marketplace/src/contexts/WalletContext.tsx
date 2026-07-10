import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FreighterApi, NetworkType, SignTransactionOptions } from '@stellar/freighter-api';
import { Networks } from '@stellar/stellar-sdk';

interface WalletState {
  publicKey: string | null;
  network: NetworkType | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  isLoading: boolean;
  availableNetworks: NetworkType[];
}

interface WalletContextType extends WalletState {
  connect: (network?: NetworkType) => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string, opts?: SignTransactionOptions) => Promise<string>;
  signAuthEntry: (xdr: string, address: string, networkPassphrase: string) => Promise<string>;
  switchNetwork: (network: NetworkType) => Promise<void>;
  refreshBalance: () => Promise<void>;
  isFreighterInstalled: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

const freighterApi = new FreighterApi();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    publicKey: null,
    network: null,
    isConnected: false,
    isConnecting: false,
    balance: '0',
    isLoading: false,
    availableNetworks: [NetworkType.TESTNET, NetworkType.PUBLIC],
  });

  const checkConnection = useCallback(async () => {
    try {
      const isConnected = await freighterApi.isConnected();
      if (isConnected) {
        const publicKey = await freighterApi.getPublicKey();
        const network = await freighterApi.getNetwork();
        setState(prev => ({ ...prev, publicKey, network, isConnected: true }));
        await refreshBalance();
      } else {
        setState(prev => ({ ...prev, isConnected: false }));
      }
    } catch (error) {
      console.error('Failed to check Freighter connection:', error);
      setState(prev => ({ ...prev, isConnected: false }));
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!state.publicKey || !state.network) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const rpcUrl = state.network === NetworkType.TESTNET 
        ? 'https://soroban-testnet.stellar.org' 
        : 'https://soroban-mainnet.stellar.org';
      
      const response = await fetch(`${rpcUrl}/accounts/${state.publicKey}`);
      if (response.ok) {
        const data = await response.json();
        const usdcBalance = data.balances?.find((b: any) => b.asset_code === 'USDC')?.balance || '0';
        setState(prev => ({ ...prev, balance: usdcBalance, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.publicKey, state.network]);

  const connect = useCallback(async (network: NetworkType = NetworkType.TESTNET) => {
    setState(prev => ({ ...prev, isConnecting: true }));
    try {
      await freighterApi.connect();
      await freighterApi.switchNetwork(network);
      
      const publicKey = await freighterApi.getPublicKey();
      const currentNetwork = await freighterApi.getNetwork();
      
      setState(prev => ({ 
        ...prev, 
        publicKey, 
        network: currentNetwork, 
        isConnected: true, 
        isConnecting: false 
      }));
      
      await refreshBalance();
    } catch (error) {
      setState(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
  }, [refreshBalance]);

  const disconnect = useCallback(() => {
    setState({
      publicKey: null,
      network: null,
      isConnected: false,
      isConnecting: false,
      balance: '0',
      isLoading: false,
      availableNetworks: [NetworkType.TESTNET, NetworkType.PUBLIC],
    });
  }, []);

  const signTransaction = useCallback(async (xdr: string, opts?: SignTransactionOptions): Promise<string> => {
    return freighterApi.signTransaction(xdr, {
      networkPassphrase: state.network === NetworkType.TESTNET 
        ? Networks.TESTNET 
        : Networks.PUBLIC,
      ...opts,
    });
  }, [state.network]);

  const signAuthEntry = useCallback(async (xdr: string, address: string, networkPassphrase: string): Promise<string> => {
    return freighterApi.signAuthEntry(xdr, address, networkPassphrase);
  }, []);

  const switchNetwork = useCallback(async (network: NetworkType) => {
    await freighterApi.switchNetwork(network);
    const currentNetwork = await freighterApi.getNetwork();
    setState(prev => ({ ...prev, network: currentNetwork }));
    await refreshBalance();
  }, [refreshBalance]);

  useEffect(() => {
    const isInstalled = freighterApi.isInstalled();
    checkConnection();
    
    const handleAccountChange = () => checkConnection();
    const handleNetworkChange = () => checkConnection();
    
    window.addEventListener('freighter:accountChanged', handleAccountChange);
    window.addEventListener('freighter:networkChanged', handleNetworkChange);
    
    return () => {
      window.removeEventListener('freighter:accountChanged', handleAccountChange);
      window.removeEventListener('freighter:networkChanged', handleNetworkChange);
    };
  }, [checkConnection]);

  return (
    <WalletContext.Provider value={{
      ...state,
      connect,
      disconnect,
      signTransaction,
      signAuthEntry,
      switchNetwork,
      refreshBalance,
      isFreighterInstalled: freighterApi.isInstalled(),
    }}>
      {children}
    </WalletContext.Provider>
  );
};