import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletSelector({ open, onOpenChange }: WalletSelectorProps) {
  const { connect, connecting, availableWallets, refreshAvailableWallets } = useWallet();
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState<'phantom' | 'solflare' | 'backpack' | null>(null);

  // Refresh available wallets when dialog opens
  useEffect(() => {
    if (open) {
      refreshAvailableWallets();
    }
  }, [open, refreshAvailableWallets]);

  const handleConnect = async (walletName: 'phantom' | 'solflare' | 'backpack') => {
    setSelectedWallet(walletName);
    try {
      await connect(walletName);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setSelectedWallet(null);
    }
  };

  const walletInfo = {
    phantom: {
      name: "Phantom",
      icon: "👻",
      installUrl: "https://phantom.app/",
    },
    solflare: {
      name: "Solflare",
      icon: "☀️",
      installUrl: "https://solflare.com/",
    },
    backpack: {
      name: "Backpack",
      icon: "🎒",
      installUrl: "https://backpack.app/",
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-wallet-selector">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect to Galia Football
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          {(['phantom', 'solflare', 'backpack'] as const).map((walletName) => {
            const info = walletInfo[walletName];
            const isAvailable = availableWallets.includes(walletName);
            const isConnecting = connecting && selectedWallet === walletName;

            return (
              <div key={walletName} className="flex items-center gap-3">
                <Button
                  onClick={() => handleConnect(walletName)}
                  disabled={!isAvailable || connecting}
                  className="flex-1 justify-start gap-3 h-auto py-4"
                  variant={isAvailable ? "outline" : "secondary"}
                  data-testid={`button-connect-${walletName}`}
                >
                  <span className="text-2xl">{info.icon}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{info.name}</span>
                    {!isAvailable && (
                      <span className="text-xs text-muted-foreground">Not installed</span>
                    )}
                    {isConnecting && (
                      <span className="text-xs text-muted-foreground">Connecting...</span>
                    )}
                  </div>
                </Button>
                {!isAvailable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    data-testid={`button-install-${walletName}`}
                  >
                    <a href={info.installUrl} target="_blank" rel="noopener noreferrer">
                      Install
                    </a>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        {availableWallets.length === 0 && (
          <div className="text-center text-sm text-muted-foreground mt-4" data-testid="text-no-wallets">
            No wallets detected. Please install a wallet extension to continue.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
