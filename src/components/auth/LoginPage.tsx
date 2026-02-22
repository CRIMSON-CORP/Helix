import { useState } from "react";
import { Button } from "../common/Button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Chrome } from "lucide-react";
import type { z } from "zod";
import type { signUpUserSchema } from "@/schemas/zod";
import type { User } from "@/server/db/schema";

interface LoginPageProps {
  onLogin: (user: User) => void;
  onSignup: (user: User) => void;
}

type FieldErrors = z.infer<typeof signUpUserSchema>;
type FormErrorState = {
  [K in keyof FieldErrors]?: string[];
};

export function LoginPage({ onLogin, onSignup }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<FormErrorState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (isLogin) {
      if (!username || !password) {
        alert("Username and password are required");
        return;
      }

      try {
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          onLogin(data.user);
        } else throw data.error;
      } catch (error: any) {
        if (typeof error === "string") {
          alert(error);
        } else {
          setError(error);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const newUser: Omit<User, "id" | "created_at"> & { password: string } = {
        name,
        email,
        username,
        password,
      };

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify(newUser),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          onSignup(data.user);
        } else throw data.error;
      } catch (error: any) {
        if (typeof error === "string") {
          alert(error);
        } else {
          setError(error);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0A0A0B]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="mt-2 text-white/40">
            {isLogin ? "Sign in to your account to continue" : "Enter your details to get started"}
          </p>
        </div>

        <div className="bg-[#1a1a1f] border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-purple-500/50"
                  />
                  {error?.name && <p className="text-sm text-red-500">{error.name.join(", ")}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-purple-500/50"
                  />
                  {error?.email && <p className="text-sm text-red-500">{error.email.join(", ")}</p>}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-purple-500/50"
                required
              />
              {error?.username && (
                <p className="text-sm text-red-500">{error.username.join(", ")}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <a href="#" className="text-sm font-medium text-purple-400 hover:text-purple-300">
                    Forgot password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-purple-500/50"
                required
              />
              {error?.password && (
                <p className="text-sm text-red-500">{error.password.join(", ")}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0 h-11"
            >
              {isSubmitting ? "Loading..." : isLogin ? "Create account" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1a1a1f] px-2 text-white/40">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white h-11"
                onClick={() => {}}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-white/40">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="font-medium text-purple-400 hover:text-purple-300 underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
