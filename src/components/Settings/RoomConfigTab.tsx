import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Undo2, Upload, Trash2, Edit, Ruler } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Point {
  x: number;
  y: number;
}

interface RoomData {
  id: string;
  name: string;
  floorPlanName: string;
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
  const [floorPlanName, setFloorPlanName] = useState<string>("");
  const [floorPlanWidth, setFloorPlanWidth] = useState<string>("");
  const [floorPlanHeight, setFloorPlanHeight] = useState<string>("");
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [savedRooms, setSavedRooms] = useState<RoomData[]>([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [clickedPointIndex, setClickedPointIndex] = useState<number | null>(null);
  const [showRoomNameDialog, setShowRoomNameDialog] = useState(false);
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
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isRoomComplete) return;

    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;

    // Check if clicking near an existing point
    let nearPointIndex = -1;
    for (let i = 0; i < roomPoints.length; i++) {
      const point = roomPoints[i];
      const distance = Math.sqrt(
        Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
      );
      if (distance <= 10) {
        nearPointIndex = i;
        break;
      }
    }

    if (nearPointIndex >= 0) {
      // Double-click detection (within 300ms)
      if (timeDiff < 300 && clickedPointIndex === nearPointIndex) {
        // Double-click: delete the point
        const newPoints = roomPoints.filter((_, index) => index !== nearPointIndex);
        setRoomPoints(newPoints);
        setSelectedPointIndex(null);
        setClickedPointIndex(null);
        toast({
          title: "Point deleted",
          description: "Double-clicked point has been removed.",
        });
        return;
      } else {
        // Single click: select the point
        setSelectedPointIndex(nearPointIndex);
        setClickedPointIndex(nearPointIndex);
        setLastClickTime(currentTime);
        return;
      }
    }

    setLastClickTime(currentTime);
    setClickedPointIndex(null);

    // Check if clicking near the starting point to close the room
    if (roomPoints.length >= 3) {
      const firstPoint = roomPoints[0];
      const distance = Math.sqrt(
        Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2)
      );

      if (distance <= CLOSE_THRESHOLD) {
        setIsRoomComplete(true);
        setShowRoomNameDialog(true);
        return;
      } else if (distance <= CLOSE_THRESHOLD + 20) {
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
    setEditingRoomId(null);
    setShowRoomNameDialog(false);
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
    if (!isRoomComplete || !floorPlanWidth || !floorPlanHeight || !roomName.trim() || !floorPlanName.trim()) {
      toast({
        title: "Cannot save",
        description: "Please complete all fields including room name.",
        variant: "destructive",
      });
      return;
    }

    const roomData: RoomData = {
      id: editingRoomId || Date.now().toString(),
      name: roomName.trim(),
      floorPlanName: floorPlanName.trim(),
      points: roomPoints,
      floorPlanWidth: parseFloat(floorPlanWidth),
      floorPlanHeight: parseFloat(floorPlanHeight),
      imageUrl: floorPlanImage,
      canvasWidth: canvasDimensions.width,
      canvasHeight: canvasDimensions.height,
    };

    let updatedRooms: RoomData[];
    if (editingRoomId) {
      updatedRooms = savedRooms.map(room => room.id === editingRoomId ? roomData : room);
      toast({
        title: "Room updated!",
        description: `"${roomName}" has been updated.`,
      });
    } else {
      updatedRooms = [...savedRooms, roomData];
      toast({
        title: "Room saved!",
        description: `"${roomName}" has been saved successfully.`,
      });
    }

    setSavedRooms(updatedRooms);
    localStorage.setItem('roomConfigurations', JSON.stringify(updatedRooms));
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

  const editRoom = (room: RoomData) => {
    setEditingRoomId(room.id);
    setRoomName(room.name);
    setFloorPlanName(room.floorPlanName);
    setFloorPlanWidth(room.floorPlanWidth.toString());
    setFloorPlanHeight(room.floorPlanHeight.toString());
    setFloorPlanImage(room.imageUrl);
    setRoomPoints(room.points);
    setIsDrawing(true);
    setIsRoomComplete(true);
    setCanvasDimensions({ width: room.canvasWidth, height: room.canvasHeight });
    toast({
      title: "Editing room",
      description: `Editing "${room.name}". Modify and save when ready.`,
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
              <Label htmlFor="floor-plan-name">Floor Plan Name</Label>
              <Input
                id="floor-plan-name"
                placeholder="e.g., Building A - Floor 1"
                value={floorPlanName}
                onChange={(e) => setFloorPlanName(e.target.value)}
              />
            </div>

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

            <div className="space-y-2 pt-4">
              {!isDrawing && !isRoomComplete && (
                <Button onClick={startDrawing} className="w-full" disabled={!floorPlanImage || !floorPlanWidth || !floorPlanHeight}>
                  Start Drawing Room
                </Button>
              )}

              {isDrawing && !isRoomComplete && (
                <div className="space-y-2">
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
                </div>
              )}

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
                  <p className="text-xs text-muted-foreground mt-2">
                    Tip: Double-click any point to delete it
                  </p>
                </div>
              )}
            </div>
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
              onLoad={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setCanvasDimensions({ width: rect.width, height: rect.height });
              }}
            >
              {/* Background floor plan image */}
              {floorPlanImage && (
                <img
                  src={floorPlanImage}
                  alt="Floor plan"
                  className="absolute inset-0 w-full h-full object-contain opacity-50 pointer-events-none"
                />
              )}

              {/* SVG layer for lines and shapes */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 1 }}
              >
                {/* Draw saved rooms */}
                {savedRooms.map((room, roomIndex) => {
                  const hue = (roomIndex * 137.5) % 360;
                  return (
                    <g key={room.id}>
                      <polygon
                        points={room.points.map(p => `${p.x},${p.y}`).join(' ')}
                        fill={`hsla(${hue}, 70%, 50%, 0.1)`}
                        stroke={`hsl(${hue}, 70%, 45%)`}
                        strokeWidth="2"
                      />
                      {/* Room label */}
                      {room.points.length > 0 && (
                        <text
                          x={room.points.reduce((sum, p) => sum + p.x, 0) / room.points.length}
                          y={room.points.reduce((sum, p) => sum + p.y, 0) / room.points.length}
                          fill={`hsl(${hue}, 70%, 35%)`}
                          fontSize="14"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="pointer-events-none drop-shadow-lg"
                        >
                          {room.name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Draw lines between consecutive points for current room */}
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
                      strokeWidth="3"
                      className="drop-shadow-lg"
                    />
                  );
                })}

                {/* Draw completed polygon for current room */}
                {isRoomComplete && roomPoints.length > 0 && (
                  <polygon
                    points={roomPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="hsl(var(--primary) / 0.2)"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    className="drop-shadow-lg"
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
              {!isDrawing && !isRoomComplete && savedRooms.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Click "Start Drawing Room" to begin</p>
                  </div>
                </div>
              )}

              {/* Info for saved rooms */}
              {!isDrawing && !isRoomComplete && savedRooms.length > 0 && (
                <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 border border-border shadow-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{savedRooms.length} room{savedRooms.length > 1 ? 's' : ''} saved</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Start Drawing Room" to add another
                  </p>
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
                    className="p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-lg">{room.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Floor Plan: {room.floorPlanName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => editRoom(room)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setDeleteRoomId(room.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{room.points.length} points</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{room.floorPlanWidth}m × {room.floorPlanHeight}m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Room Name Dialog */}
      <Dialog open={showRoomNameDialog} onOpenChange={(open) => {
        if (!open) {
          resetRoom();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Room Name</DialogTitle>
            <DialogDescription>
              Room outline completed with {roomPoints.length} points. Please enter a name for this room.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-room-name">Room Name</Label>
              <Input
                id="dialog-room-name"
                placeholder="e.g., Living Room, Ward A, ICU"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && roomName.trim()) {
                    saveRoomData();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetRoom}>
              Cancel
            </Button>
            <Button onClick={saveRoomData} disabled={!roomName.trim()}>
              Save Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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