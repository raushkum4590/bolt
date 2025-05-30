import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import ConvexClientProvider from "./ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Web Builder - Create Stunning Websites with AI",
  description: "Build beautiful, responsive websites in minutes using our advanced AI technology. No coding required. Start creating your dream website today!",
  keywords: "AI website builder, web design, website creation, no-code, responsive design",
  openGraph: {
    title: "AI Web Builder - Create Stunning Websites with AI",
    description: "Build beautiful, responsive websites in minutes using our advanced AI technology.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
        <Provider>
        {children}
        </Provider>
        </ConvexClientProvider>

      </body>
    </html>
  );
}
