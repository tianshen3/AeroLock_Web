import React from 'react';
import './globals.css';
import AppShell from '../src/components/AppShell';

export const metadata = {
  title: 'AEROLOCK | Flight Terminal',
  description: 'Secure Air Traffic Coordination Node & Stealth Fleet Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#051424] text-[#d4e4fa] antialiased selection:bg-[#00e5ff] selection:text-[#051424]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
