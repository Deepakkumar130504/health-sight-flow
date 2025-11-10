import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download, FileText, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ExportTab() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { toast } = useToast();

  const handleExport = (exportFormat: "csv" | "pdf") => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Export started",
      description: `Generating ${exportFormat.toUpperCase()} report for ${format(startDate, "PPP")} to ${format(endDate, "PPP")}`,
    });

    // Simulate export
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: `Your ${exportFormat.toUpperCase()} report is ready for download`,
      });
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Data Export</h2>
        <p className="text-muted-foreground mt-1">Export patient movement and room occupancy reports</p>
      </div>

      {/* Date Selection */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Select Time Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Date Range Summary */}
          {startDate && endDate && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">Selected Range:</p>
              <p className="text-sm text-muted-foreground mt-1">
                {format(startDate, "PPP")} - {format(endDate, "PPP")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Export Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleExport("csv")}
              className="h-24 flex flex-col gap-2"
              variant="outline"
            >
              <FileSpreadsheet className="h-8 w-8" />
              <span className="font-semibold">Export as CSV</span>
              <span className="text-xs text-muted-foreground">Spreadsheet format</span>
            </Button>

            <Button
              onClick={() => handleExport("pdf")}
              className="h-24 flex flex-col gap-2"
              variant="outline"
            >
              <FileText className="h-8 w-8" />
              <span className="font-semibold">Export as PDF</span>
              <span className="text-xs text-muted-foreground">Document format</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Contents Info */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Report Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Patient movements and location history
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Room occupancy statistics over time
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Device activity and signal strength data
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Staff presence and coverage metrics
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
