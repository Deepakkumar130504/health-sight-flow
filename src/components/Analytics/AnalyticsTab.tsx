import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock data generator based on time
const generateRoomData = (timeIndex: number) => {
  const variation = Math.sin(timeIndex / 10) * 2;
  return [
    { name: "ICU-101", patients: Math.max(1, Math.round(2 + variation)), nurses: Math.max(1, Math.round(3 + variation * 0.5)) },
    { name: "ICU-102", patients: Math.max(1, Math.round(1 + variation * 0.8)), nurses: Math.max(1, Math.round(2 + variation * 0.3)) },
    { name: "General-205", patients: Math.max(1, Math.round(3 + variation * 1.2)), nurses: Math.max(1, Math.round(2 + variation * 0.7)) },
    { name: "Ward-A", patients: Math.max(1, Math.round(4 - variation)), nurses: Math.max(1, Math.round(3 - variation * 0.4)) },
    { name: "Ward-B", patients: Math.max(1, Math.round(2 + variation * 0.5)), nurses: Math.max(1, Math.round(2 + variation * 0.6)) },
  ];
};

const generatePieData = (roomData: any[]) => {
  const totalPatients = roomData.reduce((sum, room) => sum + room.patients, 0);
  const totalNurses = roomData.reduce((sum, room) => sum + room.nurses, 0);
  return [
    { name: "Patients", value: totalPatients, color: "hsl(var(--primary))" },
    { name: "Nurses", value: totalNurses, color: "hsl(var(--secondary))" },
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">AI Analytics</h2>
        <p className="text-muted-foreground mt-1">Crowd analysis and occupancy insights</p>
      </div>

      {/* Date and Time Range Picker */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Historical Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
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
            </div>
            
            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
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
            </div>
          </div>

          {/* Time Range Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* From Time */}
            <div className="space-y-2">
              <Label>From Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    {format(selectedFromDay, "MMM dd")} - {String(fromTime.hours).padStart(2, '0')}:{String(fromTime.minutes).padStart(2, '0')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Day</Label>
                      <Calendar
                        mode="single"
                        selected={selectedFromDay}
                        onSelect={(date) => date && setSelectedFromDay(date)}
                        disabled={(date) => date < fromDate || date > toDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hours</Label>
                      <select
                        value={fromTime.hours}
                        onChange={(e) => setFromTime({ ...fromTime, hours: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Minutes</Label>
                      <select
                        value={fromTime.minutes}
                        onChange={(e) => setFromTime({ ...fromTime, minutes: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((min) => (
                          <option key={min} value={min}>{String(min).padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* To Time */}
            <div className="space-y-2">
              <Label>To Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    {format(selectedToDay, "MMM dd")} - {String(toTime.hours).padStart(2, '0')}:{String(toTime.minutes).padStart(2, '0')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Day</Label>
                      <Calendar
                        mode="single"
                        selected={selectedToDay}
                        onSelect={(date) => date && setSelectedToDay(date)}
                        disabled={(date) => date < fromDate || date > toDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hours</Label>
                      <select
                        value={toTime.hours}
                        onChange={(e) => setToTime({ ...toTime, hours: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Minutes</Label>
                      <select
                        value={toTime.minutes}
                        onChange={(e) => setToTime({ ...toTime, minutes: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((min) => (
                          <option key={min} value={min}>{String(min).padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Time Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Current Time: {String(currentTime.hours).padStart(2, '0')}:{String(currentTime.minutes).padStart(2, '0')}
              </Label>
              <div className="text-sm text-muted-foreground">
                Drag to view data at different times (1-hour intervals)
              </div>
            </div>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={totalIntervals}
              step={1}
              className="w-full"
              disabled={totalIntervals === 0}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{String(fromTime.hours).padStart(2, '0')}:{String(fromTime.minutes).padStart(2, '0')}</span>
              <span>{String(toTime.hours).padStart(2, '0')}:{String(toTime.minutes).padStart(2, '0')}</span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <strong>Viewing data for:</strong> {format(selectedFromDay, "PPP")} at {String(fromTime.hours).padStart(2, '0')}:{String(fromTime.minutes).padStart(2, '0')} to {format(selectedToDay, "PPP")} at {String(currentTime.hours).padStart(2, '0')}:{String(currentTime.minutes).padStart(2, '0')}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Distribution by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary" />
                <span className="text-sm">Patients: {pieData[0]?.value || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-secondary" />
                <span className="text-sm">Nurses: {pieData[1]?.value || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Room Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="patients" fill="hsl(var(--primary))" name="Patients" />
                <Bar dataKey="nurses" fill="hsl(var(--secondary))" name="Nurses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Crowded Areas Alert */}
      <Card className="shadow-md border-warning/50 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-warning">⚠️</span> Crowd Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {roomData
              .filter(room => room.patients >= 4 || room.nurses >= 3)
              .map(room => (
                <div key={room.name}>
                  <p className="text-sm">
                    <strong>{room.name}</strong> has high occupancy ({room.patients} patients, {room.nurses} nurses)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Consider redistributing staff if needed
                  </p>
                </div>
              ))}
            {roomData.every(room => room.patients < 4 && room.nurses < 3) && (
              <p className="text-sm text-muted-foreground">No high occupancy alerts at this time</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
