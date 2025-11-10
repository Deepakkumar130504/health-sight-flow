import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Save, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockPatients = [
  { id: "1", name: "John Smith", patientId: "P-2024-001", macAddress: "AA:BB:CC:DD:EE:01", room: "ICU-101", type: "patient" },
  { id: "2", name: "Emma Davis", patientId: "P-2024-002", macAddress: "AA:BB:CC:DD:EE:02", room: "General-205", type: "patient" },
  { id: "3", name: "Dr. Sarah Johnson", patientId: "PRV-001", macAddress: "AA:BB:CC:DD:EE:03", room: "Ward-A", type: "provider" },
  { id: "4", name: "Nurse Mike Chen", patientId: "PRV-002", macAddress: "AA:BB:CC:DD:EE:04", room: "ICU-103", type: "provider" },
];

export default function PatientConfigTab() {
  const [patients, setPatients] = useState(mockPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    patientId: "",
    macAddress: "",
    room: "",
    type: "patient"
  });

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.macAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (patient: any) => {
    setEditingId(patient.id);
    setEditData({ ...patient });
  };

  const handleSave = () => {
    setPatients(patients.map((p) => (p.id === editingId ? editData : p)));
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleAddPatient = () => {
    const id = (patients.length + 1).toString();
    const patient = { id, ...newPatient };
    setPatients([...patients, patient]);
    setNewPatient({
      name: "",
      patientId: "",
      macAddress: "",
      room: "",
      type: "patient"
    });
    setIsAddDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Patient Configuration</h2>
          <p className="text-muted-foreground mt-1">Manage device assignments and patient information</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, patient ID, or MAC address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Registered Devices ({filteredPatients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Patient/Provider ID</TableHead>
                <TableHead>MAC Address</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => {
                const isEditing = editingId === patient.id;
                
                return (
                  <TableRow key={patient.id}>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        <span className="font-medium">{patient.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.patientId}
                          onChange={(e) => setEditData({ ...editData, patientId: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        patient.patientId
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.macAddress}
                          onChange={(e) => setEditData({ ...editData, macAddress: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        <code className="text-sm bg-muted px-2 py-1 rounded">{patient.macAddress}</code>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.room}
                          onChange={(e) => setEditData({ ...editData, room: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        patient.room
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={patient.type === "patient" ? "default" : "secondary"}>
                        {patient.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="default" onClick={handleSave} className="h-8">
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel} className="h-8">
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(patient)} className="h-8">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Patient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient or provider information and device details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                placeholder="John Smith"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patientId">Patient/Provider ID</Label>
              <Input
                id="patientId"
                value={newPatient.patientId}
                onChange={(e) => setNewPatient({ ...newPatient, patientId: e.target.value })}
                placeholder="P-2024-005"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="macAddress">MAC Address</Label>
              <Input
                id="macAddress"
                value={newPatient.macAddress}
                onChange={(e) => setNewPatient({ ...newPatient, macAddress: e.target.value })}
                placeholder="AA:BB:CC:DD:EE:FF"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                value={newPatient.room}
                onChange={(e) => setNewPatient({ ...newPatient, room: e.target.value })}
                placeholder="ICU-101"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={newPatient.type} onValueChange={(value) => setNewPatient({ ...newPatient, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPatient}>Add Patient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
