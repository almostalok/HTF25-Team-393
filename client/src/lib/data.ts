type Report = {
  id: string;
  title: string;
  description?: string;
  lat?: number;
  lng?: number;
  direction?: string;
  address?: string;
  tags?: string[];
  // lower number = lower priority. Higher votes increase priority.
  priority?: number;
  votes?: number;
  department?: string;
  departmentDetails?: any;
  deadlineDays?: number;
  assignedAt?: string;
  dueBy?: string;
  status?: "pending" | "in-progress" | "resolved" | "overdue";
  createdAt: string;
};

type Campaign = {
  id: string;
  title: string;
  description: string;
  raised: number;
  goal: number;
  backers: number;
  image?: string;
  daysLeft?: number;
};

type Notice = {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: "high" | "medium" | "low";
  type: "warning" | "update" | "info";
};

const REPORTS_KEY = "saar_reports";
const CAMPAIGNS_KEY = "saar_campaigns";
const KARMA_KEY = "saar_karma";
const NOTICES_KEY = "saar_notices";
const VOTES_KEY = "saar_votes";

// In-memory fallback storage for environments where localStorage is unavailable
const IN_MEMORY: {
  reports: Report[];
  campaigns: Campaign[] | null;
  karma: number | null;
  notices: Notice[] | null;
  votes: Record<string, string[]> | null;
} = {
  reports: [],
  campaigns: null,
  karma: null,
  notices: null,
  votes: null,
};

export function getReports(): Report[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Report[];
  } catch (e) {
    // fallback to in-memory if available
    return IN_MEMORY.reports || [];
  }
}

export function addReport(r: Omit<Report, "id" | "createdAt">) {
  const list = getReports();
  const report: Report = {
    id: Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    status: "pending",
    votes: 0,
    priority: 0,
    ...r,
  };
  list.unshift(report);
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(list));
  } catch (e) {
    // localStorage might be unavailable (private mode / quota); keep in memory and continue
    IN_MEMORY.reports = list;
  }
  try {
    // notify other parts of the app
    window.dispatchEvent(new CustomEvent("saarthi:dataChange", { detail: { type: "report-added", report } }));
  } catch (e) {}
  return report;
}

export function voteReport(id: string) {
  const list = getReports();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const item = list[idx];
  item.votes = (item.votes || 0) + 1;
  // simple priority model: priority equals votes (can be adjusted later)
  item.priority = item.votes;
  list[idx] = item;
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(list));
  } catch (e) {
    IN_MEMORY.reports = list;
  }
  try { window.dispatchEvent(new CustomEvent("saarthi:dataChange", { detail: { type: "vote", id, votes: item.votes } })); } catch (e) {}
  return item;
}

export function getVotesMap(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string[]>;
  } catch (e) {
    return {};
  }
}

export function hasUserVoted(reportId: string, userId: string | null | undefined) {
  if (!userId) return false;
  const map = getVotesMap();
  const list = map[userId] || [];
  return list.includes(reportId);
}

export function castVote(reportId: string, userId: string | null | undefined) {
  if (!userId) return { success: false, reason: 'not-authenticated' };
  const map = getVotesMap();
  const userVotes = new Set(map[userId] || []);
  if (userVotes.has(reportId)) return { success: false, reason: 'already-voted' };
  userVotes.add(reportId);
  map[userId] = Array.from(userVotes);
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify(map));
  } catch (e) {}
  const updated = voteReport(reportId);
  return { success: true, report: updated };
}

export function checkOverdues() {
  const reports = getReports();
  const now = Date.now();
  let changed = false;
  reports.forEach((r) => {
    try {
      if (r.dueBy && r.status !== 'resolved' && r.status !== 'overdue') {
        const due = new Date(r.dueBy).getTime();
        if (due <= now) {
          r.status = 'overdue' as any;
          // increase priority for overdue items
          r.priority = (r.priority || 0) + 5;
          // create a notice
          try {
            const notice = {
              id: Math.random().toString(36).slice(2, 9),
              title: `Overdue: ${r.title}`,
              content: `Complaint ${r.id} assigned to ${r.department || 'Department'} is overdue.`,
              date: new Date().toLocaleDateString(),
              priority: 'high' as const,
              type: 'warning' as const,
            };
            const existingNotices = getNotices();
            existingNotices.unshift(notice as any);
            localStorage.setItem(NOTICES_KEY, JSON.stringify(existingNotices));
          } catch (e) {}
          changed = true;
        }
      }
    } catch (e) {}
  });
  if (changed) {
    try {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
      window.dispatchEvent(new CustomEvent('saarthi:dataChange', { detail: { type: 'overdue-checked' } }));
    } catch (e) {}
  }
  return changed;
}

