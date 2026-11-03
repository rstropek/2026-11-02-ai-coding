import type { Metadata } from "next";
import { Fira_Mono, Fira_Sans, Source_Serif_4 } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fira-sans",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

const firaMono = Fira_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-fira-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Lizenzverwaltung",
    template: "%s · Lizenzverwaltung",
  },
  description:
    "Verwaltung von Lizenzschlüsseln zur Freischaltung von Produktfunktionen",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${firaSans.variable} ${sourceSerif.variable} ${firaMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
