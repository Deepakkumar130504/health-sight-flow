import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  PieChartIcon,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react";
import { format, addDays, subDays, startOfDay, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";

// Mock data generator based on time
const generateRoomData = (timeIndex: number) => {
  const variation = Math.sin(timeIndex / 10) * 2;
  return [
    { name: "ICU-101", patients: Math.max(1, Math.round(2 + variation)), nurses: Math.max(1, Math.round(3 + variation * 0.5)), assets: Math.max(1, Math.round(4 + variation * 0.3)) },
    { name: "ICU-102", patients: Math.max(1, Math.round(1 + variation * 0.8)), nurses: Math.max(1, Math.round(2 + variation * 0.3)), assets: Math.max(1, Math.round(3 + variation * 0.5)) },
    { name: "General-205", patients: Math.max(1, Math.round(3 + variation * 1.2)), nurses: Math.max(1, Math.round(2 + variation * 0.7)), assets: Math.max(1, Math.round(5 + variation * 0.4)) },
    { name: "Ward-A", patients: Math.max(1, Math.round(4 - variation)), nurses: Math.max(1, Math.round(3 - variation * 0.4)), assets: Math.max(1, Math.round(6 - variation * 0.2)) },
    { name: "Ward-B", patients: Math.max(1, Math.round(2 + variation * 0.5)), nurses: Math.max(1, Math.round(2 + variation * 0.6)), assets: Math.max(1, Math.round(4 + variation * 0.3)) },
  ];
};

const generateTrendData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${6 + i}:00`,
    patients: Math.round(8 + Math.sin(i / 2) * 4),
    staff: Math.round(10 + Math.cos(i / 3) * 3),
    occupancy: Math.round(65 + Math.sin(i / 2.5) * 20),
  }));
};

const generatePieData = (roomData: any[]) => {
  const totalPatients = roomData.reduce((sum, room) => sum + room.patients, 0);
  const totalNurses = roomData.reduce((sum, room) => sum + room.nurses, 0);
  const totalAssets = roomData.reduce((sum, room) => sum + room.assets, 0);
  return [
    { name: "Patients", value: totalPatients, color: "hsl(var(--primary))" },
    { name: "Staff", value: totalNurses, color: "hsl(var(--secondary))" },
    { name: "Assets", value: totalAssets, color: "hsl(var(--warning))" },
  ];
};

// Hour blocks for the visual timeline
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Quick preset configurations
const TIME_PRESETS = [
  { label: "Morning", start: 6, end: 12, icon: "🌅" },
  { label: "Afternoon", start: 12, end: 18, icon: "☀️" },
  { label: "Evening", start: 18, end: 22, icon: "🌆" },
  { label: "Night", start: 22, end: 6, icon: "🌙" },
  { label: "Full Day", start: 0, end: 24, icon: "📅" },
];

export default function AnalyticsTab() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [rangeStart, setRangeStart] = useState(6);
  const [rangeEnd, setRangeEnd] = useState(18);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>("Full Day");
  const timelineRef = useRef<HTMLDivElement>(null);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSelectedHour(prev => {
        const next = prev + 1;
        if (next > rangeEnd) {
          setIsPlaying(false);
          return rangeStart;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, rangeStart, rangeEnd]);

  // Generate data based on current hour
  const roomData = useMemo(() => generateRoomData(selectedHour), [selectedHour]);
  const pieData = useMemo(() => generatePieData(roomData), [roomData]);
  const trendData = useMemo(() => generateTrendData(), []);

  const totalPatients = pieData[0]?.value || 0;
  const totalStaff = pieData[1]?.value || 0;
  const totalAssets = pieData[2]?.value || 0;
  const avgOccupancy = Math.round((totalPatients / (totalPatients + 10)) * 100);

  const crowdedRooms = roomData.filter(room => room.patients >= 4 || room.nurses >= 3);

  const handlePresetClick = (preset: typeof TIME_PRESETS[0]) => {
    setActivePreset(preset.label);
    setRangeStart(preset.start);
    setRangeEnd(preset.end === 6 ? 24 : preset.end);
    setSelectedHour(preset.start);
  };

  const handleHourClick = (hour: number) => {
    setSelectedHour(hour);
    setIsPlaying(false);
  };

  const navigateDate = (direction: "prev" | "next") => {
    setSelectedDate(prev => direction === "prev" ? subDays(prev, 1) : addDays(prev, 1));
  };

  const isHourInRange = (hour: number) => {
    if (rangeEnd > rangeStart) {
      return hour >= rangeStart && hour <= rangeEnd;
    }
    return hour >= rangeStart || hour <= rangeEnd;
  };

  const getHourIntensity = (hour: number) => {
    // Simulate activity intensity for visual feedback
    const intensity = Math.sin((hour - 6) / 3) * 0.5 + 0.5;
    return Math.max(0.2, Math.min(1, intensity));
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      {/* Header with gradient accent */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent rounded-2xl -z-10" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">AI Analytics</h2>
          </div>
          <p className="text-muted-foreground ml-14">Real-time crowd analysis, occupancy insights, and predictive analytics</p>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-primary mt-1">{totalPatients}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-success">+12%</span> vs last hour
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-full -mr-10 -mt-10" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                <p className="text-3xl font-bold text-secondary mt-1">{totalStaff}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-success">+5%</span> vs last hour
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-xl">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-warning/5 to-warning/10 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-warning/10 rounded-full -mr-10 -mt-10" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tracked Assets</p>
                <p className="text-3xl font-bold text-warning mt-1">{totalAssets}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-success">+3%</span> vs last hour
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-destructive/5 to-destructive/10 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-destructive/10 rounded-full -mr-10 -mt-10" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Occupancy</p>
                <p className="text-3xl font-bold text-destructive mt-1">{avgOccupancy}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {crowdedRooms.length} area{crowdedRooms.length !== 1 ? 's' : ''} at capacity
                </p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-xl">
                <PieChartIcon className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Innovative Timeline Control Card */}
      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-secondary to-warning" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Time Machine</CardTitle>
                <CardDescription>Navigate through historical data</CardDescription>
              </div>
            </div>
            
            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              {isSameDay(selectedDate, new Date()) && selectedHour === new Date().getHours() ? (
                <Badge className="bg-success/20 text-success border-success/30 animate-pulse">
                  <Zap className="h-3 w-3 mr-1" />
                  LIVE
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted/50">
                  {format(selectedDate, "MMM dd")} • {String(selectedHour).padStart(2, '0')}:00
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Date Navigator */}
          <div className="flex items-center justify-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full hover:bg-primary/10"
              onClick={() => navigateDate("prev")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-1 bg-muted/50 rounded-full px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full px-3 text-xs",
                  isSameDay(selectedDate, subDays(new Date(), 1)) && "bg-primary/20 text-primary"
                )}
                onClick={() => setSelectedDate(subDays(new Date(), 1))}
              >
                Yesterday
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full px-3 text-xs",
                  isSameDay(selectedDate, new Date()) && "bg-primary/20 text-primary"
                )}
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full px-3 text-xs",
                  isSameDay(selectedDate, addDays(new Date(), 1)) && "bg-primary/20 text-primary"
                )}
                onClick={() => setSelectedDate(addDays(new Date(), 1))}
              >
                Tomorrow
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full hover:bg-primary/10"
              onClick={() => navigateDate("next")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Presets */}
          <div className="flex justify-center gap-2 flex-wrap">
            {TIME_PRESETS.map(preset => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full px-4 transition-all duration-300",
                  activePreset === preset.label 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25" 
                    : "hover:bg-primary/10 hover:border-primary/50"
                )}
                onClick={() => handlePresetClick(preset)}
              >
                <span className="mr-1.5">{preset.icon}</span>
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Visual Timeline Scrubber */}
          <div className="relative pt-8 pb-4">
            {/* Current Time Indicator */}
            <div 
              className="absolute top-0 transition-all duration-300 ease-out z-10"
              style={{ left: `${(selectedHour / 23) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-primary/30">
                  {String(selectedHour).padStart(2, '0')}:00
                </div>
                <div className="w-0.5 h-4 bg-primary" />
              </div>
            </div>

            {/* Hour Blocks */}
            <div 
              ref={timelineRef}
              className="flex gap-0.5 rounded-xl overflow-hidden bg-muted/30 p-1"
            >
              {HOURS.map(hour => {
                const inRange = isHourInRange(hour);
                const intensity = getHourIntensity(hour);
                const isSelected = hour === selectedHour;
                
                return (
                  <button
                    key={hour}
                    onClick={() => handleHourClick(hour)}
                    className={cn(
                      "flex-1 h-12 rounded-lg transition-all duration-200 relative group",
                      "hover:scale-110 hover:z-10",
                      isSelected 
                        ? "bg-primary shadow-lg shadow-primary/40 scale-105 z-10" 
                        : inRange 
                          ? "bg-primary/20 hover:bg-primary/40" 
                          : "bg-muted/50 hover:bg-muted"
                    )}
                    style={{
                      opacity: inRange ? 0.5 + intensity * 0.5 : 0.3,
                    }}
                  >
                    {/* Activity indicator bar */}
                    <div 
                      className={cn(
                        "absolute bottom-0 left-0 right-0 rounded-b-lg transition-all",
                        isSelected ? "bg-primary-foreground/30" : "bg-primary/30"
                      )}
                      style={{ height: `${intensity * 100}%` }}
                    />
                    
                    {/* Hour label on hover */}
                    <div className={cn(
                      "absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
                      "text-[10px] font-medium text-muted-foreground whitespace-nowrap"
                    )}>
                      {String(hour).padStart(2, '0')}:00
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Time Labels */}
            <div className="flex justify-between mt-2 px-1">
              <span className="text-xs text-muted-foreground">00:00</span>
              <span className="text-xs text-muted-foreground">06:00</span>
              <span className="text-xs text-muted-foreground">12:00</span>
              <span className="text-xs text-muted-foreground">18:00</span>
              <span className="text-xs text-muted-foreground">23:00</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted"
              onClick={() => setSelectedHour(prev => Math.max(0, prev - 1))}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="default" 
              size="icon" 
              className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted"
              onClick={() => setSelectedHour(prev => Math.min(23, prev + 1))}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trend Line Chart */}
        <Card className="xl:col-span-2 shadow-xl border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Occupancy Trends</CardTitle>
                <CardDescription>Hourly tracking data visualization</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStaff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="patients" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPatients)" name="Patients" />
                <Area type="monotone" dataKey="staff" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorStaff)" name="Staff" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-secondary to-warning" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <PieChartIcon className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-lg">Distribution</CardTitle>
                <CardDescription>By category</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Occupancy Bar Chart */}
      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-warning to-primary" />
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-warning" />
            </div>
            <div>
              <CardTitle className="text-lg">Room Occupancy Analysis</CardTitle>
              <CardDescription>Current distribution across all rooms</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={roomData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <Legend />
              <Bar dataKey="patients" fill="hsl(var(--primary))" name="Patients" radius={[4, 4, 0, 0]} />
              <Bar dataKey="nurses" fill="hsl(var(--secondary))" name="Staff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="assets" fill="hsl(var(--warning))" name="Assets" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {crowdedRooms.length > 0 && (
        <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-r from-warning/5 via-card to-warning/5">
          <div className="h-1 bg-gradient-to-r from-warning via-destructive to-warning" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-lg animate-pulse">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg">Crowd Alerts</CardTitle>
                <CardDescription>Areas requiring attention</CardDescription>
              </div>
              <Badge variant="destructive" className="ml-auto">{crowdedRooms.length} Alert{crowdedRooms.length !== 1 ? 's' : ''}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {crowdedRooms.map(room => (
                <div 
                  key={room.name} 
                  className="p-4 rounded-xl bg-warning/5 border border-warning/20 hover:bg-warning/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{room.name}</span>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">High</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{room.patients} patients</span>
                    <span>•</span>
                    <span>{room.nurses} staff</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {crowdedRooms.length === 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-r from-success/5 via-card to-success/5">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3 text-success">
              <Activity className="h-5 w-5" />
              <span className="font-medium">All areas operating within normal capacity</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
