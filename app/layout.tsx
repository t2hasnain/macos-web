// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "macOS Web - Interactive macOS Website | macOS WebOS by hasnain",
  description: "Experience macOS WebOS by hasnain, a fully interactive macOS web experience and online macOS website. Explore a realistic macOS simulator in your browser with a sandboxed file system, UNIX terminal, App Store, retro games, photo booth, and developer tools. Fully open-source and optimized for search engine ranking.",
  keywords: [
    "macos web",
    "macos website",
    "macos online",
    "macos webos",
    "macos simulator",
    "macos web emulator",
    "macos in browser",
    "mac os in browser",
    "mac os online",
    "mac os web",
    "mac os website",
    "web based macos",
    "react macos",
    "nextjs macos",
    "macos clone",
    "hasnain",
    "t2hasnain",
    "macos webos by hasnain",
    "macos portfolio",
    "webos",
    "interactive macos website",
    "macos desktop simulator"
  ],
  authors: [{ name: "hasnain", url: "https://t2hasnain.me" }],
  metadataBase: new URL("https://t2hasnain.me"),
  openGraph: {
    title: "macOS Web - Interactive macOS Website | macOS WebOS by hasnain",
    description: "Experience macOS WebOS by hasnain, a fully interactive macOS web experience and online macOS website. Explore a realistic macOS simulator in your browser with a sandboxed file system, UNIX terminal, and retro games.",
    url: "https://github.com/t2hasnain/macos-web",
    siteName: "macOS WebOS",
    images: [
      {
        url: "/wallpaper.png",
        width: 1200,
        height: 630,
        alt: "macOS WebOS screen preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "macOS Web - Interactive macOS Website | macOS WebOS by hasnain",
    description: "Experience macOS WebOS by hasnain, a fully interactive macOS web experience and online macOS website in the browser.",
    images: ["/wallpaper.png"],
    creator: "@t2hasnain",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "macOS WebOS by hasnain | macOS Web Online Website",
    "description": "Experience macOS WebOS by hasnain, a fully interactive macOS web experience and online macOS website. Explore a realistic macOS simulator in your browser with a sandboxed file system, UNIX terminal, retro games, and design tools.",
    "url": "https://github.com/t2hasnain/macos-web",
    "image": "https://raw.githubusercontent.com/t2hasnain/macos-web/main/public/wallpaper.png",
    "applicationCategory": "DeveloperApplication, GameApplication, DesignApplication",
    "operatingSystem": "Web Browser (Chrome, Safari, Firefox, Edge)",
    "author": {
      "@type": "Person",
      "name": "hasnain",
      "url": "https://t2hasnain.me",
      "sameAs": [
        "https://github.com/t2hasnain",
        "https://x.com/t2hasnain",
        "https://linkedin.com/in/t2hasnain",
        "https://youtube.com/@t2hasnain"
      ]
    },
    "featureList": [
      "Interactive macOS-style desktop with Multi-window Drag & Drop Finder",
      "App Store with retro games (Snake, 3D Games, Racing) and Graphic Design application",
      "Interactive zsh UNIX Shell terminal with customizable /open app command",
      "Fully sandboxed Virtual File System (VFS) with localStorage persistence",
      "Dynamic Notepad tool, Photo Booth Camera app, and customizable Wallpapers",
      "Interactive Notch and Control Center with Wi-Fi, battery, and layout settings"
    ]
  };

  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${monoFont.variable} h-full antialiased font-sans`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-black">{children}</body>
    </html>
  );
}
