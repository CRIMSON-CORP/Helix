import { serve } from "bun";
import index from "./index.html";

import authRoutes from "./server/routes/auth";
import workspaceRoutes from "./server/routes/workspace";
import userRoutes from "./server/routes/users";
import projectRoutes from "./server/routes/project";
import taskRoutes from "./server/routes/task";
import activityRoutes from "./server/routes/activities";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
    ...authRoutes,
    ...workspaceRoutes,
    ...userRoutes,
    ...projectRoutes,
    ...taskRoutes,
    ...activityRoutes,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
