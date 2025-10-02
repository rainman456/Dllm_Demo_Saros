import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ActivityEvent {
  id: string;
  type: "rebalance" | "alert" | "success";
  poolPair: string;
  message: string;
  timestamp: string;
}

interface RebalancingActivityProps {
  events?: ActivityEvent[];
}

export default function RebalancingActivity({
  events = [],
}: RebalancingActivityProps) {
  const eventConfig = {
    rebalance: {
      icon: <RefreshCw className="w-4 h-4" />,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    alert: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    success: {
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-lg hover-elevate"
              data-testid={`activity-${event.id}`}
            >
              <div className={`p-2 rounded-lg ${eventConfig[event.type].bgColor}`}>
                <div className={eventConfig[event.type].color}>
                  {eventConfig[event.type].icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {event.poolPair}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                </div>
                <p className="text-sm">{event.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
