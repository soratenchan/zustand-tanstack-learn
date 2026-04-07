"use client";

import { Sidebar } from "@/components/sidebar";
import { TaskList } from "@/components/task-list";
import { Notifications } from "@/components/notifications";
import { useUIStore } from "@/stores/ui-store";

export default function Home() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <>
      <Notifications />
      <Sidebar />
      <main
        className={`transition-all duration-300 p-6 pt-16 ${
          sidebarOpen ? "ml-80" : "ml-0"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <TaskList />
        </div>
      </main>
    </>
  );
}
