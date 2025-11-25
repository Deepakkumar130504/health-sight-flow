import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Radio, Trash2, MapPin } from "lucide-react";

interface RoomData {
  id: string;
  name: string;
  floorPlanName: string;
  points: { x: number; y: number }[];
  gateway?: {
    x: number;
    y: number;
    name: string;
  };
  distanceToGateway?: number;
}

interface Gateway {
  id: string;
  name: string;
  floorPlanId: string;
  floorPlanName: string;
  macAddress: string;
  status: "connected" | "disconnected";
  lastSeen: string;
  x?: number;
  y?: number;
}

export default function GatewayConfigTab() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [savedRooms, setSavedRooms] = useState<RoomData[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPlacingGateway, setIsPlacingGateway] = useState(false);
  const [pendingGateway, setPendingGateway] = useState<Gateway | null>(null);
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<RoomData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadedRooms = localStorage.getItem("roomConfigurations");
    if (loadedRooms) {
      setSavedRooms(JSON.parse(loadedRooms));
    }

    const loadedGateways = localStorage.getItem("gateways");
    if (loadedGateways) {
      setGateways(JSON.parse(loadedGateways));
    }
  }, []);

  useEffect(() => {
    if (gateways.length > 0) {
      localStorage.setItem("gateways", JSON.stringify(gateways));
    }
  }, [gateways]);

  useEffect(() => {
    if (isPlacingGateway && selectedFloorPlan && canvasRef.current) {
      drawFloorPlanWithGateways();
    }
  }, [isPlacingGateway, selectedFloorPlan, gateways]);

  const drawFloorPlanWithGateways = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedFloorPlan) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the floor plan rooms
    const roomsForThisFloor = savedRooms.filter(
      (room) => room.floorPlanName === selectedFloorPlan.floorPlanName
    );

    roomsForThisFloor.forEach((room) => {
      if (room.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(room.points[0].x, room.points[0].y);
        room.points.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.strokeStyle = "hsl(var(--muted-foreground))";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "hsla(var(--primary) / 0.1)";
        ctx.fill();

        // Draw room name
        const centerX = room.points.reduce((sum, p) => sum + p.x, 0) / room.points.length;
        const centerY = room.points.reduce((sum, p) => sum + p.y, 0) / room.points.length;
        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(room.name, centerX, centerY);
      }
    });

    // Draw existing gateways for this floor plan
    const gatewaysForThisFloor = gateways.filter(
      (gw) => gw.floorPlanName === selectedFloorPlan.floorPlanName && gw.x !== undefined && gw.y !== undefined
    );

    gatewaysForThisFloor.forEach((gateway) => {
      if (gateway.x !== undefined && gateway.y !== undefined) {
        // Draw 15m coverage circle (assuming 1px = 0.1m, so 15m = 150px radius)
        const radiusInPixels = 150;
        ctx.beginPath();
        ctx.arc(gateway.x, gateway.y, radiusInPixels, 0, 2 * Math.PI);
        ctx.fillStyle = "hsla(var(--primary) / 0.15)";
        ctx.fill();
        ctx.strokeStyle = "hsl(var(--primary))";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw gateway marker
        ctx.beginPath();
        ctx.arc(gateway.x, gateway.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "hsl(var(--primary))";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw gateway name
        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(gateway.name, gateway.x, gateway.y - 15);
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlacingGateway || !pendingGateway || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updatedGateway: Gateway = {
      ...pendingGateway,
      x,
      y,
      status: "connected",
      lastSeen: new Date().toLocaleString(),
    };

    setGateways([...gateways, updatedGateway]);
    setIsPlacingGateway(false);
    setPendingGateway(null);
    setSelectedFloorPlan(null);

    toast({
      title: "Gateway placed successfully!",
      description: `${updatedGateway.name} has been placed on the map.`,
    });
  };

  const handleAddGateway = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const floorPlanId = formData.get("floorPlan") as string;
    const selectedRoom = savedRooms.find((room) => room.id === floorPlanId);

    if (!selectedRoom) {
      toast({
        title: "Error",
        description: "Please select a valid floor plan.",
        variant: "destructive",
      });
      return;
    }

    const newGateway: Gateway = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      floorPlanId: floorPlanId,
      floorPlanName: selectedRoom.floorPlanName,
      macAddress: formData.get("macAddress") as string,
      status: "disconnected",
      lastSeen: "Never",
    };

    setPendingGateway(newGateway);
    setSelectedFloorPlan(selectedRoom);
    setIsAddDialogOpen(false);
    setIsPlacingGateway(true);

    toast({
      title: "Click on the map to place gateway",
      description: "Click on the map to set the gateway location.",
    });
  };

  const handleDeleteGateway = (id: string) => {
    setGateways(gateways.filter((g) => g.id !== id));
    toast({
      title: "Gateway removed",
      description: "The gateway has been deleted from your configuration.",
    });
  };

  const uniqueFloorPlans = Array.from(
    new Map(savedRooms.map((room) => [room.floorPlanName, room])).values()
  );

  if (isPlacingGateway && selectedFloorPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Place Gateway on Map</h3>
            <p className="text-sm text-muted-foreground">
              Click on the map to place {pendingGateway?.name}. Coverage radius: 15 meters.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsPlacingGateway(false);
              setPendingGateway(null);
              setSelectedFloorPlan(null);
            }}
          >
            Cancel
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border border-border rounded-lg cursor-crosshair bg-background"
              onClick={handleCanvasClick}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gateways.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center mb-8">
          <Radio className="h-24 w-24 text-primary" />
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-3">No gateways configured</h3>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          Add your first network gateway to start collecting indoor positioning data from your venue.
        </p>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Add First Gateway
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Gateway</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddGateway} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Gateway Name</Label>
                <Input id="name" name="name" placeholder="e.g., Gateway 1" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floorPlan">Floor Plan</Label>
                <Select name="floorPlan" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueFloorPlans.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No floor plans available
                      </SelectItem>
                    ) : (
                      uniqueFloorPlans.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.floorPlanName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the floor plan where this gateway will be placed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="macAddress">MAC Address</Label>
                <Input
                  id="macAddress"
                  name="macAddress"
                  placeholder="e.g., AC:23:3F:C0:CC:BB"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={uniqueFloorPlans.length === 0}>
                Add Gateway
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Gateway Management</h3>
          <p className="text-sm text-muted-foreground">Manage your network gateways</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Gateway
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Gateway</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddGateway} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Gateway Name</Label>
                <Input id="name" name="name" placeholder="e.g., Gateway 1" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floorPlan">Floor Plan</Label>
                <Select name="floorPlan" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueFloorPlans.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No floor plans available
                      </SelectItem>
                    ) : (
                      uniqueFloorPlans.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.floorPlanName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the floor plan where this gateway will be placed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="macAddress">MAC Address</Label>
                <Input
                  id="macAddress"
                  name="macAddress"
                  placeholder="e.g., AC:23:3F:C0:CC:BB"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={uniqueFloorPlans.length === 0}>
                Add Gateway
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Gateways</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gateways.map((gateway) => (
              <div
                key={gateway.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      gateway.status === "connected" ? "bg-success" : "bg-destructive"
                    }`}
                  />

                  <div>
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      {gateway.name}
                      {gateway.x !== undefined && gateway.y !== undefined && (
                        <MapPin className="h-4 w-4 text-primary" />
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Floor: {gateway.floorPlanName} • {gateway.macAddress}
                    </p>
                    {gateway.x !== undefined && gateway.y !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        Position: ({Math.round(gateway.x)}, {Math.round(gateway.y)}) • Coverage: 15m radius
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge variant={gateway.status === "connected" ? "default" : "destructive"}>
                      {gateway.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last seen: {gateway.lastSeen}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGateway(gateway.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
