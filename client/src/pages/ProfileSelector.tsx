import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PlayerProfile {
  id: string;
  walletAddress: string;
  playerProfilePubkey: string | null;
  teamName: string | null;
  formation: string | null;
}

interface PlayerProfileBlockchain {
  pubkey: string;
  authority: string;
  name?: string;
  metadata?: Record<string, any>;
}

export default function ProfileSelector() {
  const { connected, walletAddress } = useWallet();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedPubkey, setSelectedPubkey] = useState<string | null>(null);

  // Fetch blockchain player profiles
  const { data: blockchainProfiles, isLoading: isLoadingBlockchain } = useQuery<{ profiles: PlayerProfileBlockchain[]; count: number }>({
    queryKey: ["/api/blockchain/player-profiles", walletAddress],
    queryFn: async () => {
      const response = await fetch(`/api/blockchain/player-profiles?walletAddress=${encodeURIComponent(walletAddress || "")}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch player profiles: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: connected && !!walletAddress,
    retry: false,
  });

  // Fetch existing profile from database
  const { data: existingProfile } = useQuery<PlayerProfile>({
    queryKey: ["/api/profile", walletAddress],
    queryFn: async () => {
      const response = await fetch(`/api/profile?walletAddress=${encodeURIComponent(walletAddress || "")}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: connected && !!walletAddress,
    retry: false,
  });

  // Sync crew mutation
  const syncCrewMutation = useMutation({
    mutationFn: async (playerProfilePubkey: string | null) => {
      const response = await apiRequest("POST", "/api/profile/sync-crew", {
        walletAddress,
        playerProfilePubkey,
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crew/cached"] });
      
      // Show different notification based on crew changes
      // replacedCount is always present from backend response
      if (data.replacedCount !== undefined && data.replacedCount > 0) {
        toast({
          title: "Team composition changed",
          description: `${data.replacedCount} player${data.replacedCount > 1 ? 's' : ''} ${data.replacedCount > 1 ? 'are' : 'is'} no longer available and ${data.replacedCount > 1 ? 'have' : 'has'} been replaced. Check your roster page to review your new lineup.`,
        });
      } else if (data.replacedCount !== undefined && data.replacedCount === 0) {
        toast({
          title: "Profile synced successfully",
          description: data.message || `Your team is ready with ${data.crewCount || 15} crew members`,
        });
      } else {
        // Fallback for unexpected response format
        toast({
          title: "Profile synced",
          description: data.message || "Your profile has been synced",
        });
      }
      
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectProfile = (pubkey: string) => {
    setSelectedPubkey(pubkey);
    syncCrewMutation.mutate(pubkey);
  };

  const handleUseDefaultProfile = () => {
    syncCrewMutation.mutate(null);
  };

  if (!connected || !walletAddress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle data-testid="text-title">Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to select a player profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation("/")} 
              className="w-full"
              data-testid="button-go-home"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Select Player Profile
        </h1>
        <p className="text-muted-foreground" data-testid="text-description">
          Choose a Star Atlas player profile to use for your team
        </p>
        <div className="mt-2">
          <Badge variant="outline" data-testid="badge-wallet">
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
          </Badge>
        </div>
      </div>

      {isLoadingBlockchain ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" data-testid="icon-loading" />
        </div>
      ) : blockchainProfiles && blockchainProfiles.profiles.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4" data-testid="text-available-profiles">
            Available Profiles ({blockchainProfiles.count})
          </h2>
          {blockchainProfiles.profiles.map((profile) => (
            <Card 
              key={profile.pubkey}
              className="hover-elevate cursor-pointer"
              data-testid={`card-profile-${profile.pubkey}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold" data-testid={`text-profile-name-${profile.pubkey}`}>
                        {profile.name || "Unnamed Profile"}
                      </div>
                      <div className="text-sm text-muted-foreground font-mono" data-testid={`text-pubkey-${profile.pubkey}`}>
                        {profile.pubkey.slice(0, 12)}...{profile.pubkey.slice(-12)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {existingProfile?.playerProfilePubkey === profile.pubkey && (
                      <Badge variant="default" data-testid={`badge-current-${profile.pubkey}`}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Current
                      </Badge>
                    )}
                    <Button
                      onClick={() => handleSelectProfile(profile.pubkey)}
                      disabled={syncCrewMutation.isPending}
                      data-testid={`button-select-${profile.pubkey}`}
                    >
                      {syncCrewMutation.isPending && selectedPubkey === profile.pubkey ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        "Select Profile"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" data-testid="icon-no-profiles" />
              <h3 className="text-lg font-semibold mb-2" data-testid="text-no-profiles">
                No Player Profiles Found
              </h3>
              <p className="text-muted-foreground mb-6" data-testid="text-no-profiles-description">
                No Star Atlas player profiles found for this wallet address
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 border-t pt-8">
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-testing-title">Development Testing</CardTitle>
            <CardDescription data-testid="text-testing-description">
              Use default profile for internal testing without blockchain data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleUseDefaultProfile}
              disabled={syncCrewMutation.isPending}
              className="w-full"
              data-testid="button-use-default"
            >
              {syncCrewMutation.isPending && selectedPubkey === null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Use Default Profile"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
