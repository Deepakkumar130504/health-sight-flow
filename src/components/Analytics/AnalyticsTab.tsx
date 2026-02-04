import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Clock,
  Sparkles,
  Eye,
  Wifi,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, RadialBarChart, RadialBar, ComposedChart, Line } from "recharts";
import { format, subDays, startOfWeek, addDays, isSameDay } from "date-fns";

// Generate dynamic room data
const generateRoomData = (dateOffset: number = 0) => {
  const variation = Math.sin(dateOffset / 2) * 0.3;
  return [
    { name: "ICU-101", patients: Math.round(3 + variation), staff: Math.round(4 - variation * 0.5), assets: 6, capacity: Math.round(85 + variation * 10), status: "high" },
    { name: "ICU-102", patients: Math.round(2 + variation * 0.5), staff: 3, assets: 4, capacity: Math.round(60 + variation * 5), status: "normal" },
    { name: "General-205", patients: Math.round(4 - variation), staff: Math.round(3 + variation * 0.3), assets: 7, capacity: Math.round(75 - variation * 8), status: "moderate" },
    { name: "Ward-A", patients: Math.round(5 + variation * 0.8), staff: 4, assets: 8, capacity: Math.round(90 + variation * 5), status: "critical" },
    { name: "Ward-B", patients: 2, staff: 2, assets: 5, capacity: Math.round(45 + variation * 10), status: "low" },
    { name: "ER-Main", patients: Math.round(6 - variation * 0.5), staff: 5, assets: 10, capacity: Math.round(95 - variation * 3), status: "critical" },
  ];
};

const generateTrendData = () => {
  const hours = ["6AM", "8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"];
  return hours.map((time, i) => ({
    time,
    patients: Math.round(12 + Math.sin(i / 1.5) * 6),
    staff: Math.round(15 + Math.cos(i / 2) * 4),
    prediction: Math.round(14 + Math.sin((i + 2) / 1.5) * 5),
  }));
};

// Generate weekly comparison data
const generateWeeklyData = () => {
  return [
    { day: "Mon", current: 78, previous: 72 },
    { day: "Tue", current: 82, previous: 75 },
    { day: "Wed", current: 85, previous: 80 },
    { day: "Thu", current: 79, previous: 77 },
    { day: "Fri", current: 88, previous: 82 },
    { day: "Sat", current: 65, previous: 60 },
    { day: "Sun", current: 58, previous: 55 },
  ];
};

// Generate hourly heatmap data for the week
const generateHeatmapData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = [6, 9, 12, 15, 18, 21];
  
  return days.map(day => ({
    day,
    data: hours.map(hour => ({
      hour: `${hour}:00`,
      value: Math.round(30 + Math.random() * 60),
    }))
  }));
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "critical": return "text-destructive bg-destructive/10 border-destructive/20";
    case "high": return "text-warning bg-warning/10 border-warning/20";
    case "moderate": return "text-primary bg-primary/10 border-primary/20";
    case "normal": return "text-secondary bg-secondary/10 border-secondary/20";
    case "low": return "text-muted-foreground bg-muted border-muted";
    default: return "text-muted-foreground bg-muted border-muted";
  }
};

const getHeatColor = (value: number) => {
  if (value >= 80) return "bg-destructive/80";
  if (value >= 60) return "bg-warning/80";
  if (value >= 40) return "bg-primary/60";
  return "bg-secondary/40";
};

