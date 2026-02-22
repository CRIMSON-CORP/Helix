import { signInUserSchema, signUpUserSchema } from "@/schemas/zod";
import { z } from "zod";
import db from "../db";
import { user, type User } from "../db/schema";
import jwt from "jsonwebtoken";
import { getCookie, verifyToken } from "../utils";

const getAuthHeader = (user: User): Headers => {
  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append(
    "Set-Cookie",
    `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=900; Path=/`,
  );
  headers.append(
    "Set-Cookie",
    `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/api/auth/refresh`,
  );

  return headers;
};

const routes: Bun.Serve.Options<undefined, `/api/auth/${string}`>["routes"] = {
  "/api/auth/signup": {
    async POST(req) {
      const body = await req.json();
      const result = signUpUserSchema.safeParse(body);

      if (result.success) {
        const existingUserEmail = await db.query.user.findFirst({
          where: (user, { eq }) => eq(user.email, result.data.email),
        });

        if (existingUserEmail) {
          return Response.json(
            {
              success: false,
              error: "User with this email already exists",
            },
            {
              status: 400,
            },
          );
        }

        const existingUserUsername = await db.query.user.findFirst({
          where: (user, { eq }) => eq(user.username, result.data.username),
        });

        if (existingUserUsername) {
          return Response.json(
            {
              success: false,
              error: "User with this username already exists",
            },
            {
              status: 400,
            },
          );
        }

        // convert user password to hash?
        result.data.password = await Bun.password.hash(result.data.password);

        const [newUser] = await db.insert(user).values(result.data).returning();

        if (!newUser) {
          return Response.json(
            {
              success: false,
              error: "Failed to create user",
            },
            {
              status: 500,
            },
          );
        }

        const headers = getAuthHeader(newUser);

        const { password, ...newUserData } = newUser;
        return new Response(JSON.stringify({ success: true, user: newUserData }), {
          headers,
          status: 201,
        });
      } else {
        return Response.json(
          {
            success: false,
            error: z.flattenError(result.error).fieldErrors,
          },
          {
            status: 400,
          },
        );
      }
    },
  },
  "/api/auth/signin": {
    async POST(req) {
      const body = await req.json();
      const result = signInUserSchema.safeParse(body);

      if (result.success) {
        const existingUser = await db.query.user.findFirst({
          where: (user, { eq }) => eq(user.username, result.data.username),
        });

        if (!existingUser) {
          return Response.json(
            {
              success: false,
              error: "User not found",
            },
            {
              status: 400,
            },
          );
        }

        const isMatch = await Bun.password.verify(result.data.password, existingUser.password);

        if (isMatch) {
          const { password, ...user } = existingUser;
          const headers = getAuthHeader(user);
          return Response.json({ success: true, user: user }, { headers, status: 200 });
        } else {
          return Response.json(
            {
              success: false,
              error: "Invalid password",
            },
            {
              status: 400,
            },
          );
        }
      } else {
        return Response.json(
          {
            success: false,
            error: z.flattenError(result.error).fieldErrors,
          },
          {
            status: 400,
          },
        );
      }
    },
  },
  "/api/auth/signout": {
    POST() {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append(
        "Set-Cookie",
        `accessToken=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`,
      );
      headers.append(
        "Set-Cookie",
        `refreshToken=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/api/refresh`,
      );

      return Response.json({ success: true }, { headers, status: 200 });
    },
  },
  "/api/auth/me": {
    GET: async (req) => {
      const token = getCookie(req, "accessToken");

      if (!token) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const result = verifyToken(token);
      if (!result) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const user = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, result.id),
      });

      if (!user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      // Return user info (this will be used to populate your React state)
      return Response.json({ success: true, user });
    },
  },
  "/api/auth/refresh": {
    POST: async (req) => {
      const refreshToken = getCookie(req, "refreshToken");

      if (!refreshToken) {
        return Response.json({ success: false, error: "No refresh token" }, { status: 401 });
      }

      const result = verifyToken(refreshToken);
      if (!result) {
        return Response.json({ success: false, error: "Invalid refresh token" }, { status: 401 });
      }

      const user = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, result.id),
      });

      if (!user) {
        return Response.json({ success: false, error: "User not found" }, { status: 401 });
      }

      // Generate new tokens
      const headers = getAuthHeader(user);

      return Response.json({ success: true, user }, { headers });
    },
  },
};

export default routes;
