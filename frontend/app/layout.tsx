import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen grid-lines">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">BranchGPT</h1>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}


