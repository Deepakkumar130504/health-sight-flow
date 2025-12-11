import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CircleCheck, Activity, CircleOff, Layers, Radio, Wifi, Battery } from "lucide-react";

type DeviceStatus = "available" | "in-use" | "scrap";

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
  { id: "DEV-003", name: "Tracker Gamma", type: "WiFi Tag", status: "available", lastSeen: "1 hour ago", batteryLevel: 45 },
  { id: "DEV-004", name: "Tracker Delta", type: "BLE Tag", status: "available", lastSeen: "5 min ago", batteryLevel: 78 },
  { id: "DEV-005", name: "Tracker Epsilon", type: "WiFi Tag", status: "in-use", lastSeen: "Just now", batteryLevel: 60 },
  { id: "DEV-006", name: "Tracker Zeta", type: "BLE Tag", status: "available", lastSeen: "3 hours ago", batteryLevel: 20 },
  { id: "DEV-007", name: "Tracker Eta", type: "WiFi Tag", status: "scrap", lastSeen: "1 week ago", batteryLevel: 0 },
  { id: "DEV-008", name: "Tracker Theta", type: "BLE Tag", status: "available", lastSeen: "10 min ago", batteryLevel: 95 },
  { id: "DEV-009", name: "Tracker Iota", type: "WiFi Tag", status: "available", lastSeen: "2 days ago", batteryLevel: 15 },
  { id: "DEV-010", name: "Tracker Kappa", type: "BLE Tag", status: "scrap", lastSeen: "2 weeks ago", batteryLevel: 0 },
];

const statusConfig: Record<DeviceStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  "available": { label: "Available", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30", icon: CircleCheck },
  "in-use": { label: "In Use", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30", icon: Activity },
  "scrap": { label: "Scrap", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", icon: CircleOff },
};

const getDeviceIcon = (type: string) => {
  return type.toLowerCase().includes("ble") ? Radio : Wifi;
};

export default function DeviceListTab() {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [activeFilter, setActiveFilter] = useState<DeviceStatus | "all">("all");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const handleScrapToggle = (deviceId: string, toScrap: boolean) => {
    setDevices(prev =>
      prev.map(device =>
        device.id === deviceId
          ? { ...device, status: (toScrap ? "scrap" : "available") as DeviceStatus }
          : device
      )
    );
    // Update selected device if it's the one being changed
    if (selectedDevice?.id === deviceId) {
      setSelectedDevice(prev => prev ? { ...prev, status: (toScrap ? "scrap" : "available") as DeviceStatus } : null);
    }
  };

  const filteredDevices = activeFilter === "all" 
    ? devices 
    : devices.filter(d => d.status === activeFilter);

  const counts = {
    all: devices.length,
    available: devices.filter(d => d.status === "available").length,
    "in-use": devices.filter(d => d.status === "in-use").length,
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
        {/* Total Devices Card */}
        <Card 
          className={`cursor-pointer transition-all hover:scale-105 ${activeFilter === "all" ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setActiveFilter("all")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{counts.all}</p>
              <p className="text-sm text-muted-foreground">Total Devices</p>
            </div>
          </CardContent>
        </Card>

        {(["available", "in-use", "scrap"] as DeviceStatus[]).map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <Card 
              key={status}
              className={`cursor-pointer transition-all hover:scale-105 ${activeFilter === status ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setActiveFilter(activeFilter === status ? "all" : status)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
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
          <div className="space-y-4">
            {filteredDevices.map((device) => {
              const config = statusConfig[device.status];
              const DeviceIcon = getDeviceIcon(device.type);
              
              return (
                <div
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  className="flex items-center justify-between p-5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50 cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-xl ${config.bgColor} ${config.color}`}>
                      <DeviceIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{device.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {device.id} • {device.type} • <span className={`${device.batteryLevel < 20 ? 'text-red-500' : device.batteryLevel < 50 ? 'text-yellow-500' : 'text-green-500'}`}>{device.batteryLevel}%</span>
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className={`${config.bgColor} ${config.color} border-transparent px-4 py-1.5 text-sm`}>
                    {config.label}
                  </Badge>
                </div>
              );
            })}

            {filteredDevices.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No devices found with this status
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device Detail Dialog */}
      <Dialog open={!!selectedDevice} onOpenChange={(open) => !open && setSelectedDevice(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedDevice && (() => {
            const config = statusConfig[selectedDevice.status];
            const DeviceIcon = getDeviceIcon(selectedDevice.type);
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
                      <DeviceIcon className="h-5 w-5" />
                    </div>
                    {selectedDevice.name}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Device ID</p>
                      <p className="font-medium">{selectedDevice.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{selectedDevice.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="outline" className={`${config.bgColor} ${config.color} border-transparent mt-1`}>
                        {config.label}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Battery</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Battery className={`h-4 w-4 ${selectedDevice.batteryLevel < 20 ? 'text-red-500' : selectedDevice.batteryLevel < 50 ? 'text-yellow-500' : 'text-green-500'}`} />
                        <span className={`font-medium ${selectedDevice.batteryLevel < 20 ? 'text-red-500' : selectedDevice.batteryLevel < 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {selectedDevice.batteryLevel}%
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Last Seen</p>
                      <p className="font-medium">{selectedDevice.lastSeen}</p>
                    </div>
                  </div>

                  {/* Scrap Toggle */}
                  {selectedDevice.status === "available" && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="font-medium">Move to Scrap</p>
                        <p className="text-sm text-muted-foreground">Mark this device as decommissioned</p>
                      </div>
                      <Switch
                        checked={false}
                        onCheckedChange={(checked) => handleScrapToggle(selectedDevice.id, checked)}
                      />
                    </div>
                  )}

                  {selectedDevice.status === "scrap" && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="font-medium">Restore Device</p>
                        <p className="text-sm text-muted-foreground">Make this device available again</p>
                      </div>
                      <Switch
                        checked={true}
                        onCheckedChange={(checked) => handleScrapToggle(selectedDevice.id, checked)}
                      />
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}