import { ReactNode } from "react";
import { LayoutDashboard, Users, Brain, Download, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "patients", label: "Patient Configuration", icon: Users },
  { id: "analytics", label: "AI Analytics", icon: Brain },
  { id: "export", label: "Data Export", icon: Download },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar with gradient background */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-background via-sidebar-background to-sidebar-accent/50 opacity-90" />
        
        <div className="relative z-10 p-6 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">
                Patient Tracking
              </h1>
              <p className="text-xs text-sidebar-foreground/70 mt-0.5">Indoor Monitoring</p>
            </div>
          </div>
        </div>
        
        <nav className="relative z-10 flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium",
                  "transition-all duration-300 relative group",
                  "hover:bg-sidebar-accent/80 hover:translate-x-1",
                  isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/50" : "text-sidebar-foreground"
                )}
              >
                <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary-foreground rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Decorative element */}
        <div className="relative z-10 p-4 border-t border-sidebar-border/50">
          <div className="text-xs text-sidebar-foreground/50 text-center">
            Powered by Lovable AI
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
