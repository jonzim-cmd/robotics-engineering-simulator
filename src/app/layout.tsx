import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project ARES: Engineering Simulator",
  description: "Robotics Engineering Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body
        className="bg-slate-950 text-slate-200 font-mono antialiased min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200"
      >
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20" />
        <main className="min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}