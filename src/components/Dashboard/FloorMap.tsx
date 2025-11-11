import { Badge } from "@/components/ui/badge";
import { User, Stethoscope } from "lucide-react";

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

export default function FloorMap({ devices, floor }: FloorMapProps) {
  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-inner bg-gradient-to-br from-muted/40 via-background to-muted/20">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div 
              key={i} 
              className="border border-primary/30 transition-colors hover:border-primary/60"
              style={{ animationDelay: `${i * 0.01}s` }}
            />
          ))}
        </div>
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      {/* Room Labels with modern styling */}
      <div className="absolute top-6 left-6 space-y-2">
        <Badge variant="outline" className="bg-card/95 backdrop-blur-sm shadow-md border-primary/30 text-sm font-semibold">
          ICU Section
        </Badge>
      </div>
      <div className="absolute top-6 right-6 space-y-2">
        <Badge variant="outline" className="bg-card/95 backdrop-blur-sm shadow-md border-secondary/30 text-sm font-semibold">
          General Ward
        </Badge>
      </div>
      <div className="absolute bottom-6 left-6 space-y-2">
        <Badge variant="outline" className="bg-card/95 backdrop-blur-sm shadow-md border-accent/30 text-sm font-semibold">
          Ward-A
        </Badge>
      </div>

      {/* Device Markers with enhanced styling */}
      {devices.map((device, index) => {
        const isPatient = device.type === "patient";
        const Icon = isPatient ? User : Stethoscope;
        
        return (
          <div
            key={device.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer animate-fade-in"
            style={{
              left: `${device.location.x}%`,
              top: `${device.location.y}%`,
              animationDelay: `${index * 0.1}s`
            }}
          >
            {/* Outer glow ring */}
            <div
              className={`absolute inset-0 w-16 h-16 rounded-full -m-3 ${
                isPatient ? "bg-primary/20" : "bg-secondary/20"
              } blur-xl group-hover:scale-150 transition-transform duration-500`}
            />

            {/* Marker with gradient */}
            <div
              className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-125 ${
                isPatient
                  ? "gradient-primary shadow-primary"
                  : "gradient-secondary shadow-secondary"
              }`}
            >
              <Icon className="h-6 w-6 text-white drop-shadow-lg" />
            </div>

            {/* Enhanced tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-75 group-hover:scale-100">
              <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-4 whitespace-nowrap">
                <p className="font-bold text-base text-foreground">{device.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{device.location.room}</p>
                <div className={`mt-2 h-1 w-full rounded-full ${isPatient ? 'gradient-primary' : 'gradient-secondary'}`} />
              </div>
            </div>

            {/* Multiple pulse rings */}
            <div
              className={`absolute inset-0 w-12 h-12 rounded-full animate-ping opacity-50 ${
                isPatient ? "bg-primary" : "bg-secondary"
              }`}
              style={{ animationDuration: "2s" }}
            />
            <div
              className={`absolute inset-0 w-12 h-12 rounded-full animate-pulse-slow opacity-30 ${
                isPatient ? "bg-primary" : "bg-secondary"
              }`}
            />
          </div>
        );
      })}

      {/* Floor Label with gradient */}
      <div className="absolute bottom-6 right-6">
        <Badge className="text-lg px-6 py-3 shadow-xl gradient-primary font-bold">
          Floor {floor}
        </Badge>
      </div>
    </div>
  );
}
