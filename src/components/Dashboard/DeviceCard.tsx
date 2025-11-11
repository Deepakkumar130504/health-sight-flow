import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Signal, Radio } from "lucide-react";

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

export default function DeviceCard({ device }: DeviceCardProps) {
  const isPatient = device.type === "patient";
  const signalQuality = device.signalStrength > -60 ? "Excellent" : 
                        device.signalStrength > -70 ? "Good" : "Fair";
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-foreground">{device.name}</h4>
            <p className="text-sm text-muted-foreground">{device.patientId}</p>
          </div>
          <Badge variant={isPatient ? "default" : "secondary"}>
            {isPatient ? "Patient" : "Provider"}
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
