
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { getReports } from "@/lib/data";

interface Complaint {
  id: string;
  title: string;
  department: string;
  date: string;
  status: "pending" | "in-progress" | "resolved";
  progress: number;
  dueBy?: string;
}

export function ComplaintStatus() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const loadComplaints = () => {
    try {
      const reports = getReports();
      const mapped = (reports || []).map((r: any) => ({
        id: r.id || Math.random().toString(36).slice(2, 9),
        title: r.title || "Report",
        department: r.department || "Public Works",
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-",
        status: (r.status as any) || "pending",
        progress: r.status === "resolved" ? 100 : r.status === "in-progress" ? 60 : 20,
        dueBy: r.dueBy,
      }));
      setComplaints(mapped);
    } catch (e) {
      setComplaints([]);
    }
  };

  useEffect(() => {
    loadComplaints();
    const onData = () => loadComplaints();
    window.addEventListener("saarthi:dataChange", onData as EventListener);
    window.addEventListener("storage", onData as EventListener);
    return () => {
      window.removeEventListener("saarthi:dataChange", onData as EventListener);
      window.removeEventListener("storage", onData as EventListener);
    };
  }, []);

  // live clock to render countdowns
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "in-progress":
        return "status-progress";
      case "resolved":
        return "status-resolved";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Complaints</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="p-3 border rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{complaint.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center mt-1">
                    <span>{complaint.department}</span>
                    <span className="mx-2">•</span>
                    <span>{complaint.date}</span>
                  </div>
                </div>
                <div className="flex items-center">
                    <div className="text-right mr-3">
                      {complaint.dueBy ? (
                        (() => {
                          const due = new Date(complaint.dueBy!).getTime();
                          const diff = Math.max(0, Math.floor((due - now) / 1000));
                          const hours = Math.floor(diff / 3600);
                          const mins = Math.floor((diff % 3600) / 60);
                          const secs = diff % 60;
                          const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                          return (
                            <div>
                              <div className="text-xs text-muted-foreground">Due by: {new Date(complaint.dueBy!).toLocaleString()}</div>
                              <div className="text-sm font-medium">{diff > 0 ? `Time left: ${timeStr}` : "OVERDUE"}</div>
                            </div>
                          );
                        })()
                      ) : null}
                      <span className={`${getStatusClass(complaint.status)} mr-2`}>{complaint.status.replace("-", " ")}</span>
                    </div>
                  {getStatusIcon(complaint.status)}
                </div>
              </div>
              <div className="mt-2">
                <Progress value={complaint.progress} className="h-1" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Periodic overdue check runner (keeps complaints updated)
export function useOverdueChecker() {
  useEffect(() => {
    let iv: number | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { checkOverdues } = require("@/lib/data");
      // run immediately and then every 30s
      checkOverdues();
      iv = window.setInterval(() => {
        checkOverdues();
      }, 30000);
    } catch (e) {
      // ignore
    }
    return () => {
      if (iv) clearInterval(iv);
    };
  }, []);
}
