import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Radio, Trash2, Settings } from "lucide-react";

interface Gateway {
  id: string;
  name: string;
  model: string;
  macAddress: string;
  status: "connected" | "disconnected";
  lastSeen: string;
}

export default function GatewayConfigTab() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddGateway = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newGateway: Gateway = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      model: formData.get("model") as string,
      macAddress: formData.get("macAddress") as string,
      status: "connected",
      lastSeen: new Date().toLocaleString(),
    };
    
    setGateways([...gateways, newGateway]);
    setIsAddDialogOpen(false);
    toast({
      title: "Gateway added successfully!",
      description: `${newGateway.name} has been configured.`,
    });
  };

  const handleDeleteGateway = (id: string) => {
    setGateways(gateways.filter(g => g.id !== id));
    toast({
      title: "Gateway removed",
      description: "The gateway has been deleted from your configuration.",
    });
  };

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
                <Label htmlFor="model">Gateway Model</Label>
                <Select name="model" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="G1">G1 (Minew)</SelectItem>
                    <SelectItem value="G2">G2 (Minew)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  FAT supports G1 and G2 from Minew
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

              <Button type="submit" className="w-full">Add Gateway</Button>
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
                <Label htmlFor="model">Gateway Model</Label>
                <Select name="model" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="G1">G1 (Minew)</SelectItem>
                    <SelectItem value="G2">G2 (Minew)</SelectItem>
                  </SelectContent>
                </Select>
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

              <Button type="submit" className="w-full">Add Gateway</Button>
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
                  <div className={`w-3 h-3 rounded-full ${
                    gateway.status === "connected" ? "bg-success" : "bg-destructive"
                  }`} />
                  
                  <div>
                    <h4 className="font-medium text-foreground">{gateway.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {gateway.model} • {gateway.macAddress}
                    </p>
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
