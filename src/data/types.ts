export type Priority = "Low" | "Medium" | "High";
export type Status = "Backlog" | "In Progress" | "Review" | "Done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assigneeId?: number;
  dueDate?: string; // ISO date string
  projectId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  workspaceId: string;
  members: string[]; // User IDs
}
