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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">Real-time patient and provider tracking</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{filteredDevices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active devices</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{patientCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently tracked</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{providerCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Staff on duty</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Floor Map Section */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg h-full">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Floor Map</CardTitle>
                <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                  <SelectTrigger className="w-32">
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
          <Card className="shadow-lg h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle>Devices</CardTitle>
              
              {/* Search */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                  className="flex-1"
                >
                  All ({mockDevices.length})
                </Button>
                <Button
                  variant={filterType === "patient" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("patient")}
                  className="flex-1"
                >
                  Patients
                </Button>
                <Button
                  variant={filterType === "provider" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("provider")}
                  className="flex-1"
                >
                  Providers
                </Button>
              </div>

              {/* Room Type Filter */}
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger className="mt-2">
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
              {filteredDevices.map((device) => (
                <DeviceCard key={device.id} device={device} />
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
