import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Smartphone, CheckCircle, XCircle, Trash2, AlertCircle } from "lucide-react";

type DeviceStatus = "available" | "in-use" | "not-in-use" | "scrap";

interface Device {
  id: string;
  name: string;
  type: string;
  status: DeviceStatus;
  lastSeen: string;
  batteryLevel: number;
}

const initialDevices: Device[] = [
  { id: "DEV-001", name: "Tracker Alpha", type: "BLE Tag", status: "available", lastSeen: "2 min ago", batteryLevel: 85 },
  { id: "DEV-002", name: "Tracker Beta", type: "BLE Tag", status: "in-use", lastSeen: "Just now", batteryLevel: 92 },
  { id: "DEV-003", name: "Tracker Gamma", type: "WiFi Tag", status: "not-in-use", lastSeen: "1 hour ago", batteryLevel: 45 },
  { id: "DEV-004", name: "Tracker Delta", type: "BLE Tag", status: "available", lastSeen: "5 min ago", batteryLevel: 78 },
  { id: "DEV-005", name: "Tracker Epsilon", type: "WiFi Tag", status: "in-use", lastSeen: "Just now", batteryLevel: 60 },
  { id: "DEV-006", name: "Tracker Zeta", type: "BLE Tag", status: "not-in-use", lastSeen: "3 hours ago", batteryLevel: 20 },
  { id: "DEV-007", name: "Tracker Eta", type: "WiFi Tag", status: "scrap", lastSeen: "1 week ago", batteryLevel: 0 },
  { id: "DEV-008", name: "Tracker Theta", type: "BLE Tag", status: "available", lastSeen: "10 min ago", batteryLevel: 95 },
  { id: "DEV-009", name: "Tracker Iota", type: "WiFi Tag", status: "not-in-use", lastSeen: "2 days ago", batteryLevel: 15 },
  { id: "DEV-010", name: "Tracker Kappa", type: "BLE Tag", status: "scrap", lastSeen: "2 weeks ago", batteryLevel: 0 },
];

const statusConfig: Record<DeviceStatus, { label: string; color: string; icon: React.ElementType }> = {
  "available": { label: "Available", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  "in-use": { label: "In Use", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Smartphone },
  "not-in-use": { label: "Not in Use", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: AlertCircle },
  "scrap": { label: "Scrap", color: "bg-destructive/20 text-destructive border-destructive/30", icon: Trash2 },
};

export default function DeviceListTab() {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [activeFilter, setActiveFilter] = useState<DeviceStatus | "all">("all");

  const handleScrapToggle = (deviceId: string, toScrap: boolean) => {
    setDevices(prev =>
      prev.map(device =>
        device.id === deviceId
          ? { ...device, status: toScrap ? "scrap" : "not-in-use" }
          : device
      )
    );
  };

  const filteredDevices = activeFilter === "all" 
    ? devices 
    : devices.filter(d => d.status === activeFilter);

  const counts = {
    all: devices.length,
    available: devices.filter(d => d.status === "available").length,
    "in-use": devices.filter(d => d.status === "in-use").length,
    "not-in-use": devices.filter(d => d.status === "not-in-use").length,
    scrap: devices.filter(d => d.status === "scrap").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Device List</h2>
        <p className="text-muted-foreground mt-1">Manage and monitor all tracking devices</p>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["available", "in-use", "not-in-use", "scrap"] as DeviceStatus[]).map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <Card 
              key={status}
              className={`cursor-pointer transition-all hover:scale-105 ${activeFilter === status ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setActiveFilter(activeFilter === status ? "all" : status)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{counts[status]}</p>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Devices {activeFilter !== "all" && `(${statusConfig[activeFilter].label})`}</span>
            {activeFilter !== "all" && (
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => setActiveFilter("all")}
              >
                Clear Filter
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDevices.map((device) => {
              const config = statusConfig[device.status];
              const Icon = config.icon;
              
              return (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-sm text-muted-foreground">{device.id} • {device.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Last seen</p>
                      <p className="text-sm font-medium">{device.lastSeen}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Battery</p>
                      <p className={`text-sm font-medium ${device.batteryLevel < 20 ? 'text-destructive' : device.batteryLevel < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {device.batteryLevel}%
                      </p>
                    </div>

                    <Badge variant="outline" className={config.color}>
                      {config.label}
                    </Badge>

                    {/* Toggle for Not in Use devices */}
                    {device.status === "not-in-use" && (
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-muted-foreground">Move to Scrap</span>
                        <Switch
                          checked={false}
                          onCheckedChange={(checked) => handleScrapToggle(device.id, checked)}
                        />
                      </div>
                    )}

                    {/* Toggle for Scrap devices to restore */}
                    {device.status === "scrap" && (
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-muted-foreground">Restore</span>
                        <Switch
                          checked={true}
                          onCheckedChange={(checked) => handleScrapToggle(device.id, checked)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredDevices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No devices found with this status
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
