import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Copy, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

interface TelegramBotProps {
  botUsername: string;
  botUrl: string;
  isConnected: boolean;
  recentAlerts?: Array<{
    id: string;
    message: string;
    time: string;
    type: "info" | "warning" | "success";
  }>;
}

export default function TelegramBot({
  botUsername,
  botUrl,
  isConnected,
  recentAlerts = [],
}: TelegramBotProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(botUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const alertTypeConfig = {
    info: "bg-chart-2/10 text-chart-2",
    warning: "bg-chart-4/10 text-chart-4",
    success: "bg-chart-3/10 text-chart-3",
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Telegram Bot</h3>
        <Badge variant={isConnected ? "default" : "secondary"} className="ml-auto">
          {isConnected ? "Connected" : "Not Connected"}
        </Badge>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bot Username</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded" data-testid="text-bot-username">
                  @{botUsername}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  data-testid="button-copy-bot"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Available Commands:</p>
              <div className="space-y-1 text-sm">
                <div className="font-mono text-muted-foreground">/monitor - Start monitoring positions</div>
                <div className="font-mono text-muted-foreground">/positions - View all positions</div>
                <div className="font-mono text-muted-foreground">/rebalance - Trigger rebalancing</div>
                <div className="font-mono text-muted-foreground">/simulate - Run strategy simulator</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-3 rounded-lg">
              <QRCodeSVG value={botUrl} size={120} />
            </div>
            <p className="text-xs text-muted-foreground">Scan to connect</p>
          </div>
        </div>

        {recentAlerts.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Recent Alerts</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg text-sm ${alertTypeConfig[alert.type]}`}
                  data-testid={`alert-${alert.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1">{alert.message}</p>
                    <span className="text-xs opacity-75 whitespace-nowrap">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
