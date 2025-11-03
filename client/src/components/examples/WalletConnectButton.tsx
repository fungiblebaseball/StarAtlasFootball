import WalletConnectButton from '../WalletConnectButton';

export default function WalletConnectButtonExample() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <WalletConnectButton onConnect={() => console.log('Connect wallet')} />
      <WalletConnectButton 
        connected 
        walletAddress="7nK8x9P2v3W4m5Q6r7S8t9U0v1W2x3Y4z5A6b7C8d9E0" 
        onConnect={() => console.log('Wallet connected')} 
      />
    </div>
  );
}
