"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, CheckCircle2 } from "lucide-react"
import { useState } from "react"

export function TelegramBotPanel() {
  const [botToken, setBotToken] = useState("")
  const [chatId, setChatId] = useState("")
  const [isEnabled, setIsEnabled] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = () => {
    // TODO: Implement Telegram bot connection
    setIsConnected(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle>Telegram Bot</CardTitle>
          </div>
          {isConnected && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bot-token">Bot Token</Label>
            <Input
              id="bot-token"
              type="password"
              placeholder="Enter your Telegram bot token"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chat-id">Chat ID</Label>
            <Input
              id="chat-id"
              placeholder="Enter your Telegram chat ID"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
            />
          </div>

          <Button onClick={handleConnect} disabled={!botToken || !chatId} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Connect Bot
          </Button>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">Notification Settings</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="rebalance-alerts">Rebalance Alerts</Label>
            <Switch id="rebalance-alerts" checked={isEnabled} onCheckedChange={setIsEnabled} disabled={!isConnected} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="out-of-range">Out of Range Alerts</Label>
            <Switch id="out-of-range" disabled={!isConnected} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="stop-loss">Stop Loss Alerts</Label>
            <Switch id="stop-loss" disabled={!isConnected} />
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium mb-2">How to set up:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Create a bot with @BotFather on Telegram</li>
            <li>Copy the bot token and paste it above</li>
            <li>Start a chat with your bot and send /start</li>
            <li>Get your chat ID from @userinfobot</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
