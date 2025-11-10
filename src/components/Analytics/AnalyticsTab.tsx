import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const roomData = [
  { name: "ICU-101", patients: 2, nurses: 3 },
  { name: "ICU-102", patients: 1, nurses: 2 },
  { name: "General-205", patients: 3, nurses: 2 },
  { name: "Ward-A", patients: 4, nurses: 3 },
  { name: "Ward-B", patients: 2, nurses: 2 },
];

const pieData = [
  { name: "Patients", value: 12, color: "hsl(var(--primary))" },
  { name: "Nurses", value: 12, color: "hsl(var(--secondary))" },
];

export default function AnalyticsTab() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState({ hours: 12, minutes: 0 });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">AI Analytics</h2>
        <p className="text-muted-foreground mt-1">Crowd analysis and occupancy insights</p>
      </div>

      {/* Date and Time Picker */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Historical Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Date Picker */}
            <div className="flex-1 space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div className="flex-1 space-y-2">
              <Label>Select Time</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="mr-2 h-4 w-4" />
                      {String(selectedTime.hours).padStart(2, '0')}:{String(selectedTime.minutes).padStart(2, '0')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Hours</Label>
                        <select
                          value={selectedTime.hours}
                          onChange={(e) => setSelectedTime({ ...selectedTime, hours: parseInt(e.target.value) })}
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
                          value={selectedTime.minutes}
                          onChange={(e) => setSelectedTime({ ...selectedTime, minutes: parseInt(e.target.value) })}
                          className="w-full p-2 border rounded-md bg-background"
                        >
                          {Array.from({ length: 60 }, (_, i) => (
                            <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Viewing data for: {format(selectedDate, "PPP")} at {String(selectedTime.hours).padStart(2, '0')}:{String(selectedTime.minutes).padStart(2, '0')}
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
                <span className="text-sm">Patients: 12</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-secondary" />
                <span className="text-sm">Nurses: 12</span>
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
            <p className="text-sm">
              <strong>Ward-A</strong> has high occupancy (4 patients, 3 nurses)
            </p>
            <p className="text-sm text-muted-foreground">
              Consider redistributing staff if needed
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
