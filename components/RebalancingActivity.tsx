import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle, TrendingUp, Info } from "lucide-react"

interface Event {
  id: string
  type: string
  poolPair: string
  message: string
  timestamp: string
}

interface RebalancingActivityProps {
  events: Event[]
}

export default function RebalancingActivity({ events }: RebalancingActivityProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "alert":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "rebalance":
        return <TrendingUp className="w-4 h-4 text-blue-500" />
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "alert":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "rebalance":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Info className="w-8 h-8 mb-2" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex gap-3 pb-4 border-b last:border-0">
                  <div className="mt-1">{getEventIcon(event.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getEventBadgeColor(event.type)}>
                        {event.poolPair}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                    </div>
                    <p className="text-sm">{event.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
