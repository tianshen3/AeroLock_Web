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
      <head />
      <body className="bg-[#051424] text-[#d4e4fa] antialiased selection:bg-[#00e5ff] selection:text-[#051424]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
