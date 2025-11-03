import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface WalletConnectButtonProps {
  onConnect?: () => void;
  connected?: boolean;
  walletAddress?: string;
}

export default function WalletConnectButton({ 
  onConnect, 
  connected = false, 
  walletAddress 
}: WalletConnectButtonProps) {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Button 
      size="lg" 
      onClick={onConnect}
      className="h-14 px-8 font-heading text-base"
      data-testid="button-wallet-connect"
    >
      <Wallet className="mr-2 h-5 w-5" />
      {connected && walletAddress ? truncateAddress(walletAddress) : "Connect Phantom Wallet"}
    </Button>
  );
}