export function getCampaigns(): Campaign[] {
  try {
    const raw = localStorage.getItem(CAMPAIGNS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Campaign[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        // fall through to seed defaults when it's an empty array
      } catch (e) {
        // if parsing fails, fall through and seed defaults
      }
    }
  } catch (e) {}

  // default campaigns
  const defaults: Campaign[] = [
    {
      id: "F-2025-0001",
      title: "Fix MG Road Potholes",
      description: "Community fund to repair major potholes on MG Road",
      raised: 25000,
      goal: 100000,
      backers: 42,
      image: "https://placekitten.com/300/200",
      daysLeft: 12,
    },
    {
      id: "F-2025-0002",
      title: "Park Lighting",
      description: "Install energy-efficient lighting in the central park",
      raised: 8000,
      goal: 40000,
      backers: 18,
      image: "https://placekitten.com/301/200",
      daysLeft: 20,
    },
  ];
    try {
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(defaults));
    } catch (e) {
      IN_MEMORY.campaigns = defaults;
    }
  return defaults;
}

export function donateToCampaign(id: string, amount: number) {
  const campaigns = getCampaigns();
  const idx = campaigns.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  campaigns[idx].raised += amount;
  campaigns[idx].backers += 1;
  try {
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  } catch (e) {
    IN_MEMORY.campaigns = campaigns;
  }
  try { window.dispatchEvent(new CustomEvent("saarthi:dataChange", { detail: { type: "donation", id, amount } })); } catch (e) {}
  return true;
}

export function getKarma(): number {
  try {
    const raw = localStorage.getItem(KARMA_KEY);
    if (!raw) {
      // seed a small demo karma value so the UI shows activity
      const seed = 10;
      try {
        localStorage.setItem(KARMA_KEY, String(seed));
      } catch (e) {
        IN_MEMORY.karma = seed;
      }
      return seed;
    }
    return Number(raw) || 0;
  } catch (e) {
    return IN_MEMORY.karma ?? 0;
  }
}

export function addKarma(points: number) {
  const cur = getKarma();
  const next = cur + points;
  try {
    localStorage.setItem(KARMA_KEY, String(next));
  } catch (e) {
    IN_MEMORY.karma = next;
  }
  try { window.dispatchEvent(new CustomEvent("saarthi:dataChange", { detail: { type: "karma", points } })); } catch (e) {}
  return next;
}

export function getNotices(): Notice[] {
  try {
    const raw = localStorage.getItem(NOTICES_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Notice[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        // otherwise seed defaults
      } catch (e) {
        // fall through to seed defaults
      }
    }
  } catch (e) {}

  const defaults: Notice[] = [
    {
      id: "N-2025-001",
      title: "Road Repair Schedule",
      content: "Road repairs scheduled for Sector 5 starting next week.",
      date: new Date().toLocaleDateString(),
      priority: "medium",
      type: "update",
    },
    {
      id: "N-2025-002",
      title: "Water Supply Interruption",
      content: "Water supply will be interrupted in zone B on Friday.",
      date: new Date().toLocaleDateString(),
      priority: "high",
      type: "warning",
    },
  ];
  try {
    localStorage.setItem(NOTICES_KEY, JSON.stringify(defaults));
  } catch (e) {
    IN_MEMORY.notices = defaults;
  }
  return defaults;
}

export function addNotice(n: Omit<Notice, "id" | "date">) {
  const list = getNotices();
  const notice: Notice = {
    id: Math.random().toString(36).slice(2, 9),
    date: new Date().toLocaleDateString(),
    ...n,
  };
  list.unshift(notice);
  try {
    localStorage.setItem(NOTICES_KEY, JSON.stringify(list));
  } catch (e) {
    IN_MEMORY.notices = list;
  }
  try { window.dispatchEvent(new CustomEvent("saarthi:dataChange", { detail: { type: "notice-added", notice } })); } catch (e) {}
  return notice;
}

