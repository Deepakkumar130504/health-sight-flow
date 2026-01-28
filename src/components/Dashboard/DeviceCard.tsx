import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Signal, Radio, Users, UserCog, Package } from "lucide-react";

interface Device {
  id: string;
  name: string;
  patientId: string;
  type: string;
  location: { x: number; y: number; room: string };
  signalStrength: number;
  gatewaysUsed: number;
}

interface DeviceCardProps {
  device: Device;
}

const typeConfig = {
  patient: { 
    label: "Patient", 
    variant: "default" as const,
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  provider: { 
    label: "Provider", 
    variant: "secondary" as const,
    icon: UserCog,
    color: "text-secondary",
    bgColor: "bg-secondary/10"
  },
  asset: { 
    label: "Asset", 
    variant: "outline" as const,
    icon: Package,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30"
  },
};

export default function DeviceCard({ device }: DeviceCardProps) {
  const config = typeConfig[device.type as keyof typeof typeConfig] || typeConfig.patient;
  const TypeIcon = config.icon;
  const signalQuality = device.signalStrength > -60 ? "Excellent" : 
                        device.signalStrength > -70 ? "Good" : "Fair";
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{device.name}</h4>
              <p className="text-sm text-muted-foreground">{device.patientId}</p>
            </div>
          </div>
          <Badge variant={config.variant} className={device.type === "asset" ? "border-amber-500/50 text-amber-600 dark:text-amber-400" : ""}>
            {config.label}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{device.location.room}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Signal className="h-4 w-4" />
            <span>{signalQuality} ({device.signalStrength} dBm)</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Radio className="h-4 w-4" />
            <span>{device.gatewaysUsed} gateways</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
