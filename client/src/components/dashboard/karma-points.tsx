
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function KarmaPoints() {
  // Load karma points from data layer
  let points = 0;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getKarma } = require("@/lib/data");
    points = getKarma();
  } catch (e) {
    points = 0;
  }

  // Next milestone is at 500 points
  const nextMilestone = 500;

  // Calculate percentage progress to next milestone
  const progress = Math.round((points / nextMilestone) * 100);

  // Rewards that can be redeemed with karma points
  const rewards = [
    {
      title: "10% Tax Discount",
      points: 500,
      isAvailable: points >= 500,
    },
    {
      title: "Challan Waiver (One-Time)",
      points: 300,
      isAvailable: points >= 300,
    },
    {
      title: "Priority Processing",
      points: 200,
      isAvailable: points >= 200,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          Your Karma Points
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-4">
          <div className="relative h-32 w-32 flex items-center justify-center">
            <svg className="absolute" width="128" height="128" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#eab308"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="text-center">
              <div className="text-3xl font-bold">{points}</div>
              <div className="text-xs text-muted-foreground">karma points</div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="text-sm font-medium mb-1 flex justify-between">
            <span>{points} points</span>
            <span>{nextMilestone} points</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center mt-2 text-muted-foreground">
            {nextMilestone - points} more points until your next milestone!
          </p>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Available Rewards</h4>
          {rewards.map((reward, index) => (
            <div
              key={index}
              className={cn(
                "p-3 border rounded-lg flex items-center justify-between",
                reward.isAvailable
                  ? "hover:bg-accent/10 transition-colors cursor-pointer"
                  : "opacity-60"
              )}
            >
              <div className="flex items-center">
                <div className="mr-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded">
                  <Star
                    className={cn(
                      "h-4 w-4",
                      reward.isAvailable
                        ? "text-yellow-500"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <div className="font-medium text-sm">{reward.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {reward.points} karma points
                  </div>
                </div>
              </div>
              <Badge
                variant={reward.isAvailable ? "default" : "outline"}
                className={reward.isAvailable ? "bg-green-500" : ""}
              >
                {reward.isAvailable ? "Redeem" : "Locked"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