/**
 * Seed demo data for campaigns, notices, karma and a couple of reports.
 * Useful for local development and for a quick 'reset' action from UI.
 */
export function seedDemoData() {
  const defaultsCampaigns: Campaign[] = [
    {
      id: "F-2025-0001",
      title: "Fix MG Road Potholes",
      description: "Community fund to repair major potholes on MG Road",
      raised: 25000,
      goal: 100000,
      backers: 42,
      image: "https://placekitten.com/300/200",
      daysLeft: 12,
    },
    {
      id: "F-2025-0002",
      title: "Park Lighting",
      description: "Install energy-efficient lighting in the central park",
      raised: 8000,
      goal: 40000,
      backers: 18,
      image: "https://placekitten.com/301/200",
      daysLeft: 20,
    },
  ];
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(defaultsCampaigns));

  const defaultsNotices: Notice[] = [
    {
      id: "N-2025-001",
      title: "Road Repair Schedule",
      content: "Road repairs scheduled for Sector 5 starting next week.",
      date: new Date().toLocaleDateString(),
      priority: "medium",
      type: "update",
    },
    {
      id: "N-2025-002",
      title: "Water Supply Interruption",
      content: "Water supply will be interrupted in zone B on Friday.",
      date: new Date().toLocaleDateString(),
      priority: "high",
      type: "warning",
    },
  ];
  localStorage.setItem(NOTICES_KEY, JSON.stringify(defaultsNotices));

  localStorage.setItem(KARMA_KEY, String(10));

  // seed two example reports near a default location (if geolocation unavailable)
  const MAX_MS = 48 * 60 * 60 * 1000; // 48 hours in ms
  const DEFAULT_DEADLINE_MS = 2 * 24 * 60 * 60 * 1000; // 2 days (will be clamped to 48h)
  const dueByForSeed = () => new Date(Date.now() + Math.min(DEFAULT_DEADLINE_MS, MAX_MS)).toISOString();

  const sampleReports: Report[] = [
    {
      id: Math.random().toString(36).slice(2, 9),
      title: "Sample Pothole",
      description: "Demo pothole for testing",
      lat: 12.9716,
      lng: 77.5946,
      direction: "NE",
      address: "Demo Street, Demo City",
      tags: ["pothole", "infrastructure"],
      votes: 2,
      priority: 2,
      status: "pending",
      assignedAt: new Date().toISOString(),
      dueBy: dueByForSeed(),
      createdAt: new Date().toISOString(),
    },
    {
      id: Math.random().toString(36).slice(2, 9),
      title: "Sample Broken Light",
      description: "Demo broken streetlight",
      lat: 12.9720,
      lng: 77.5930,
      direction: "S",
      address: "Demo Ave, Demo City",
      tags: ["lighting", "utilities"],
      votes: 1,
      priority: 1,
      status: "pending",
      assignedAt: new Date().toISOString(),
      dueBy: dueByForSeed(),
      createdAt: new Date().toISOString(),
    },
    {
      id: Math.random().toString(36).slice(2, 9),
      title: "Reported Bribery Attempt",
      description: "Resident reported an attempted bribery at the permit office.",
      lat: 12.9730,
      lng: 77.5950,
      direction: "NW",
      address: "Admin Block, Demo City",
      tags: ["bribery", "corruption"],
      votes: 0,
      priority: 5,
      status: "pending",
      assignedAt: new Date().toISOString(),
      dueBy: dueByForSeed(),
      createdAt: new Date().toISOString(),
    },
    {
      id: Math.random().toString(36).slice(2, 9),
      title: "Overflowing Drain near Market",
      description: "Sanitation issue causing smell and pests.",
      lat: 12.9700,
      lng: 77.5960,
      direction: "E",
      address: "Market Road, Demo City",
      tags: ["sanitation"],
      votes: 3,
      priority: 3,
      status: "in-progress",
      assignedAt: new Date().toISOString(),
      dueBy: dueByForSeed(),
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(REPORTS_KEY, JSON.stringify(sampleReports));

  try {
    window.dispatchEvent(new CustomEvent("saarthi:dataChange", { detail: { type: "seeded" } }));
  } catch (e) {}
}

export type { Report, Campaign, Notice };
