import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

interface WalletContextType {
  connected: boolean;
  publicKey: PublicKey | null;
  walletAddress: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  walletType: 'phantom' | 'solflare' | null;
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
  }
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'phantom' | 'solflare' | null>(null);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
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
      }
    };
    
    checkConnection();
  }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      // Try Phantom first
      if (window.solana?.isPhantom) {
        // Request read-only connection with minimal permissions
        const response = await window.solana.connect({ onlyIfTrusted: false });
        const pk = new PublicKey(response.publicKey.toString());
        
        setPublicKey(pk);
        setWalletAddress(pk.toString());
        setConnected(true);
        setWalletType('phantom');
        
        console.log('Connected to Phantom wallet:', pk.toString());
        return;
      }
      
      // Try Solflare if Phantom not available
      if (window.solflare) {
        await window.solflare.connect();
        const pk = new PublicKey(window.solflare.publicKey.toString());
        
        setPublicKey(pk);
        setWalletAddress(pk.toString());
        setConnected(true);
        setWalletType('solflare');
        
        console.log('Connected to Solflare wallet:', pk.toString());
        return;
      }
      
      // No wallet found
      alert('Please install Phantom or Solflare wallet extension');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    if (walletType === 'phantom' && window.solana) {
      window.solana.disconnect();
    } else if (walletType === 'solflare' && window.solflare) {
      window.solflare.disconnect();
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
    }}>
      {children}
    </WalletContext.Provider>
  );
}
