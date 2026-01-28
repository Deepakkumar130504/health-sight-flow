import { Badge } from "@/components/ui/badge";
import { User, Stethoscope, Package } from "lucide-react";

interface Device {
  id: string;
  name: string;
  type: string;
  location: { x: number; y: number; room: string };
}

interface FloorMapProps {
  devices: Device[];
  floor: string;
}

const markerConfig = {
  patient: {
    icon: User,
    bgColor: "bg-primary",
    textColor: "text-primary-foreground",
    pulseColor: "bg-primary",
  },
  provider: {
    icon: Stethoscope,
    bgColor: "bg-secondary",
    textColor: "text-secondary-foreground",
    pulseColor: "bg-secondary",
  },
  asset: {
    icon: Package,
    bgColor: "bg-amber-500",
    textColor: "text-white",
    pulseColor: "bg-amber-500",
  },
};

export default function FloorMap({ devices, floor }: FloorMapProps) {
  return (
    <div className="relative w-full h-[500px] bg-muted/30 rounded-lg border-2 border-dashed border-border overflow-hidden">
      {/* Floor Plan Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-muted-foreground/20" />
          ))}
        </div>
      </div>

      {/* Room Labels */}
      <div className="absolute top-4 left-4 space-y-2">
        <Badge variant="outline" className="bg-background/90">ICU Section</Badge>
      </div>
      <div className="absolute top-4 right-4 space-y-2">
        <Badge variant="outline" className="bg-background/90">General Ward</Badge>
      </div>
      <div className="absolute bottom-4 left-4 space-y-2">
        <Badge variant="outline" className="bg-background/90">Ward-A</Badge>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <div className="flex items-center gap-2 bg-background/90 px-3 py-1.5 rounded-full border">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs font-medium">Patient</span>
        </div>
        <div className="flex items-center gap-2 bg-background/90 px-3 py-1.5 rounded-full border">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-xs font-medium">Provider</span>
        </div>
        <div className="flex items-center gap-2 bg-background/90 px-3 py-1.5 rounded-full border">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs font-medium">Asset</span>
        </div>
      </div>

      {/* Device Markers */}
      {devices.map((device) => {
        const config = markerConfig[device.type as keyof typeof markerConfig] || markerConfig.patient;
        const Icon = config.icon;
        
        return (
          <div
            key={device.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{
              left: `${device.location.x}%`,
              top: `${device.location.y}%`,
            }}
          >
            {/* Marker */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${config.bgColor} ${config.textColor}`}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-card border border-border rounded-lg shadow-lg p-3 whitespace-nowrap">
                <p className="font-semibold text-sm">{device.name}</p>
                <p className="text-xs text-muted-foreground">{device.location.room}</p>
                <Badge variant="outline" className="mt-1 text-xs capitalize">{device.type}</Badge>
              </div>
            </div>

            {/* Pulse Animation */}
            <div
              className={`absolute inset-0 rounded-full animate-ping opacity-75 ${config.pulseColor}`}
              style={{ animationDuration: "2s" }}
            />
          </div>
        );
      })}

      {/* Floor Label */}
      <div className="absolute bottom-4 right-4">
        <Badge className="text-base px-4 py-2">Floor {floor}</Badge>
      </div>
    </div>
  );
}
