import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BarChart3,
  FileText,
  Heart,
  Home,
  MapPin,
  Phone,
  Settings,
  Star,
  ThumbsUp,
  Bell,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  notifications?: number;
};

export function SidebarNav() {
  const [activeItem, setActiveItem] = useState("");
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(isMobile);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  // Set initial active item based on URL hash
  useEffect(() => {
    const updateActiveItemFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      setActiveItem(hash || "dashboard"); // Default to dashboard if no hash
      console.log("Sidebar: active item set to", hash || "dashboard");
    };
    
    // Initial setup
    updateActiveItemFromHash();
    
    // Listen for hash changes
    window.addEventListener('hashchange', updateActiveItemFromHash);
    
    return () => {
      window.removeEventListener('hashchange', updateActiveItemFromHash);
    };
  }, []);

  const items: NavItem[] = [
    {
      title: "Dashboard",
      href: "#dashboard",
      icon: Home,
    },
    {
      title: "Complaints",
      href: "#complaints",
      icon: AlertCircle,
      notifications: 5,
    },
    {
      title: "Complaints near me",
      href: "#near-me",
      icon: MapPin,
    },
    {
      title: "Crowdfunding",
      href: "#crowdfunding",
      icon: Heart,
    },
    
    {
      title: "Karma Points",
      href: "#karma",
      icon: Star,
    },
    {
      title: "Notices",
      href: "#notices",
      icon: Bell,
      notifications: 3,
    },
  ];

  const handleNavClick = (item: string, href: string) => {
    const section = href.replace("#", "");
    setActiveItem(section);
    
    console.log("Sidebar: clicked on", item, "with section", section);
    
    // Update the URL hash
    window.location.hash = section;
    
    // Close mobile menu on navigation
    if (isMobile) {
      setOpen(false);
    }
    
    toast({
      title: `Navigated to ${item}`,
      description: `You are now viewing the ${item} section`,
    });
  };

  const NavContent = () => (
    <>
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-lg font-bold text-gov-blue">SAARTHI</span>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setCollapsed(!collapsed)}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 py-4 overflow-auto">
        <nav className="space-y-1 px-2">
          {items.map((item) => (
            <button
              key={item.title}
              className={cn(
                "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors w-full text-left",
                activeItem === item.href.replace('#', '')
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              onClick={() => handleNavClick(item.title, item.href)}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.notifications && (
                  <span className="notification-badge">{item.notifications}</span>
                )}
              </div>
              {!collapsed && <span className="ml-3">{item.title}</span>}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <button
          className={cn(
            "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors w-full text-left",
            activeItem === "settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          )}
          onClick={() => handleNavClick("Settings", "#settings")}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Settings</span>}
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <div className="h-full flex flex-col">
            <NavContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <NavContent />
    </div>
  );
}
