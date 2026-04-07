"use client";

import { useUIStore } from "@/stores/ui-store";
import { TaskForm } from "./task-form";
import { TaskFilters } from "./task-filters";

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 bg-white p-2 rounded-lg shadow-md border text-sm"
      >
        {sidebarOpen ? "←" : "→"}
      </button>

      <aside
        className={`fixed left-0 top-0 h-full bg-gray-50 border-r shadow-lg transition-transform duration-300 w-80 z-30 overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 pt-14 space-y-4">
          <h1 className="text-lg font-bold text-gray-800">Task Manager</h1>
          <TaskForm />
          <TaskFilters />
        </div>
      </aside>
    </>
  );
}
