import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, MapPin, Undo2 } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

export default function RoomConfigTab() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [isRoomComplete, setIsRoomComplete] = useState(false);
  const { toast } = useToast();

  const CLOSE_THRESHOLD = 15; // pixels - distance to close the polygon

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isRoomComplete) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking near the starting point to close the room
    if (roomPoints.length >= 3) {
      const firstPoint = roomPoints[0];
      const distance = Math.sqrt(
        Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2)
      );

      if (distance <= CLOSE_THRESHOLD) {
        setIsRoomComplete(true);
        toast({
          title: "Room completed!",
          description: `Room outline created with ${roomPoints.length} points.`,
        });
        return;
      }
    }

    // Add new point
    setRoomPoints([...roomPoints, { x, y }]);
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setRoomPoints([]);
    setIsRoomComplete(false);
  };

  const undoLastPoint = () => {
    if (roomPoints.length > 0) {
      setRoomPoints(roomPoints.slice(0, -1));
    }
  };

  const resetRoom = () => {
    setIsDrawing(false);
    setRoomPoints([]);
    setIsRoomComplete(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground">Room Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Draw your room outline by clicking points. Connect back to the start to complete.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Drawing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border-2 ${
                isDrawing ? "border-primary bg-primary/5" : "border-border bg-muted/30"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {isRoomComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                  )}
                  <span className="font-medium">Click to add points</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Click on the canvas to define room corners
                </p>
              </div>

              <div className={`p-3 rounded-lg border-2 ${
                roomPoints.length >= 3 && !isRoomComplete ? "border-primary bg-primary/5" : "border-border bg-muted/30"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {isRoomComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                  )}
                  <span className="font-medium">Close the room</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Click near the starting point to complete the room (min 3 points)
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              {!isDrawing && !isRoomComplete && (
                <Button onClick={startDrawing} className="w-full">
                  Start Drawing Room
                </Button>
              )}

              {isDrawing && !isRoomComplete && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={undoLastPoint} 
                    disabled={roomPoints.length === 0}
                    className="w-full gap-2"
                  >
                    <Undo2 className="h-4 w-4" />
                    Undo Last Point
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={resetRoom}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </>
              )}

              {isRoomComplete && (
                <Button 
                  variant="outline" 
                  onClick={resetRoom}
                  className="w-full"
                >
                  Draw New Room
                </Button>
              )}
            </div>

            {isDrawing && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Points added:</span>
                  <Badge variant="secondary">{roomPoints.length}</Badge>
                </div>
                {roomPoints.length >= 3 && !isRoomComplete && (
                  <p className="text-xs text-primary mt-2">
                    Click near the starting point (green) to complete the room
                  </p>
                )}
              </div>
            )}

            {isRoomComplete && (
              <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium text-success">Room completed!</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Room outline created with {roomPoints.length} points
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <Card>
          <CardHeader>
            <CardTitle>Room Canvas</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className={`relative w-full h-96 bg-muted/30 border-2 rounded-lg overflow-hidden ${
                isDrawing && !isRoomComplete ? "cursor-crosshair border-primary" : "border-border"
              }`}
              onClick={handleCanvasClick}
            >
              {/* SVG for drawing lines and polygon */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Draw lines between consecutive points */}
                {roomPoints.map((point, index) => {
                  if (index === 0) return null;
                  const prevPoint = roomPoints[index - 1];
                  return (
                    <line
                      key={`line-${index}`}
                      x1={prevPoint.x}
                      y1={prevPoint.y}
                      x2={point.x}
                      y2={point.y}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Draw completed polygon */}
                {isRoomComplete && roomPoints.length > 0 && (
                  <polygon
                    points={roomPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="hsl(var(--primary) / 0.1)"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                  />
                )}
              </svg>

              {/* Draw points */}
              {roomPoints.map((point, index) => (
                <div
                  key={`point-${index}`}
                  className={`absolute rounded-full -translate-x-2 -translate-y-2 border-2 border-background shadow-lg ${
                    index === 0 ? "w-5 h-5 bg-success" : "w-4 h-4 bg-primary"
                  }`}
                  style={{ left: point.x, top: point.y }}
                >
                  {index === 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-success whitespace-nowrap">
                      Start
                    </div>
                  )}
                </div>
              ))}

              {/* Hover indicator for closing */}
              {isDrawing && roomPoints.length >= 3 && !isRoomComplete && (
                <div
                  className="absolute w-8 h-8 rounded-full border-2 border-success border-dashed -translate-x-4 -translate-y-4 pointer-events-none"
                  style={{ left: roomPoints[0].x, top: roomPoints[0].y }}
                />
              )}

              {/* Empty state */}
              {!isDrawing && !isRoomComplete && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Click "Start Drawing Room" to begin</p>
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
