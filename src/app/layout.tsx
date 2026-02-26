import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brieflytics — The analytics tool that talks to you.",
  description:
    "No dashboards. No logins. Brieflytics sends plain English reports + AI growth tips straight to your Telegram or email. EU-hosted, GDPR compliant, no cookies. $5/mo.",
  keywords: ["analytics", "privacy", "GDPR", "cookieless", "web analytics"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
