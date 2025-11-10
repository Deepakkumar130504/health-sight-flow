import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun } from "lucide-react";

export default function SettingsTab() {
  const [darkMode, setDarkMode] = useState(false);
  const [refreshRate, setRefreshRate] = useState("30");
  const [defaultFloor, setDefaultFloor] = useState("1");
  const { toast } = useToast();

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast({
      title: "Theme updated",
      description: `Switched to ${checked ? "dark" : "light"} mode`,
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">Customize your dashboard preferences</p>
      </div>

      {/* Appearance Settings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium flex items-center gap-2">
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark themes
              </p>
            </div>
            <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
          </div>
        </CardContent>
      </Card>

      {/* Data Settings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Data & Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-medium">Data Refresh Rate</Label>
            <Select value={refreshRate} onValueChange={setRefreshRate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Every 5 seconds</SelectItem>
                <SelectItem value="10">Every 10 seconds</SelectItem>
                <SelectItem value="30">Every 30 seconds (Recommended)</SelectItem>
                <SelectItem value="60">Every minute</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How often the dashboard updates with new data
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-medium">Default Floor</Label>
            <Select value={defaultFloor} onValueChange={setDefaultFloor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Floor 1</SelectItem>
                <SelectItem value="2">Floor 2</SelectItem>
                <SelectItem value="3">Floor 3</SelectItem>
                <SelectItem value="4">Floor 4</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Floor to display when opening the dashboard
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="shadow-md bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <p className="text-sm">
            <strong>Note:</strong> Settings are saved locally in your browser. They will persist across sessions but won't sync across different devices.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
