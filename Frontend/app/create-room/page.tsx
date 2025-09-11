"use client";
import { CreateRoomPage } from "@/components/CreateRoomPage";

export default function CreateRoom() {
  const handleNavigate = (page: string, data?: { roomId?: string }) => {
    switch (page) {
      case "home":
        window.location.href = "/";
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

  return <CreateRoomPage onNavigate={handleNavigate} />;
}
