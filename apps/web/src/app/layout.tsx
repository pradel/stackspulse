import Fathom from "@/components/Layout/Fathom";
import { Footer } from "@/components/Layout/Footer";
import { Header } from "@/components/Layout/Header";
import { env } from "@/env";
import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const font = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
  title: "stackspulse",
  description:
    "Get the latest on-chain stats for the Stacks (STX) blockchain DeFi ecosystem. Real time feed, unique users, transactions, and more...",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${font.variable} font-sans antialiased`}
      >
        <Providers>
          <Theme appearance="dark" accentColor="orange" grayColor="sand">
            <Header />
            {children}
            <Footer />
          </Theme>
        </Providers>
        <Fathom />
      </body>
    </html>
  );
}
