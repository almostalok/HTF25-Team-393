import { useAuth } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";
import { getReports } from "@/lib/data";

type SimpleReport = {
  id: string;
  title: string;
  tags?: string[];
  status?: string;
  createdAt?: string;
};

const AuthorityDashboard = () => {
  const { auth, logout } = useAuth();
  const [reports, setReports] = useState<SimpleReport[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const load = () => {
    try {
      const r = getReports();
      setReports(r || []);
    } catch (e) {
      setReports([]);
    }
  };

  useEffect(() => {
    load();
    const onData = () => load();
    window.addEventListener("saarthi:dataChange", onData as EventListener);
    window.addEventListener("storage", onData as EventListener);
    return () => {
      window.removeEventListener("saarthi:dataChange", onData as EventListener);
      window.removeEventListener("storage", onData as EventListener);
    };
  }, []);

  const tags = useMemo(() => {
    const map = new Map<string, number>();
    reports.forEach((r: any) => {
      (r.tags || ["other"]).forEach((t: string) => {
        const key = t.toLowerCase();
        map.set(key, (map.get(key) || 0) + 1);
      });
    });
    // ensure common tags exist
    ["pothole", "bribery", "sanitation", "lighting", "other"].forEach((t) => { if (!map.has(t)) map.set(t, 0); });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [reports]);

  const filtered = useMemo(() => {
    if (!selectedTag) return reports;
    return reports.filter((r: any) => (r.tags || []).map((t: string) => t.toLowerCase()).includes(selectedTag));
  }, [reports, selectedTag]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Authority Dashboard</h1>
          <div>
            <span className="mr-4">{auth.name || "Authority"}</span>
            <button onClick={logout} className="px-3 py-1 border rounded">
              Sign out
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border rounded">Manage complaints and requests assigned to your department.</div>
          <div className="p-4 border rounded">Respond to community requests, allocate resources, and publish notices.</div>

          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">Complaint Tags</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded ${selectedTag === null ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
              >
                All ({reports.length})
              </button>
              {tags.map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded ${selectedTag === tag ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
                >
                  {tag} ({count})
                </button>
              ))}
            </div>

            <div className="mt-4">
              <h3 className="font-medium mb-2">Complaints {selectedTag ? `— ${selectedTag}` : ''}</h3>
              <div className="space-y-2">
                {filtered.length === 0 && <div className="text-sm text-muted-foreground">No complaints for this tag.</div>}
                {filtered.map((r) => (
                  <div key={r.id} className="p-2 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">{(r.tags || []).join(', ')} • {new Date((r as any).createdAt || Date.now()).toLocaleString()}</div>
                    </div>
                    <div className="text-sm">
                      <span className="px-2 py-1 bg-slate-100 rounded">{r.status || 'pending'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
