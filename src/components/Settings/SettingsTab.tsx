import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettings from "./GeneralSettings";
import GatewayConfigTab from "./GatewayConfigTab";
import RoomConfigTab from "./RoomConfigTab";

export default function SettingsTab() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">Configure your system preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="gateway">Gateway Config</TabsTrigger>
          <TabsTrigger value="room">Room Config</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="gateway" className="mt-6">
          <GatewayConfigTab />
        </TabsContent>

        <TabsContent value="room" className="mt-6">
          <RoomConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
