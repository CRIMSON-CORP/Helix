import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function MainLayout({ children, sidebar }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans selection:bg-purple-500/30 overflow-hidden">
      {sidebar}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
