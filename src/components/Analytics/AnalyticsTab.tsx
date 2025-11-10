import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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
  const [timeValue, setTimeValue] = useState([50]);
  const currentDate = new Date();
  const hours = Math.floor((timeValue[0] / 100) * 24);
  const minutes = Math.floor(((timeValue[0] / 100) * 24 - hours) * 60);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">AI Analytics</h2>
        <p className="text-muted-foreground mt-1">Crowd analysis and occupancy insights</p>
      </div>

      {/* Timeline Slider */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Historical Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Selected Time: {currentDate.toLocaleDateString()} {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
            </Label>
            <div className="text-sm text-muted-foreground">
              Drag to view historical data
            </div>
          </div>
          <Slider
            value={timeValue}
            onValueChange={setTimeValue}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
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
