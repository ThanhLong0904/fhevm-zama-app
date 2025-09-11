"use client";
import { DashboardPage } from "@/components/DashboardPage";

export default function Dashboard() {
  const handleNavigate = (page: string, data?: { roomId?: string }) => {
    switch (page) {
      case "home":
        window.location.href = "/";
        break;
      case "create":
        window.location.href = "/create-room";
        break;
      case "room":
        if (data?.roomId) {
          window.location.href = `/room/${data.roomId}`;
        }
        break;
      default:
        window.location.href = "/";
    }
  };

  return <DashboardPage onNavigate={handleNavigate} />;
}
