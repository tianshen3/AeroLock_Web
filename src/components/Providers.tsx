'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TerminalProvider } from '../context/TerminalContext';

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Initialize QueryClient using useState initializer function to ensure the instance is created
  // once per request/session and the cache persists across client-side navigation.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TerminalProvider>
        {children}
      </TerminalProvider>
    </QueryClientProvider>
  );
}

export default Providers;