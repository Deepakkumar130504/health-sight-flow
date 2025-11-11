import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FloorMap from "./FloorMap";
import DeviceCard from "./DeviceCard";

const mockDevices = [
  {
    id: "1",
    name: "John Smith",
    patientId: "P-2024-001",
    type: "patient",
    location: { x: 45, y: 60, room: "ICU-101" },
    signalStrength: -65,
    gatewaysUsed: 3,
  },
  {
    id: "2",
    name: "Dr. Sarah Johnson",
    patientId: "PRV-001",
    type: "provider",
    location: { x: 70, y: 30, room: "Ward-A" },
    signalStrength: -58,
    gatewaysUsed: 4,
  },
  {
    id: "3",
    name: "Emma Davis",
    patientId: "P-2024-002",
    type: "patient",
    location: { x: 25, y: 45, room: "General-205" },
    signalStrength: -72,
    gatewaysUsed: 2,
  },
  {
    id: "4",
    name: "Nurse Mike Chen",
    patientId: "PRV-002",
    type: "provider",
    location: { x: 55, y: 75, room: "ICU-103" },
    signalStrength: -60,
    gatewaysUsed: 3,
  },
];

export default function DashboardTab() {
  const [selectedFloor, setSelectedFloor] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");

  const filteredDevices = mockDevices.filter((device) => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          device.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || device.type === filterType;
    const matchesRoom = roomFilter === "all" || device.location.room.startsWith(roomFilter);
    
    return matchesSearch && matchesType && matchesRoom;
  });

  const patientCount = filteredDevices.filter(d => d.type === "patient").length;
  const providerCount = filteredDevices.filter(d => d.type === "provider").length;

  return (
    <div className="p-8 space-y-8">
      {/* Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 gradient-primary opacity-10 blur-3xl rounded-3xl" />
        <div className="relative">
          <h2 className="text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">Real-time patient and provider tracking</p>
        </div>
      </div>

      {/* Stats Cards with beautiful gradients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-lift border-0 shadow-lg bg-gradient-to-br from-card to-muted/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tracked</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-foreground">{filteredDevices.length}</div>
            <p className="text-sm text-muted-foreground mt-2">Active devices</p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-primary gradient-primary overflow-hidden relative group">
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">Patients</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-primary-foreground">{patientCount}</div>
            <p className="text-sm text-primary-foreground/80 mt-2">Currently tracked</p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-secondary gradient-secondary overflow-hidden relative group">
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-sm font-medium text-secondary-foreground/80">Providers</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-secondary-foreground">{providerCount}</div>
            <p className="text-sm text-secondary-foreground/80 mt-2">Staff on duty</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Floor Map Section */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-xl h-full overflow-hidden backdrop-blur-sm bg-card/80">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">Floor Map</CardTitle>
                <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                  <SelectTrigger className="w-32 border-primary/20 hover:border-primary/40 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Floor 1</SelectItem>
                    <SelectItem value="2">Floor 2</SelectItem>
                    <SelectItem value="3">Floor 3</SelectItem>
                    <SelectItem value="4">Floor 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <FloorMap devices={filteredDevices} floor={selectedFloor} />
            </CardContent>
          </Card>
        </div>

        {/* Device List Section */}
        <div>
          <Card className="border-0 shadow-xl h-full flex flex-col backdrop-blur-sm bg-card/80">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-secondary/5 to-primary/5">
              <CardTitle className="text-xl font-bold">Devices</CardTitle>
              
              {/* Search */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-primary/20 focus:border-primary/40 transition-colors"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                  className="flex-1 transition-all hover:scale-105"
                >
                  All ({mockDevices.length})
                </Button>
                <Button
                  variant={filterType === "patient" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("patient")}
                  className="flex-1 transition-all hover:scale-105"
                >
                  Patients
                </Button>
                <Button
                  variant={filterType === "provider" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("provider")}
                  className="flex-1 transition-all hover:scale-105"
                >
                  Providers
                </Button>
              </div>

              {/* Room Type Filter */}
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger className="mt-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Ward">Ward</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>

            {/* Device Cards List */}
            <CardContent className="flex-1 overflow-auto p-4 space-y-3">
              {filteredDevices.map((device, index) => (
                <div 
                  key={device.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <DeviceCard device={device} />
                </div>
              ))}
              {filteredDevices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No devices found matching your filters
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
