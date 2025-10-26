import React, { useEffect, useState } from "react";
import { getReports, addReport, castVote, hasUserVoted } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

type Report = {
  id: string;
  title: string;
  description?: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  address?: string;
  votes?: number;
  priority?: number;
  createdAt?: string;
  status?: string;
};

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const ComplaintsNearMe: React.FC = () => {
  const { auth } = useAuth();
  const { toast } = useToast();
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"priority" | "distance" | "recent">("priority");
  const [radiusKm, setRadiusKm] = useState<number | null>(5);
  // manual complaint form state
  const [manualTitle, setManualTitle] = useState<string>("");
  const [manualDescription, setManualDescription] = useState<string>("");
  const [manualLat, setManualLat] = useState<string>("");
  const [manualLng, setManualLng] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAndCompute = (pos?: { lat: number; lng: number }) => {
    try {
      const saved = getReports();
      let list: Report[] = (saved || []).map((r: any) => ({ ...r }));

      if (pos) {
        list = list
          .map((rep) => ({
            ...rep,
            distanceKm:
              rep.lat && rep.lng ? Math.round(haversine(pos.lat, pos.lng, rep.lat, rep.lng) * 100) / 100 : undefined,
          }))
          .filter((r) => (radiusKm ? (r.distanceKm ?? 9999) <= radiusKm : true));
      }

      // sort
      if (sortBy === "priority") {
        list.sort((a, b) => (b.priority || 0) - (a.priority || 0) || (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      } else if (sortBy === "distance") {
        list.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      } else {
        list.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
      }

      setReports(list as Report[]);
    } catch (e) {
      setReports([]);
    }
  };

  useEffect(() => {
    // Get geolocation
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      loadAndCompute();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);

        // if there are no reports, create some dummy nearby reports so the UI is useful
        const existing = getReports();
        if (!existing || existing.length === 0) {
          const dummies = [
            {
              title: "Pothole on Main St",
              description: "Large pothole causing traffic",
              lat: coords.lat + 0.01,
              lng: coords.lng + 0.007,
            },
            {
              title: "Broken Streetlight",
              description: "Streetlight not working at corner",
              lat: coords.lat - 0.008,
              lng: coords.lng - 0.006,
            },
            {
              title: "Overflowing Drain",
              description: "Drain clogged and overflowing",
              lat: coords.lat + 0.006,
              lng: coords.lng - 0.01,
            },
          ];
          dummies.forEach((d) => addReport(d));
        }

        // load and compute distances
        loadAndCompute(coords);
      },
      (err) => {
        setError(err.message);
        loadAndCompute();
      },
      { timeout: 5000 }
    );

    const onData = () => {
      loadAndCompute(position || undefined);
    };
    window.addEventListener("saarthi:dataChange", onData as EventListener);
    window.addEventListener("storage", onData as EventListener);

    return () => {
      window.removeEventListener("saarthi:dataChange", onData as EventListener);
      window.removeEventListener("storage", onData as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, radiusKm]);

  const handleVote = (id: string) => {
    try {
      const userId = auth?.token || auth?.name || null;
      if (!userId) {
        toast({ title: "Please log in", description: "You must be logged in to vote.", variant: "destructive" });
        return;
      }

      if (hasUserVoted(id, userId)) {
        toast({ title: "Already voted", description: "You have already voted for this complaint.", variant: "default" });
        return;
      }

      const res = castVote(id, userId);
      if (res && (res as any).success) {
        toast({ title: "Vote recorded", description: "Thanks for voting!" });
      } else {
        toast({ title: "Vote failed", description: "Could not record vote: " + ((res as any).reason || "unknown"), variant: "destructive" });
      }

      // refresh
      loadAndCompute(position || undefined);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddManualReport = async () => {
    try {
      if (!manualTitle.trim()) {
        toast({ title: "Missing title", description: "Please enter a title for the complaint.", variant: "destructive" });
        return;
      }

      setIsSubmitting(true);

      // Prepare lat/lng if provided, otherwise leave undefined
      const lat = manualLat ? Number(manualLat) : position?.lat;
      const lng = manualLng ? Number(manualLng) : position?.lng;

      const report = addReport({
        title: manualTitle,
        description: manualDescription || undefined,
        lat: typeof lat === 'number' && !Number.isNaN(lat) ? lat : undefined,
        lng: typeof lng === 'number' && !Number.isNaN(lng) ? lng : undefined,
        address: undefined,
      });

      toast({ title: "Complaint added", description: `Complaint ${report.id} saved locally.` });

      // reset form
      setManualTitle("");
      setManualDescription("");
      setManualLat("");
      setManualLng("");

      // reload reports with same position context
      loadAndCompute(position || undefined);
    } catch (e) {
      console.error(e);
      toast({ title: "Save failed", description: "Could not save complaint locally.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          {position ? (
            <p className="text-sm text-muted-foreground">Showing reports near your location.</p>
          ) : (
            <p className="text-sm text-muted-foreground">Showing recent reports (location unavailable).</p>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="priority">Priority</option>
            <option value="distance">Distance</option>
            <option value="recent">Most Recent</option>
          </select>

          <label className="text-sm">Radius:</label>
          <select
            value={radiusKm ?? "all"}
            onChange={(e) => setRadiusKm(e.target.value === "all" ? null : Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="20">20 km</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Manual complaint entry */}
      <div className="p-3 border rounded-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="col-span-1 md:col-span-1 border rounded px-2 py-1"
            placeholder="Title (required)"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
          />

          <input
            className="col-span-1 md:col-span-1 border rounded px-2 py-1"
            placeholder="Latitude (optional)"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
          />

          <input
            className="col-span-1 md:col-span-1 border rounded px-2 py-1"
            placeholder="Longitude (optional)"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
          />
        </div>

        <textarea
          className="w-full mt-3 border rounded px-2 py-1 min-h-[80px]"
          placeholder="Description (optional)"
          value={manualDescription}
          onChange={(e) => setManualDescription(e.target.value)}
        />

        <div className="flex items-center justify-end mt-3">
          <button
            disabled={isSubmitting}
            onClick={handleAddManualReport}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Complaint"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <div className="grid gap-4">
        {reports.map((r) => (
          <div key={r.id} className="p-3 border rounded">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{r.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    {r.distanceKm !== undefined ? `${r.distanceKm} km` : "--"}
                  </div>
                </div>
                {r.description && <p className="text-sm mt-1">{r.description}</p>}
                <div className="flex gap-2 items-center mt-2">
                  <span className="text-xs px-2 py-1 bg-slate-100 rounded">Priority: {r.priority ?? 0}</span>
                  <span className="text-xs px-2 py-1 bg-slate-100 rounded">Votes: {r.votes ?? 0}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => handleVote(r.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Vote
                </button>
                <button
                  onClick={() => {
                    if (r.lat && r.lng) window.open(`https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`);
                  }}
                  className="px-3 py-1 bg-slate-100 rounded text-sm"
                >
                  Open in Maps
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplaintsNearMe;
