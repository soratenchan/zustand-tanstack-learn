export type Task = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assigneeId: string | null;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

export type TaskFilters = {
  status: Task["status"] | "all";
  priority: Task["priority"] | "all";
  assigneeId: string | null;
};
