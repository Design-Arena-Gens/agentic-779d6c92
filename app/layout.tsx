import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nova AI Assistant",
  description: "Offline + online AI assistant with multi-threaded conversations."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
