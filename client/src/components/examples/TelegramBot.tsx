import TelegramBot from '../TelegramBot';

export default function TelegramBotExample() {
  return (
    <TelegramBot
      botUsername="saros_dlmm_bot"
      botUrl="https://t.me/saros_dlmm_bot"
      isConnected={true}
      recentAlerts={[
        {
          id: "1",
          message: "SOL/USDC position out of range! Current price: $88.75",
          time: "2m ago",
          type: "warning",
        },
        {
          id: "2",
          message: "Successfully rebalanced SAROS/USDC position",
          time: "15m ago",
          type: "success",
        },
        {
          id: "3",
          message: "Monitoring 6 active positions",
          time: "1h ago",
          type: "info",
        },
      ]}
    />
  );
}
