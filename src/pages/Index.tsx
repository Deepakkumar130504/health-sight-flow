import { useState } from "react";
import Layout from "@/components/Layout";
import DashboardTab from "@/components/Dashboard/DashboardTab";
import PatientConfigTab from "@/components/PatientConfig/PatientConfigTab";
import AnalyticsTab from "@/components/Analytics/AnalyticsTab";
import ExportTab from "@/components/Export/ExportTab";
import SettingsTab from "@/components/Settings/SettingsTab";

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
      case "settings":
        return <SettingsTab />;
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
