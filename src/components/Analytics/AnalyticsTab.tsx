import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Shield,
  Wifi
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, RadialBarChart, RadialBar } from "recharts";

// Generate dynamic room data
const generateRoomData = () => {
  return [
    { name: "ICU-101", patients: 3, staff: 4, assets: 6, capacity: 85, status: "high" },
    { name: "ICU-102", patients: 2, staff: 3, assets: 4, capacity: 60, status: "normal" },
    { name: "General-205", patients: 4, staff: 3, assets: 7, capacity: 75, status: "moderate" },
    { name: "Ward-A", patients: 5, staff: 4, assets: 8, capacity: 90, status: "critical" },
    { name: "Ward-B", patients: 2, staff: 2, assets: 5, capacity: 45, status: "low" },
    { name: "ER-Main", patients: 6, staff: 5, assets: 10, capacity: 95, status: "critical" },
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

export default function AnalyticsTab() {
  const [activeMetric, setActiveMetric] = useState<"patients" | "staff" | "assets">("patients");
  
  const roomData = useMemo(() => generateRoomData(), []);
  const trendData = useMemo(() => generateTrendData(), []);
  
  const totalPatients = roomData.reduce((sum, room) => sum + room.patients, 0);
  const totalStaff = roomData.reduce((sum, room) => sum + room.staff, 0);
  const totalAssets = roomData.reduce((sum, room) => sum + room.assets, 0);
  const avgOccupancy = Math.round(roomData.reduce((sum, room) => sum + room.capacity, 0) / roomData.length);
  
  const criticalRooms = roomData.filter(room => room.status === "critical" || room.status === "high");
  
  const pieData = [
    { name: "Patients", value: totalPatients, fill: "hsl(var(--primary))" },
    { name: "Staff", value: totalStaff, fill: "hsl(var(--secondary))" },
    { name: "Assets", value: totalAssets, fill: "hsl(var(--warning))" },
  ];

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

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/5 to-warning/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -ml-24 -mb-24" />
        
        <div className="relative flex items-start justify-between flex-wrap gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-2xl backdrop-blur-sm">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">AI Analytics</h1>
                <p className="text-muted-foreground">Intelligent insights & real-time monitoring</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className="bg-success/20 text-success border-success/30 px-4 py-2 text-sm gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              Live Monitoring
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm gap-2">
              <Clock className="h-3.5 w-3.5" />
              Updated just now
            </Badge>
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

      {/* Occupancy Gauge + Quick Stats */}
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
                  <p className="text-sm text-muted-foreground">Today's movement patterns</p>
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

      {/* Room Status Grid */}
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

        {/* Distribution Chart */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">Category breakdown</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 w-full mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
