"use client";

import { useUIStore } from "@/stores/ui-store";

// 学習ポイント 25: subscribe で自動削除される通知を表示
export function Notifications() {
  const notifications = useUIStore((state) => state.notifications);
  const removeNotification = useUIStore((state) => state.removeNotification);

  if (notifications.length === 0) return null;

  const colors = {
    success: "bg-green-50 border-green-300 text-green-800",
    error: "bg-red-50 border-red-300 text-red-800",
    info: "bg-blue-50 border-blue-300 text-blue-800",
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-4 py-3 rounded-lg border shadow-lg text-sm ${colors[n.type]} animate-slide-in`}
        >
          <div className="flex justify-between items-center gap-2">
            <span>{n.message}</span>
            <button
              onClick={() => removeNotification(n.id)}
              className="opacity-50 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
