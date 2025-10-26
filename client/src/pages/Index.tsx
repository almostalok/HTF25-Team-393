import { Layout } from "@/components/layout/layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { OneTapComplaint } from "@/components/dashboard/one-tap-complaint";
import { ComplaintStatus } from "@/components/dashboard/complaint-status";
import { useOverdueChecker } from "@/components/dashboard/complaint-status";
import { FundingCampaigns } from "@/components/dashboard/funding-campaigns";
import { KarmaPoints } from "@/components/dashboard/karma-points";
import { NoticeBoard } from "@/components/dashboard/notice-board";
import { CityInfo } from "@/components/dashboard/city-info";
import { AlertTriangle, CheckCircle, Clock, Users, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { getReports, getCampaigns, getKarma, getNotices } from "@/lib/data";
import ComplaintsNearMe from "@/components/dashboard/complaints-near-me";

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [stats, setStats] = useState({
    activeComplaints: 0,
    resolvedIssues: 0,
    pendingRequests: 0,
    communitySupport: 0,
    complaintsNearMe: 0,
  });
  const isMounted = useRef(true);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    toast({
      title: `Tab changed to ${value}`,
      description: `You are now viewing the ${value} dashboard`,
    });
  };

  useEffect(() => {
    // Set up the ref
    isMounted.current = true;
    
    const handleHashChange = () => {
      if (!isMounted.current) return;
      
      const hash = window.location.hash.replace('#', '');
      console.log("Hash changed to:", hash);
      
      if (hash) setActiveSection(hash);
      else setActiveSection("dashboard");
    };

    // Set initial section from URL if present
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    // compute stats immediately as well
    try {
      computeStats();
    } catch (e) {}
    
    // Cleanup
    return () => {
      isMounted.current = false;
      window.removeEventListener('hashchange', handleHashChange);
      clearTimeout(timer);
    };
  }, []);

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

  const computeStats = () => {
    try {
      const reports = getReports();
      const campaigns = getCampaigns();
      const karma = getKarma();
      const notices = getNotices();

      const activeComplaints = reports.filter((r: any) => r.status !== "resolved").length;
      const resolvedIssues = reports.filter((r: any) => r.status === "resolved").length;
      const pendingRequests = reports.filter((r: any) => r.status === "pending").length;
      const communitySupport = reports.length + campaigns.reduce((s: number, c: any) => s + (c.backers || 0), 0) + (karma || 0);

      let complaintsNearMe = 0;
      if (userCoords) {
        complaintsNearMe = reports.filter((r: any) => {
          if (!r.lat || !r.lng) return false;
          return haversine(userCoords.lat, userCoords.lng, r.lat, r.lng) <= 5; // within 5 km
        }).length;
      }

      setStats({ activeComplaints, resolvedIssues, pendingRequests, communitySupport, complaintsNearMe });
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    // try to get user location for tailoring overview
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    computeStats();

    const onDataChange = () => computeStats();
    window.addEventListener("saarthi:dataChange", onDataChange as EventListener);
    window.addEventListener("storage", onDataChange as EventListener);

    const iv = setInterval(() => computeStats(), 2000);

    return () => {
      window.removeEventListener("saarthi:dataChange", onDataChange as EventListener);
      window.removeEventListener("storage", onDataChange as EventListener);
      clearInterval(iv);
    };
  }, [userCoords]);

  // start overdue checker for complaints
  useOverdueChecker();

  // Render component based on active section
  const renderActiveComponent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case "dashboard":
        return (
          <>
            <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={handleTabChange}>
              <TabsList className="w-full justify-start mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <div className="space-y-6">
                  <CityInfo />
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                      title="Active Complaints"
                      value={String(stats.activeComplaints)}
                      icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
                      description={stats.complaintsNearMe ? `${stats.complaintsNearMe} within 5 km` : "Showing city-wide"}
                    />
                    <StatsCard
                      title="Resolved Issues"
                      value={String(stats.resolvedIssues)}
                      icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                      description="Resolution rate — local view"
                    />
                    <StatsCard
                      title="Pending Requests"
                      value={String(stats.pendingRequests)}
                      icon={<Clock className="h-4 w-4 text-yellow-500" />}
                      description="Requests awaiting action"
                    />
                    <StatsCard
                      title="Community Support"
                      value={stats.communitySupport.toLocaleString()}
                      icon={<Users className="h-4 w-4 text-blue-500" />}
                      description="Combined local activity"
                    />
                  </div>

                  {/* quick stats snapshot for debugging/visibility */}
                  <div className="mt-2 p-2 bg-slate-50 rounded text-sm flex items-center justify-between">
                    <div>
                      <strong>Live stats:</strong> Active {stats.activeComplaints} • Resolved {stats.resolvedIssues} • Pending {stats.pendingRequests} • Near Me {stats.complaintsNearMe}
                    </div>
                    <div>
                      <button
                        className="px-3 py-1 bg-slate-100 rounded text-sm"
                        onClick={() => {
                          try {
                            // eslint-disable-next-line @typescript-eslint/no-var-requires
                            const { seedDemoData } = require("@/lib/data");
                            seedDemoData();
                            // recompute stats
                            setTimeout(() => {
                              try { (window as any).dispatchEvent(new CustomEvent('saarthi:dataChange')); } catch(e){}
                            }, 100);
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      >
                        Seed demo data
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        );
      case "complaints":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Complaint Management</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <OneTapComplaint />
              <ComplaintStatus />
            </div>
          </div>
        );
      case "crowdfunding":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Crowdfunding Campaigns</h2>
            <FundingCampaigns />
          </div>
        );
      case "karma":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Karma Points</h2>
            <KarmaPoints />
          </div>
        );
      case "notices":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Notices & Alerts</h2>
            <NoticeBoard />
          </div>
        );
      case "near-me":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Complaints Near Me</h2>
            <ComplaintsNearMe />
          </div>
        );
      default:
        return (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold">Section not found</h2>
            <p className="text-muted-foreground mt-2">The requested section does not exist.</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to SAAARTHI</h1>
          <p className="text-muted-foreground">
            The Interactive Urban Issue Reporter empowering citizens to report civic problems —
            potholes, broken streetlights, vandalism and more. Geo-tag issues, attach images, and
            track status to ensure transparency and accountability.
          </p>
        </div>

        <nav className="flex gap-2 flex-wrap mt-4">
          <button onClick={() => (window.location.hash = "dashboard")} className="px-3 py-1 rounded bg-slate-100">
            Overview
          </button>
          <button onClick={() => (window.location.hash = "complaints")} className="px-3 py-1 rounded bg-slate-100">
            Complaints
          </button>
          <button onClick={() => (window.location.hash = "near-me")} className="px-3 py-1 rounded bg-slate-100">
            Complaints near me
          </button>
          <button onClick={() => (window.location.hash = "crowdfunding")} className="px-3 py-1 rounded bg-slate-100">
            Crowd funding
          </button>
          <button onClick={() => (window.location.hash = "karma")} className="px-3 py-1 rounded bg-slate-100">
            Karma points
          </button>
          <button onClick={() => (window.location.hash = "notices")} className="px-3 py-1 rounded bg-slate-100">
            Notices
          </button>
        </nav>

        {renderActiveComponent()}
      </div>
    </Layout>
  );
};

export default Index;
