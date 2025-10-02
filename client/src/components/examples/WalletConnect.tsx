import WalletConnect from '../WalletConnect';

export default function WalletConnectExample() {
  return (
    <div className="flex gap-4">
      <WalletConnect isConnected={false} />
      <WalletConnect isConnected={true} address="7xKX...9mPq" network="Devnet" />
    </div>
  );
}
