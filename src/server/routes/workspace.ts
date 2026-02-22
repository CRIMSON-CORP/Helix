import { createWorkspaceSchema, WorkspaceParamsSchema } from "@/schemas/zod";
import { checkAuth } from "../utils";
import db from "../db";
import { workspace, workspaceMember, user as pgUser, activity } from "../db/schema";
import { eq } from "drizzle-orm";
import { prettifyError } from "zod";

const routes: Bun.Serve.Options<undefined, `/api/workspace${string}`>["routes"] = {
  "/api/workspace": {
    GET: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const result = await db
        .select()
        .from(workspace)
        .innerJoin(workspaceMember, eq(workspaceMember.workspace_id, workspace.id))
        .where(eq(workspaceMember.user_id, user.id));

      const workspaces = result.map((r) => r.workspace);

      return Response.json({ success: true, workspaces }, { status: 200 });
    },
    POST: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const body = await req.json();
      const result = createWorkspaceSchema.safeParse(body);

      if (result.success) {
        const [newWorkspace] = await db
          .insert(workspace)
          .values({
            name: result.data.name,
            icon: result.data.icon,
            owner_id: user.id,
          })
          .returning();

        if (!newWorkspace) {
          return Response.json(
            {
              success: false,
              error: "Failed to create workspace",
            },
            {
              status: 500,
            },
          );
        }

        await db.insert(workspaceMember).values({
          workspace_id: newWorkspace.id,
          user_id: user.id,
        });

        await db.insert(activity).values({
          action: "created this Workspace",
          user_id: user.id,
          workspace_id: newWorkspace.id,
        });

        return Response.json({ success: true, workspace: newWorkspace }, { status: 201 });
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
  "/api/workspace/:workspace_id/members": {
    GET: async (req) => {
      const user = await checkAuth(req);
      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const result = WorkspaceParamsSchema.safeParse(req.params);

      if (!result.success) {
        return Response.json({ success: false, error: result.error.message }, { status: 400 });
      }

      const members = await db
        .select({
          id: pgUser.id,
          name: pgUser.name,
          email: pgUser.email,
          username: pgUser.username,
        })
        .from(pgUser)
        .innerJoin(workspaceMember, eq(workspaceMember.user_id, pgUser.id))
        .where(eq(workspaceMember.workspace_id, parseInt(result.data.workspace_id)));

      return Response.json({ success: true, members }, { status: 200 });
    },
  },
};

export default routes;
