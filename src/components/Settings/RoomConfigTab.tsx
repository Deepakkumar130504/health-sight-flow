import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, MapPin, Undo2, Upload, Save, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Point {
  x: number;
  y: number;
}

interface RoomData {
  id: string;
  name: string;
  points: Point[];
  floorPlanWidth: number;
  floorPlanHeight: number;
  imageUrl: string;
  canvasWidth: number;
  canvasHeight: number;
}

export default function RoomConfigTab() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [isRoomComplete, setIsRoomComplete] = useState(false);
  const [floorPlanImage, setFloorPlanImage] = useState<string>("");
  const [floorPlanWidth, setFloorPlanWidth] = useState<string>("");
  const [floorPlanHeight, setFloorPlanHeight] = useState<string>("");
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [savedRooms, setSavedRooms] = useState<RoomData[]>([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const { toast } = useToast();

  const CLOSE_THRESHOLD = 40; // pixels - distance to close the polygon

  useEffect(() => {
    loadSavedRooms();
  }, []);

  const loadSavedRooms = () => {
    const stored = localStorage.getItem('roomConfigurations');
    if (stored) {
      setSavedRooms(JSON.parse(stored));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFloorPlanImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isRoomComplete) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking near an existing point to select it
    for (let i = 0; i < roomPoints.length; i++) {
      const point = roomPoints[i];
      const distance = Math.sqrt(
        Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
      );
      if (distance <= 10) {
        setSelectedPointIndex(i);
        return;
      }
    }

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
          description: `Room outline created with ${roomPoints.length} points. Now enter a room name to save.`,
        });
        return;
      } else if (distance <= CLOSE_THRESHOLD + 20) {
        // Near but not close enough
        toast({
          title: "Almost there!",
          description: "Click closer to the green starting point to complete the room.",
          variant: "default",
        });
      }
    }

    // Add new point
    setRoomPoints([...roomPoints, { x, y }]);
    setSelectedPointIndex(null);
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
    setSelectedPointIndex(null);
    setRoomName("");
  };

  const deleteSelectedPoint = () => {
    if (selectedPointIndex !== null) {
      const newPoints = roomPoints.filter((_, index) => index !== selectedPointIndex);
      setRoomPoints(newPoints);
      setSelectedPointIndex(null);
      toast({
        title: "Point deleted",
        description: "Selected point has been removed.",
      });
    }
  };

  const saveRoomData = () => {
    if (!isRoomComplete || !floorPlanWidth || !floorPlanHeight || !roomName.trim()) {
      toast({
        title: "Cannot save",
        description: "Please complete the room, enter floor plan dimensions, and provide a room name.",
        variant: "destructive",
      });
      return;
    }

    const roomData: RoomData = {
      id: Date.now().toString(),
      name: roomName.trim(),
      points: roomPoints,
      floorPlanWidth: parseFloat(floorPlanWidth),
      floorPlanHeight: parseFloat(floorPlanHeight),
      imageUrl: floorPlanImage,
      canvasWidth: canvasDimensions.width,
      canvasHeight: canvasDimensions.height,
    };

    const updatedRooms = [...savedRooms, roomData];
    setSavedRooms(updatedRooms);
    localStorage.setItem('roomConfigurations', JSON.stringify(updatedRooms));
    
    toast({
      title: "Room saved!",
      description: `"${roomName}" saved with ${roomPoints.length} points.`,
    });

    resetRoom();
  };

  const deleteRoom = (roomId: string) => {
    const updatedRooms = savedRooms.filter(room => room.id !== roomId);
    setSavedRooms(updatedRooms);
    localStorage.setItem('roomConfigurations', JSON.stringify(updatedRooms));
    setDeleteRoomId(null);
    
    toast({
      title: "Room deleted",
      description: "Room has been removed.",
    });
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
        {/* Floor Plan Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Floor Plan Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="floor-plan">Upload Floor Plan</Label>
              <Input
                id="floor-plan"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Floor Width (meters)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 50"
                  value={floorPlanWidth}
                  onChange={(e) => setFloorPlanWidth(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Floor Height (meters)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 30"
                  value={floorPlanHeight}
                  onChange={(e) => setFloorPlanHeight(e.target.value)}
                />
              </div>
            </div>

            {floorPlanImage && floorPlanWidth && floorPlanHeight && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  Scale: {floorPlanWidth}m × {floorPlanHeight}m
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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
                    onClick={deleteSelectedPoint}
                    disabled={selectedPointIndex === null}
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected Point
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetRoom}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </>
              )}

              {isRoomComplete && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="room-name">Room Name</Label>
                    <Input
                      id="room-name"
                      placeholder="e.g., Ward A, ICU, Emergency"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={saveRoomData}
                    className="w-full gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Room Configuration
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetRoom}
                    className="w-full"
                  >
                    Draw New Room
                  </Button>
                </>
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
              ref={(el) => {
                if (el && canvasDimensions.width === 0) {
                  setCanvasDimensions({ width: el.offsetWidth, height: el.offsetHeight });
                }
              }}
            >
              {/* Background image */}
              {floorPlanImage && (
                <img 
                  src={floorPlanImage} 
                  alt="Floor plan" 
                  className="absolute inset-0 w-full h-full object-contain opacity-60"
                />
              )}
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
                  className={`absolute rounded-full -translate-x-2 -translate-y-2 border-2 shadow-lg cursor-pointer transition-all ${
                    selectedPointIndex === index 
                      ? "w-6 h-6 bg-destructive border-destructive scale-110" 
                      : index === 0 
                      ? "w-5 h-5 bg-success border-background" 
                      : "w-4 h-4 bg-primary border-background"
                  }`}
                  style={{ left: point.x, top: point.y }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPointIndex(index);
                  }}
                >
                  {index === 0 && selectedPointIndex !== index && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-success whitespace-nowrap">
                      Start
                    </div>
                  )}
                  {selectedPointIndex === index && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-destructive whitespace-nowrap">
                      Selected
                    </div>
                  )}
                </div>
              ))}

              {/* Hover indicator for closing */}
              {isDrawing && roomPoints.length >= 3 && !isRoomComplete && (
                <>
                  <div
                    className="absolute rounded-full border-2 border-success border-dashed -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse"
                    style={{ 
                      left: roomPoints[0].x, 
                      top: roomPoints[0].y,
                      width: CLOSE_THRESHOLD * 2,
                      height: CLOSE_THRESHOLD * 2,
                    }}
                  />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-success/90 text-success-foreground px-3 py-1 rounded text-xs font-semibold whitespace-nowrap pointer-events-none">
                    Click near green point to finish
                  </div>
                </>
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

        {/* Saved Rooms List */}
        {savedRooms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Saved Rooms ({savedRooms.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{room.name}</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>{room.points.length} points</span>
                        <span>{room.floorPlanWidth}m × {room.floorPlanHeight}m</span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setDeleteRoomId(room.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteRoomId !== null} onOpenChange={() => setDeleteRoomId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this room? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRoomId && deleteRoom(deleteRoomId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
