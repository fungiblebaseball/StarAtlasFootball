import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

interface WalletContextType {
  connected: boolean;
  publicKey: PublicKey | null;
  walletAddress: string | null;
  connecting: boolean;
  connect: (walletName: 'phantom' | 'solflare' | 'backpack') => Promise<void>;
  disconnect: () => void;
  walletType: 'phantom' | 'solflare' | 'backpack' | null;
  availableWallets: Array<'phantom' | 'solflare' | 'backpack'>;
  refreshAvailableWallets: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

declare global {
  interface Window {
    solana?: any;
    solflare?: any;
    backpack?: any;
  }
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'phantom' | 'solflare' | 'backpack' | null>(null);
  const [availableWallets, setAvailableWallets] = useState<Array<'phantom' | 'solflare' | 'backpack'>>([]);

  // Function to check available wallets
  const checkAvailableWallets = () => {
    const available: Array<'phantom' | 'solflare' | 'backpack'> = [];
    if (window.solana?.isPhantom) available.push('phantom');
    if (window.solflare) available.push('solflare');
    if (window.backpack?.isBackpack) available.push('backpack');
    setAvailableWallets(available);
    return available;
  };

  // Check for existing connection and available wallets on mount
  useEffect(() => {
    const checkConnection = async () => {
      // Check available wallets
      checkAvailableWallets();

      // Check for existing connection
      if (window.solana?.isPhantom && window.solana.isConnected) {
        const pk = new PublicKey(window.solana.publicKey.toString());
        setPublicKey(pk);
        setWalletAddress(pk.toString());
        setConnected(true);
        setWalletType('phantom');
      } else if (window.solflare?.isConnected) {
        const pk = new PublicKey(window.solflare.publicKey.toString());
        setPublicKey(pk);
        setWalletAddress(pk.toString());
        setConnected(true);
        setWalletType('solflare');
      } else if (window.backpack?.isConnected) {
        const pk = new PublicKey(window.backpack.publicKey.toString());
        setPublicKey(pk);
        setWalletAddress(pk.toString());
        setConnected(true);
        setWalletType('backpack');
      }
    };
    
    checkConnection();
  }, []);

  const connect = async (walletName: 'phantom' | 'solflare' | 'backpack') => {
    setConnecting(true);
    try {
      if (walletName === 'phantom') {
        if (!window.solana?.isPhantom) {
          throw new Error('Phantom wallet not found. Please install it from phantom.app');
        }
        // Request read-only connection with minimal permissions
        const response = await window.solana.connect({ onlyIfTrusted: false });
        const pk = new PublicKey(response.publicKey.toString());
        
        setPublicKey(pk);
        setWalletAddress(pk.toString());
        setConnected(true);
        setWalletType('phantom');
        
        console.log('Connected to Phantom wallet:', pk.toString());
      } else if (walletName === 'solflare') {
        if (!window.solflare) {
          throw new Error('Solflare wallet not found. Please install it from solflare.com');
        }
        await window.solflare.connect();
        const pk = new PublicKey(window.solflare.publicKey.toString());
        
        setPublicKey(pk);
        setWalletAddress(pk.toString());
        setConnected(true);
        setWalletType('solflare');
        
        console.log('Connected to Solflare wallet:', pk.toString());
      } else if (walletName === 'backpack') {
        if (!window.backpack) {
          throw new Error('Backpack wallet not found. Please install it from backpack.app');
        }
        await window.backpack.connect();
        const pk = new PublicKey(window.backpack.publicKey.toString());
        
        setPublicKey(pk);
        setWalletAddress(pk.toString());
        setConnected(true);
        setWalletType('backpack');
        
        console.log('Connected to Backpack wallet:', pk.toString());
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    if (walletType === 'phantom' && window.solana) {
      window.solana.disconnect();
    } else if (walletType === 'solflare' && window.solflare) {
      window.solflare.disconnect();
    } else if (walletType === 'backpack' && window.backpack) {
      window.backpack.disconnect();
    }
    
    setConnected(false);
    setPublicKey(null);
    setWalletAddress(null);
    setWalletType(null);
    
    console.log('Wallet disconnected');
  };

  return (
    <WalletContext.Provider value={{
      connected,
      publicKey,
      walletAddress,
      connecting,
      connect,
      disconnect,
      walletType,
      availableWallets,
      refreshAvailableWallets: checkAvailableWallets,
    }}>
      {children}
    </WalletContext.Provider>
  );
}
