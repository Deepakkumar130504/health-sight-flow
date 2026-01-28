import { ReactNode } from "react";
import { LayoutDashboard, Users, Brain, Download, Router, Map, Smartphone, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "devices", label: "Device List", icon: Smartphone },
  { id: "patients", label: "Patient Configuration", icon: Users },
  { id: "assets", label: "Asset Configuration", icon: Package },
  { id: "analytics", label: "AI Analytics", icon: Brain },
  { id: "export", label: "Data Export", icon: Download },
  { id: "room", label: "Room Config", icon: Map },
  { id: "gateway", label: "Gateway Config", icon: Router },
];

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            Patient Tracking
          </h1>
          <p className="text-sm text-sidebar-foreground/70 mt-1">Indoor Monitoring System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
