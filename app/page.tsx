'use client';

import React from 'react';
import { HeroSection } from '../src/components/HeroSection';
import { BentoGrid } from '../src/components/BentoGrid';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BentoGrid />
    </>
  );
}
