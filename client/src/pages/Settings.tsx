import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function Settings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold mb-2">Settings</h2>
          <p className="text-muted-foreground">Configure your rebalancing preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monitoring Settings</CardTitle>
            <CardDescription>Configure automated position monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Rebalancing</Label>
                <p className="text-sm text-muted-foreground">Automatically rebalance out-of-range positions</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="interval">Monitoring Interval (minutes)</Label>
              <Input id="interval" type="number" defaultValue="15" min="5" max="60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volatility">Volatility Threshold (%)</Label>
              <Input id="volatility" type="number" defaultValue="15" min="1" max="50" step="0.1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Telegram Notifications</CardTitle>
            <CardDescription>Receive alerts via Telegram bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Get real-time alerts for position changes</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="bot-token">Bot Token</Label>
              <Input id="bot-token" type="password" placeholder="Enter your Telegram bot token" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chat-id">Chat ID</Label>
              <Input id="chat-id" placeholder="Enter your Telegram chat ID" />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full">Save Settings</Button>
      </div>
    </div>
  )
}
