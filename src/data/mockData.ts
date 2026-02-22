import type { Activity, Project, Task, User, Workspace } from "./types";

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Alex Rivera",
    avatar: "https://i.pravatar.cc/150?u=1",
    email: "alex@helix.com",
  },
  {
    id: "u2",
    name: "Sarah Chen",
    avatar: "https://i.pravatar.cc/150?u=2",
    email: "sarah@helix.com",
  },
  {
    id: "u3",
    name: "Jordan Smith",
    avatar: "https://i.pravatar.cc/150?u=3",
    email: "jordan@helix.com",
  },
  {
    id: "u4",
    name: "Emily Zhang",
    avatar: "https://i.pravatar.cc/150?u=4",
    email: "emily@helix.com",
  },
];

const projects: Project[] = [
  {
    id: "p1",
    name: "Q1 Website Redesign",
    description: "Overhaul the marketing site with new branding.",
    workspaceId: "w1",
    members: ["u1", "u2", "u3"],
  },
  {
    id: "p2",
    name: "Mobile App Launch",
    description: "Prepare for the iOS and Android release.",
    workspaceId: "w1",
    members: ["u1", "u4"],
  },
  {
    id: "p3",
    name: "Internal Tools",
    description: "Improve the admin dashboard.",
    workspaceId: "w2",
    members: ["u2", "u3"],
  },
];

const tasks: Task[] = [
  {
    id: "t1",
    title: "Design Homepage Mockups",
    status: "Done",
    priority: "High",
    assigneeId: "u1",
    projectId: "p1",
    createdAt: "2023-10-01T10:00:00Z",
    dueDate: "2023-10-05T17:00:00Z",
    description: "Create 3 variations of the homepage hero section.",
  },
  {
    id: "t2",
    title: "Implement Navbar",
    status: "Review",
    priority: "Medium",
    assigneeId: "u2",
    projectId: "p1",
    createdAt: "2023-10-02T11:00:00Z",
    dueDate: "2023-10-07T17:00:00Z",
    description: "Responsive navbar with dropdowns.",
  },
  {
    id: "t3",
    title: "Write Copy",
    status: "In Progress",
    priority: "Low",
    assigneeId: "u3",
    projectId: "p1",
    createdAt: "2023-10-03T09:00:00Z",
    dueDate: "2023-10-10T17:00:00Z",
    description: "Draft text for the features section.",
  },
  {
    id: "t4",
    title: "SEO Audit",
    status: "Backlog",
    priority: "Medium",
    assigneeId: "u1",
    projectId: "p1",
    createdAt: "2023-10-05T14:00:00Z",
    dueDate: "2023-10-15T17:00:00Z",
  },
  {
    id: "t5",
    title: "Setup CI/CD",
    status: "Done",
    priority: "High",
    assigneeId: "u4",
    projectId: "p2",
    createdAt: "2023-10-01T10:00:00Z",
  },
];

const activities: Activity[] = [
  {
    id: "a1",
    userId: "u1",
    taskId: "t1",
    action: "completed task",
    timestamp: "2023-10-06T10:30:00Z",
  },
  {
    id: "a2",
    userId: "u2",
    taskId: "t2",
    action: "moved task to Review",
    timestamp: "2023-10-07T14:15:00Z",
  },
  {
    id: "a3",
    userId: "u3",
    taskId: "t3",
    action: "started working on task",
    timestamp: "2023-10-08T09:00:00Z",
  },
];

export const mockWorkspaces: Workspace[] = [
  {
    id: "w1",
    name: "Engineering Team",
    logo: "🚀",
    members: mockUsers,
    projects: projects.filter((p) => p.workspaceId === "w1"),
  },
  {
    id: "w2",
    name: "Marketing Dept",
    logo: "📢",
    members: [mockUsers[1]!, mockUsers[2]!],
    projects: projects.filter((p) => p.workspaceId === "w2"),
  },
];

export const getTasksByProject = (projectId: string) =>
  tasks.filter((t) => t.projectId === projectId);
export const getUser = (userId: string) =>
  mockUsers.find((u) => u.id === userId);
export const initialActivities = activities;
