import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Ruler, CheckCircle2, MapPin } from "lucide-react";

export default function RoomConfigTab() {
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [point1, setPoint1] = useState<{x: number, y: number} | null>(null);
  const [point2, setPoint2] = useState<{x: number, y: number} | null>(null);
  const [realDistance, setRealDistance] = useState("");
  const [pixelDistance, setPixelDistance] = useState(0);
  const { toast } = useToast();

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (calibrationStep === 1 && !point1) {
      setPoint1({x, y});
      setCalibrationStep(2);
    } else if (calibrationStep === 2 && !point2 && point1) {
      setPoint2({x, y});
      const distance = Math.sqrt(Math.pow(x - point1.x, 2) + Math.pow(y - point1.y, 2));
      setPixelDistance(Math.round(distance));
      setCalibrationStep(3);
    }
  };

  const handleSubmitCalibration = () => {
    if (!realDistance) return;
    
    const ratio = parseFloat(realDistance) / pixelDistance;
    toast({
      title: "Calibration successful!",
      description: `Pixel-to-meter scale set: ${ratio.toFixed(2)} px/m`,
    });
    
    // Reset
    setCalibrationStep(0);
    setPoint1(null);
    setPoint2(null);
    setRealDistance("");
    setPixelDistance(0);
  };

  const startCalibration = () => {
    setCalibrationStep(1);
    setPoint1(null);
    setPoint2(null);
    setRealDistance("");
    setPixelDistance(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground">Room Calibration</h3>
        <p className="text-sm text-muted-foreground">
          Calibrate the pixel-to-meter scale for accurate positioning
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calibration Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-primary" />
              Calibration Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`p-3 rounded-lg border-2 ${
              calibrationStep >= 1 ? "border-primary bg-primary/5" : "border-border bg-muted/30"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {calibrationStep > 1 ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                )}
                <span className="font-medium">Click first point</span>
              </div>
              <p className="text-sm text-muted-foreground ml-7">
                Click on a known location in the room layout
              </p>
            </div>

            <div className={`p-3 rounded-lg border-2 ${
              calibrationStep >= 2 ? "border-primary bg-primary/5" : "border-border bg-muted/30"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {calibrationStep > 2 ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                )}
                <span className="font-medium">Click second point</span>
              </div>
              <p className="text-sm text-muted-foreground ml-7">
                Click on another known location
              </p>
            </div>

            <div className={`p-3 rounded-lg border-2 ${
              calibrationStep === 3 ? "border-primary bg-primary/5" : "border-border bg-muted/30"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span className="font-medium">Enter real distance</span>
              </div>
              <p className="text-sm text-muted-foreground ml-7">
                Input the actual distance in meters
              </p>
            </div>

            {calibrationStep === 0 && (
              <Button onClick={startCalibration} className="w-full mt-4">
                Start Calibration
              </Button>
            )}

            {calibrationStep === 3 && (
              <div className="space-y-3 mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label>Pixel distance</Label>
                  <div className="flex items-center gap-2">
                    <Input value={`${pixelDistance} px`} disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="realDistance">Real distance (meters)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="realDistance"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 6.8"
                      value={realDistance}
                      onChange={(e) => setRealDistance(e.target.value)}
                    />
                    <Button 
                      onClick={handleSubmitCalibration}
                      disabled={!realDistance}
                    >
                      Save
                    </Button>
                  </div>
                </div>

                {realDistance && (
                  <div className="text-sm text-muted-foreground">
                    New ratio: <strong>{(parseFloat(realDistance) / pixelDistance).toFixed(2)} px/m</strong>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <Card>
          <CardHeader>
            <CardTitle>Room Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="relative w-full h-96 bg-muted/30 border-2 border-dashed border-border rounded-lg cursor-crosshair overflow-hidden"
              onClick={handleCanvasClick}
            >
              {/* Sample room elements */}
              <div className="absolute top-8 left-8 w-32 h-24 bg-card border border-border rounded-lg" />
              <div className="absolute top-8 right-8 w-32 h-24 bg-card border border-border rounded-lg" />
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-card border border-border rounded-lg" />

              {/* Point 1 */}
              {point1 && (
                <div 
                  className="absolute w-4 h-4 bg-primary rounded-full -translate-x-2 -translate-y-2 border-2 border-background shadow-lg"
                  style={{left: point1.x, top: point1.y}}
                />
              )}

              {/* Point 2 */}
              {point2 && (
                <div 
                  className="absolute w-4 h-4 bg-primary rounded-full -translate-x-2 -translate-y-2 border-2 border-background shadow-lg"
                  style={{left: point2.x, top: point2.y}}
                />
              )}

              {/* Line between points */}
              {point1 && point2 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line 
                    x1={point1.x} 
                    y1={point1.y} 
                    x2={point2.x} 
                    y2={point2.y} 
                    stroke="hsl(var(--primary))" 
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </svg>
              )}

              {calibrationStep === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Click "Start Calibration" to begin</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
