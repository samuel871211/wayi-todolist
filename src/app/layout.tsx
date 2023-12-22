import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wayi todolist",
  description: "Wayi todolist",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{props.children}</body>
    </html>
  );
}
