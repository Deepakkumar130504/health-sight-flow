import { useState } from "react";
import Layout from "@/components/Layout";
import DashboardTab from "@/components/Dashboard/DashboardTab";
import PatientConfigTab from "@/components/PatientConfig/PatientConfigTab";
import AnalyticsTab from "@/components/Analytics/AnalyticsTab";
import ExportTab from "@/components/Export/ExportTab";
import GatewayConfigTab from "@/components/Settings/GatewayConfigTab";
import RoomConfigTab from "@/components/Settings/RoomConfigTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "patients":
        return <PatientConfigTab />;
      case "analytics":
        return <AnalyticsTab />;
      case "export":
        return <ExportTab />;
      case "gateway":
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Gateway Configuration</h2>
              <p className="text-muted-foreground mt-1">Manage your network gateways</p>
            </div>
            <GatewayConfigTab />
          </div>
        );
      case "room":
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Room Configuration</h2>
              <p className="text-muted-foreground mt-1">Draw and manage room layouts</p>
            </div>
            <RoomConfigTab />
          </div>
        );
      default:
        return <DashboardTab />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="min-h-screen">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default Index;
