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
    <Card className="group hover-lift cursor-pointer border-0 shadow-md hover:shadow-xl bg-gradient-to-br from-card to-muted/20 overflow-hidden relative">
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${isPatient ? 'gradient-primary' : 'gradient-secondary'}`} />
      
      {/* Background glow effect */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 ${isPatient ? 'bg-primary/10' : 'bg-secondary/10'} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
      
      <CardContent className="p-5 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{device.name}</h4>
            <p className="text-sm text-muted-foreground font-medium">{device.patientId}</p>
          </div>
          <Badge 
            variant={isPatient ? "default" : "secondary"}
            className="shadow-md group-hover:scale-110 transition-transform"
          >
            {isPatient ? "Patient" : "Provider"}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
            <div className={`p-2 rounded-lg ${isPatient ? 'bg-primary/10' : 'bg-secondary/10'}`}>
              <MapPin className="h-4 w-4" />
            </div>
            <span className="font-medium">{device.location.room}</span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
            <div className={`p-2 rounded-lg ${isPatient ? 'bg-primary/10' : 'bg-secondary/10'}`}>
              <Signal className="h-4 w-4" />
            </div>
            <span className="font-medium">{signalQuality} ({device.signalStrength} dBm)</span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
            <div className={`p-2 rounded-lg ${isPatient ? 'bg-primary/10' : 'bg-secondary/10'}`}>
              <Radio className="h-4 w-4" />
            </div>
            <span className="font-medium">{device.gatewaysUsed} gateways</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
