import { checkAuth } from "../utils";
import db from "../db";
import { activity, project } from "../db/schema";
import { eq } from "drizzle-orm";
import { createProjectSchema, ProjectParamsSchema, WorkspaceParamsSchema } from "@/schemas/zod";
import { prettifyError } from "zod";

const routes: Bun.Serve.Options<undefined, `/api/projects${string}`>["routes"] = {
  "/api/projects": {
    GET: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const projects = await db.select().from(project);

      return Response.json({ success: true, projects }, { status: 200 });
    },
    POST: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();

      const result = createProjectSchema.safeParse(body);

      if (result.success) {
        const [newProject] = await db
          .insert(project)
          .values({
            name: result.data.name,
            description: result.data.description,
            owner_id: user.id,
            workspace_id: result.data.workspace_id,
          })
          .returning();

        if (!newProject) {
          return Response.json(
            {
              success: false,
              error: "Failed to create Project",
            },
            {
              status: 500,
            },
          );
        }

        await db.insert(activity).values({
          action: `created Project ${result.data.name}`,
          user_id: user.id,
          workspace_id: result.data.workspace_id,
        });
        return Response.json({ success: true, project: newProject }, { status: 201 });
      } else {
        return Response.json(
          {
            success: false,
            error: prettifyError(result.error),
          },
          {
            status: 400,
          },
        );
      }
    },
  },
  "/api/projects/:project_id": {
    GET: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const result = ProjectParamsSchema.safeParse(req.params);

      if (!result.success) {
        return Response.json({ success: false, error: result.error.message }, { status: 400 });
      }

      const [result_project] = await db
        .select()
        .from(project)
        .where(eq(project.id, parseInt(result.data.project_id)));

      return Response.json({ success: true, project: result_project }, { status: 200 });
    },
  },
  "/api/projects/workspace/:workspace_id": {
    GET: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const result = WorkspaceParamsSchema.safeParse(req.params);

      if (!result.success) {
        return Response.json({ success: false, error: result.error.message }, { status: 400 });
      }

      const projects_in_workspace = await db
        .select()
        .from(project)
        .where(eq(project.workspace_id, parseInt(result.data.workspace_id)));

      return Response.json({ success: true, projects: projects_in_workspace }, { status: 200 });
    },
  },
  "/api/projects/:project_id/dashboard": {
    GET: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
    },
  },
};

export default routes;
