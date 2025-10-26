
import { Bell, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: "high" | "medium" | "low";
  type: "warning" | "update" | "info";
}

export function NoticeBoard() {
  let notices: Notice[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getNotices } = require("@/lib/data");
    notices = getNotices();
  } catch (e) {
    notices = [];
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      default:
        return "";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "update":
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Notice Board</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="p-3 border rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">{getTypeIcon(notice.type)}</div>
                <div>
                  <div className="font-medium flex items-center">
                    {notice.title}
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-2",
                        getPriorityColor(notice.priority)
                      )}
                    >
                      {notice.priority}
                    </Badge>
                  </div>
                  <div className="text-sm mt-1">{notice.content}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {notice.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