export default function AnalyticsTab() {
  const [activeMetric, setActiveMetric] = useState<"patients" | "staff" | "assets">("patients");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  
  // Calculate week days for the calendar strip
  const weekStart = startOfWeek(subDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const dateOffset = Math.floor((new Date().getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24));
  const roomData = useMemo(() => generateRoomData(dateOffset), [dateOffset]);
  const trendData = useMemo(() => generateTrendData(), []);
  const weeklyData = useMemo(() => generateWeeklyData(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);
  
  const totalPatients = roomData.reduce((sum, room) => sum + room.patients, 0);
  const totalStaff = roomData.reduce((sum, room) => sum + room.staff, 0);
  const totalAssets = roomData.reduce((sum, room) => sum + room.assets, 0);
  const avgOccupancy = Math.round(roomData.reduce((sum, room) => sum + room.capacity, 0) / roomData.length);
  
  const criticalRooms = roomData.filter(room => room.status === "critical" || room.status === "high");

  const radialData = [
    { name: "Occupancy", value: avgOccupancy, fill: avgOccupancy > 80 ? "hsl(var(--destructive))" : avgOccupancy > 60 ? "hsl(var(--warning))" : "hsl(var(--secondary))" },
  ];

  const metrics = [
    { 
      key: "patients" as const, 
      label: "Patients", 
      value: totalPatients, 
      change: 12, 
      icon: Users, 
      color: "primary",
      description: "Currently tracked"
    },
    { 
      key: "staff" as const, 
      label: "Active Staff", 
      value: totalStaff, 
      change: 5, 
      icon: Activity, 
      color: "secondary",
      description: "On duty now"
    },
    { 
      key: "assets" as const, 
      label: "Assets", 
      value: totalAssets, 
      change: -2, 
      icon: BarChart3, 
      color: "warning",
      description: "Equipment tracked"
    },
  ];

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Hero Header with Date Navigator */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/5 to-warning/10 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -ml-24 -mb-24" />
        
        <div className="relative space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-2xl backdrop-blur-sm">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">AI Analytics</h1>
                <p className="text-muted-foreground">Intelligent insights & historical tracking</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isToday ? (
                <Badge className="bg-success/20 text-success border-success/30 px-4 py-2 text-sm gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  Live Data
                </Badge>
              ) : (
                <Badge variant="outline" className="px-4 py-2 text-sm gap-2 bg-muted/50">
                  <History className="h-3.5 w-3.5" />
                  Historical View
                </Badge>
              )}
            </div>
          </div>

          {/* Innovative Week Calendar Strip */}
          <div className="flex items-center gap-2 pt-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full shrink-0"
              onClick={() => setWeekOffset(prev => prev + 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 flex gap-1 overflow-hidden">
              {weekDays.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDate);
                const isDayToday = isSameDay(day, new Date());
                const isFuture = day > new Date();
                
                return (
                  <button
                    key={idx}
                    disabled={isFuture}
                    onClick={() => !isFuture && setSelectedDate(day)}
                    className={cn(
                      "flex-1 py-3 px-2 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 min-w-[48px]",
                      isSelected 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105" 
                        : isDayToday
                          ? "bg-primary/20 hover:bg-primary/30"
                          : isFuture
                            ? "opacity-40 cursor-not-allowed bg-muted/30"
                            : "bg-background/60 hover:bg-background/90 backdrop-blur-sm"
                    )}
                  >
                    <span className="text-[10px] font-medium uppercase opacity-70">
                      {format(day, "EEE")}
                    </span>
                    <span className={cn(
                      "text-lg font-bold",
                      isSelected ? "text-primary-foreground" : ""
                    )}>
                      {format(day, "d")}
                    </span>
                    {isDayToday && !isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full shrink-0"
              onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
              disabled={weekOffset === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
            {!isToday && (
              <Button 
                variant="link" 
                size="sm" 
                className="text-primary h-auto p-0 ml-2"
                onClick={() => {
                  setSelectedDate(new Date());
                  setWeekOffset(0);
                }}
              >
                Jump to Today
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isActive = activeMetric === metric.key;
          const isPositive = metric.change >= 0;
          
          return (
            <Card 
              key={metric.key}
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-300 border-2",
                isActive 
                  ? `border-${metric.color} shadow-lg shadow-${metric.color}/10` 
                  : "border-transparent hover:border-muted-foreground/20"
              )}
              onClick={() => setActiveMetric(metric.key)}
            >
              <div className={cn(
                "absolute inset-0 opacity-5",
                `bg-${metric.color}`
              )} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                      `bg-${metric.color}/10 text-${metric.color}`
                    )}>
                      <Icon className="h-3.5 w-3.5" />
                      {metric.label}
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-foreground">{metric.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{metric.description}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Occupancy Gauge + Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Radial Gauge */}
        <Card className="lg:col-span-1 border-0 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-lg">Facility Load</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="70%" 
                  outerRadius="100%" 
                  barSize={12} 
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    background={{ fill: 'hsl(var(--muted))' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{avgOccupancy}%</span>
                <span className="text-xs text-muted-foreground">Capacity</span>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{criticalRooms.length}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">{roomData.length - criticalRooms.length}</p>
                <p className="text-xs text-muted-foreground">Normal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card className="lg:col-span-3 border-0 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-secondary to-warning" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Activity Trends</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isToday ? "Today's movement patterns" : `Data for ${format(selectedDate, "MMM d")}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5">
                  <Eye className="h-3 w-3" />
                  AI Prediction
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gradientPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradientStaff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }} 
                />
                <Area type="monotone" dataKey="patients" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gradientPatients)" />
                <Area type="monotone" dataKey="staff" stroke="hsl(var(--secondary))" strokeWidth={2} fill="url(#gradientStaff)" />
                <Area type="monotone" dataKey="prediction" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Patients</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-xs text-muted-foreground">Staff</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-warning" style={{ borderStyle: 'dashed' }} />
                <span className="text-xs text-muted-foreground">AI Forecast</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Status + Weekly Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room List */}
        <Card className="lg:col-span-2 border-0 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-warning to-primary" />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-xl">
                  <MapPin className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-lg">Zone Status</CardTitle>
                  <p className="text-sm text-muted-foreground">Real-time room monitoring</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {roomData.map((room) => (
              <div 
                key={room.name}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-muted-foreground/10"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-2 h-10 rounded-full",
                    room.status === "critical" ? "bg-destructive" :
                    room.status === "high" ? "bg-warning" :
                    room.status === "moderate" ? "bg-primary" : "bg-secondary"
                  )} />
                  <div>
                    <p className="font-semibold text-foreground">{room.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {room.patients}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" /> {room.staff}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" /> {room.assets}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{room.capacity}%</p>
                    <p className="text-xs text-muted-foreground">capacity</p>
                  </div>
                  <Badge variant="outline" className={cn("capitalize text-xs", getStatusColor(room.status))}>
                    {room.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Activity Heatmap */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Weekly Heatmap</CardTitle>
                <p className="text-sm text-muted-foreground">Activity by hour</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Hour labels */}
              <div className="flex gap-1 ml-10">
                {[6, 9, 12, 15, 18, 21].map(hour => (
                  <div key={hour} className="flex-1 text-[10px] text-muted-foreground text-center">
                    {hour}:00
                  </div>
                ))}
              </div>
              
              {/* Heatmap grid */}
              {heatmapData.map((dayData) => (
                <div key={dayData.day} className="flex items-center gap-1">
                  <div className="w-8 text-xs text-muted-foreground font-medium">
                    {dayData.day}
                  </div>
                  <div className="flex-1 flex gap-1">
                    {dayData.data.map((hourData, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex-1 h-8 rounded-md transition-all hover:scale-110 cursor-pointer",
                          getHeatColor(hourData.value)
                        )}
                        title={`${dayData.day} ${hourData.hour}: ${hourData.value}%`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t mt-4">
                <span className="text-xs text-muted-foreground">Low</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded bg-secondary/40" />
                  <div className="w-4 h-4 rounded bg-primary/60" />
                  <div className="w-4 h-4 rounded bg-warning/80" />
                  <div className="w-4 h-4 rounded bg-destructive/80" />
                </div>
                <span className="text-xs text-muted-foreground">High</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Comparison Chart */}
      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-secondary via-primary to-warning" />
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <BarChart3 className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-lg">Week-over-Week Comparison</CardTitle>
              <p className="text-sm text-muted-foreground">Average occupancy compared to previous week</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                }} 
              />
              <Bar dataKey="current" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="This Week" />
              <Line type="monotone" dataKey="previous" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Last Week" />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span className="text-xs text-muted-foreground">This Week</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-muted-foreground" style={{ borderStyle: 'dashed' }} />
              <span className="text-xs text-muted-foreground">Previous Week</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Footer */}
      {criticalRooms.length > 0 && (
        <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-r from-destructive/5 via-card to-warning/5">
          <div className="h-1 bg-gradient-to-r from-destructive via-warning to-destructive" />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-destructive/10 rounded-2xl shrink-0">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold">Attention Required</h3>
                  <Badge variant="destructive">{criticalRooms.length} Zone{criticalRooms.length !== 1 ? 's' : ''}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {criticalRooms.map(room => (
                    <div 
                      key={room.name}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-destructive/20"
                    >
                      <Wifi className="h-3.5 w-3.5 text-destructive animate-pulse" />
                      <span className="text-sm font-medium">{room.name}</span>
                      <span className="text-xs text-muted-foreground">({room.capacity}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {criticalRooms.length === 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-success/5 via-card to-success/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-3 text-success">
              <Zap className="h-5 w-5" />
              <span className="font-medium">All zones operating optimally</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
