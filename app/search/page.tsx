'use client';

import React, { Suspense } from 'react';
import FlightsPage from '../../src/app/flights/page';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#051424] font-mono text-[#00e5ff] p-8 flex justify-center items-center">
          <span className="animate-pulse tracking-[0.3em] text-xs">[SYS] SCANNING_AIRSPACE_MANIFEST...</span>
        </div>
      }
    >
      <FlightsPage />
    </Suspense>
  );
}
