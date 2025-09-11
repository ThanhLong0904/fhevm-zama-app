"use client";
import { HomePage } from "@/components/HomePage";

export default function Home() {
  const handleNavigate = (page: string, data?: { roomId?: string }) => {
    switch (page) {
      case "create-room":
        window.location.href = "/create-room";
        break;
      case "room":
        if (data?.roomId) {
          window.location.href = `/room/${data.roomId}`;
        }
        break;
      case "dashboard":
        window.location.href = "/dashboard";
        break;
      default:
        window.location.href = "/";
    }
  };

  return <HomePage onNavigate={handleNavigate} />;
}
