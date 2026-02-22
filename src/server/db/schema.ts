import { date, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["backlog", "pending", "review", "completed"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const user = pgTable("user", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull(),
  username: text().notNull(),
  password: text().notNull(),
  created_at: timestamp().defaultNow().notNull(),
});

export const workspace = pgTable("workspace", {
  id: serial().primaryKey(),
  name: text().notNull(),
  icon: varchar({ length: 1 }).notNull(),
  owner_id: serial()
    .notNull()
    .references(() => user.id),
  created_at: timestamp().defaultNow().notNull(),
});

export const workspaceMember = pgTable("workspace_member", {
  id: serial().primaryKey(),
  workspace_id: serial()
    .notNull()
    .references(() => workspace.id),
  user_id: serial()
    .notNull()
    .references(() => user.id),
  created_at: timestamp().defaultNow().notNull(),
});

export const project = pgTable("project", {
  id: serial().primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
  workspace_id: serial()
    .notNull()
    .references(() => workspace.id),
  owner_id: serial()
    .notNull()
    .references(() => user.id),
  created_at: timestamp().defaultNow().notNull(),
});

export const task = pgTable("task", {
  id: serial().primaryKey(),
  title: text().notNull(),
  description: text().notNull(),
  status: statusEnum().default("pending").notNull(),
  assigned_to: serial()
    .notNull()
    .references(() => user.id),
  priority: priorityEnum().default("low").notNull(),
  due_date: date().notNull(),
  project_id: serial()
    .notNull()
    .references(() => project.id),
  workspace_id: serial()
    .notNull()
    .references(() => workspace.id),
  created_at: timestamp().defaultNow().notNull(),
});

export const activity = pgTable("activity", {
  id: serial().primaryKey(),
  user_id: serial()
    .notNull()
    .references(() => user.id),
  workspace_id: serial()
    .notNull()
    .references(() => workspace.id),
  action: text().notNull(),
  created_at: timestamp().defaultNow().notNull(),
});

export type User = Omit<typeof user.$inferSelect, "password">;
export type Workspace = typeof workspace.$inferSelect;
export type Project = typeof project.$inferSelect;
export type Task = typeof task.$inferSelect;
export type Activity = typeof activity.$inferSelect;

export type Priority = (typeof priorityEnum.enumValues)[number];
export type Status = (typeof statusEnum.enumValues)[number];

export type TaskInsert = Omit<typeof task.$inferSelect, "id" | "created_at">;
