import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  Clock, 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  PieChartIcon,
  Play,
  Pause
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";

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

export default function AnalyticsTab() {
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  const [selectedFromDay, setSelectedFromDay] = useState<Date>(new Date());
  const [selectedToDay, setSelectedToDay] = useState<Date>(new Date());
  const [fromTime, setFromTime] = useState({ hours: 8, minutes: 0 });
  const [toTime, setToTime] = useState({ hours: 18, minutes: 0 });
  const [sliderValue, setSliderValue] = useState([0]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Calculate total 1-hour intervals between from and to time
  const totalIntervals = useMemo(() => {
    const fromMinutes = fromTime.hours * 60 + fromTime.minutes;
    const toMinutes = toTime.hours * 60 + toTime.minutes;
    return Math.max(0, Math.floor((toMinutes - fromMinutes) / 60));
  }, [fromTime, toTime]);

  // Calculate current time based on slider position
  const currentTime = useMemo(() => {
    const fromMinutes = fromTime.hours * 60 + fromTime.minutes;
    const currentMinutes = fromMinutes + (sliderValue[0] * 60);
    return {
      hours: Math.floor(currentMinutes / 60) % 24,
      minutes: currentMinutes % 60
    };
  }, [sliderValue, fromTime]);

  // Generate data based on current slider position
  const roomData = useMemo(() => generateRoomData(sliderValue[0]), [sliderValue]);
  const pieData = useMemo(() => generatePieData(roomData), [roomData]);
  const trendData = useMemo(() => generateTrendData(), []);

  const totalPatients = pieData[0]?.value || 0;
  const totalStaff = pieData[1]?.value || 0;
  const totalAssets = pieData[2]?.value || 0;
  const avgOccupancy = Math.round((totalPatients / (totalPatients + 10)) * 100);

  const crowdedRooms = roomData.filter(room => room.patients >= 4 || room.nurses >= 3);

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

      {/* Timeline Control Card */}
      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-secondary to-warning" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Historical Timeline</CardTitle>
                <CardDescription>Analyze data across different time periods</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {String(currentTime.hours).padStart(2, '0')}:{String(currentTime.minutes).padStart(2, '0')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Compact Date/Time Range */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11 border-dashed hover:border-primary hover:bg-primary/5",
                    !fromDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-muted-foreground">From</span>
                    <span className="text-xs">{fromDate ? format(fromDate, "MMM dd") : "Pick date"}</span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={(date) => date && setFromDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11 border-dashed hover:border-primary hover:bg-primary/5",
                    !toDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-muted-foreground">To</span>
                    <span className="text-xs">{toDate ? format(toDate, "MMM dd") : "Pick date"}</span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={(date) => date && setToDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-11 border-dashed hover:border-secondary hover:bg-secondary/5">
                  <Clock className="mr-2 h-4 w-4 text-secondary" />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-muted-foreground">Start Time</span>
                    <span className="text-xs">{String(fromTime.hours).padStart(2, '0')}:{String(fromTime.minutes).padStart(2, '0')}</span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Select Time</Label>
                  <div className="flex gap-2">
                    <select
                      value={fromTime.hours}
                      onChange={(e) => setFromTime({ ...fromTime, hours: parseInt(e.target.value) })}
                      className="flex-1 p-2 text-sm border rounded-md bg-background"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <span className="flex items-center text-muted-foreground">:</span>
                    <select
                      value={fromTime.minutes}
                      onChange={(e) => setFromTime({ ...fromTime, minutes: parseInt(e.target.value) })}
                      className="flex-1 p-2 text-sm border rounded-md bg-background"
                    >
                      {[0, 15, 30, 45].map((min) => (
                        <option key={min} value={min}>{String(min).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-11 border-dashed hover:border-secondary hover:bg-secondary/5">
                  <Clock className="mr-2 h-4 w-4 text-secondary" />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-muted-foreground">End Time</span>
                    <span className="text-xs">{String(toTime.hours).padStart(2, '0')}:{String(toTime.minutes).padStart(2, '0')}</span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Select Time</Label>
                  <div className="flex gap-2">
                    <select
                      value={toTime.hours}
                      onChange={(e) => setToTime({ ...toTime, hours: parseInt(e.target.value) })}
                      className="flex-1 p-2 text-sm border rounded-md bg-background"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <span className="flex items-center text-muted-foreground">:</span>
                    <select
                      value={toTime.minutes}
                      onChange={(e) => setToTime({ ...toTime, minutes: parseInt(e.target.value) })}
                      className="flex-1 p-2 text-sm border rounded-md bg-background"
                    >
                      {[0, 15, 30, 45].map((min) => (
                        <option key={min} value={min}>{String(min).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Enhanced Time Slider */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </Button>
              <div className="flex-1">
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={totalIntervals}
                  step={1}
                  className="w-full"
                  disabled={totalIntervals === 0}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-12">
              <span>{String(fromTime.hours).padStart(2, '0')}:{String(fromTime.minutes).padStart(2, '0')}</span>
              <span className="text-primary font-medium">
                Current: {String(currentTime.hours).padStart(2, '0')}:{String(currentTime.minutes).padStart(2, '0')}
              </span>
              <span>{String(toTime.hours).padStart(2, '0')}:{String(toTime.minutes).padStart(2, '0')}</span>
            </div>
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
