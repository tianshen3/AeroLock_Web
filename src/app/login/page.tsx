'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthForm from '../../components/AuthForm';
import { ClearanceLevel } from '../../types';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || searchParams?.get('redirect');
  const tierParam = searchParams?.get('tier');

  const initialTier: ClearanceLevel =
    tierParam === 'L2_COMMAND' || (returnUrl && returnUrl.includes('command'))
      ? 'L2_COMMAND'
      : 'L1_CIVILIAN';

  // Automatically redirect away if user is already authenticated with valid clearance
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminToken');
      const token =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('auth_token') ||
        localStorage.getItem('token');
      const clearance = localStorage.getItem('clearance');
      const userStr = localStorage.getItem('user');
      let isAdmin = false;

      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj.role === 'ADMIN' || clearance === 'L2_COMMAND') {
            isAdmin = true;
          }
        } catch {
          // ignore
        }
      }

      if (adminToken || clearance === 'L2_COMMAND' || isAdmin) {
        router.replace('/command');
      } else if (token) {
        router.replace(returnUrl || '/');
      }
    }
  }, [router, returnUrl]);

  return <AuthForm isModal={false} initialTier={initialTier} returnUrl={returnUrl} />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#051424] text-[#00e5ff] flex items-center justify-center font-mono text-xs">
          [SYS] INITIALIZING_AUTHENTICATION_GATEWAY...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
