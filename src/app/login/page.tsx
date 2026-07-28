'use client';

import React, { useState, Suspense } from 'react';
import { useLogin } from '../../hooks/useLogin';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthToken } from '../../utils/api';

export type ClearanceTier = 'L1_CIVILIAN' | 'L2_COMMAND';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || searchParams?.get('redirect');

  const [email, setEmail] = useState('operator@aerolock.com');
  const [password, setPassword] = useState('');
  const [tier, setTier] = useState<ClearanceTier>('L1_CIVILIAN');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        router.replace(returnUrl || '/flights');
      }
    }
  }, [router, returnUrl]);

  const loginMutation = useLogin({
    onSuccess: (data) => {
      // Extract adminToken or general JWT token from response payload
      const adminTokenObj =
        (data as Record<string, unknown>).adminToken ||
        data.accessToken ||
        data.token ||
        data.access_token ||
        data.jwt;
      const extractedToken = typeof adminTokenObj === 'string' ? adminTokenObj : String(adminTokenObj || '');

      setErrorMessage(null);

      const isDataAdmin =
        (data as Record<string, unknown>).role === 'ADMIN' ||
        (data.user as Record<string, unknown> | undefined)?.role === 'ADMIN';

      if (tier === 'L2_COMMAND' || isDataAdmin) {
        // [ L2_COMMAND ] Admin routing
        localStorage.setItem('clearance', 'L2_COMMAND');

        if (extractedToken) {
          localStorage.setItem('adminToken', extractedToken);
          localStorage.setItem('accessToken', extractedToken);
          localStorage.setItem('auth_token', extractedToken);
          localStorage.setItem('token', extractedToken);
          setAuthToken(extractedToken);
        }

        const userNameFromData =
          (data as Record<string, unknown>).name ||
          data.user?.name ||
          email.split('@')[0].toUpperCase() ||
          'COMMAND_ADMIN';

        localStorage.setItem(
          'user',
          JSON.stringify({ name: String(userNameFromData), role: 'ADMIN', clearance: 'L2_COMMAND', email })
        );

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
          // Direct hard navigation to guarantee redirect to /command Admin Console
          window.location.href = '/command';
        }
      } else {
        // [ L1_CIVILIAN ] Standard User routing
        localStorage.setItem('clearance', 'L1_CIVILIAN');

        const civilianToken = data.accessToken || data.token || data.access_token || data.jwt;
        if (civilianToken) {
          localStorage.setItem('accessToken', civilianToken);
          localStorage.setItem('auth_token', civilianToken);
          localStorage.setItem('token', civilianToken);
          setAuthToken(civilianToken);
        }

        const userNameFromData =
          (data as Record<string, unknown>).name ||
          data.user?.name ||
          email.split('@')[0].toUpperCase() ||
          'CIVILIAN_USER';

        localStorage.setItem(
          'user',
          JSON.stringify({ name: String(userNameFromData), role: 'CUSTOMER', clearance: 'L1_CIVILIAN', email })
        );

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
          const targetDestination = (returnUrl && returnUrl !== '/') ? returnUrl : '/flights';
          window.location.href = targetDestination;
        }
      }
    },
    onError: (err) => {
      setErrorMessage(
        err.message ||
          '[SYS_ERROR]: AUTHENTICATION_FAILED - CREDENTIALS_REJECTED'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage(
        '[SYS_ERROR]: EMAIL_AND_HARDWARE_HASH_REQUIRED'
      );
      return;
    }

    setErrorMessage(null);

    loginMutation.mutate({
      email: email.trim(),
      password,
    });
  };

  const isPending = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] font-mono flex items-center justify-center p-4 selection:bg-[#00e5ff] selection:text-[#051424]">
      {/* Outer Tactical Modal Frame */}
      <div className={`bg-[#0d1c2d] border-2 ${tier === 'L2_COMMAND' ? 'border-[#ffb4ab]' : 'border-[#00e5ff]'} w-full max-w-lg p-6 md:p-8 relative shadow-2xl rounded-none space-y-6 transition-colors duration-200`}>
        {/* Corner Tactical Accents */}
        <div className={`absolute -top-1.5 -left-1.5 w-3 h-3 ${tier === 'L2_COMMAND' ? 'bg-[#ffb4ab]' : 'bg-[#00e5ff]'}`} />
        <div className={`absolute -top-1.5 -right-1.5 w-3 h-3 ${tier === 'L2_COMMAND' ? 'bg-[#ffb4ab]' : 'bg-[#00e5ff]'}`} />
        <div className={`absolute -bottom-1.5 -left-1.5 w-3 h-3 ${tier === 'L2_COMMAND' ? 'bg-[#ffb4ab]' : 'bg-[#00e5ff]'}`} />
        <div className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 ${tier === 'L2_COMMAND' ? 'bg-[#ffb4ab]' : 'bg-[#00e5ff]'}`} />

        {/* Header Section */}
        <div className="border-b border-[#3b494c] pb-4 space-y-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`font-bold text-lg uppercase tracking-widest ${tier === 'L2_COMMAND' ? 'text-[#ffb4ab]' : 'text-[#00e5ff]'}`}>
                TERMINAL_AUTHENTICATION
              </h1>
              <p className="text-xs text-[#849396] tracking-wider uppercase font-mono">
                {'// CLEARANCE_GATEWAY_V2'}
              </p>
            </div>

            <span className={`border text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-none font-mono ${
              tier === 'L2_COMMAND'
                ? 'bg-red-950/80 border-[#ffb4ab]/80 text-[#ffb4ab]'
                : 'bg-cyan-950/80 border-[#00e5ff]/80 text-[#00e5ff]'
            }`}>
              <span className="material-symbols-outlined text-xs">lock</span>
              {tier === 'L2_COMMAND' ? 'COMMAND_PORTAL' : 'CIVILIAN_PORTAL'}
            </span>
          </div>

          <div className="text-[10px] text-[#849396] tracking-widest uppercase text-right pt-1 font-mono">
            GATEWAY_ROLE_ROUTING_ACTIVE
          </div>
        </div>

        {/* Error Alert Display */}
        {(errorMessage || loginMutation.isError) && (
          <div className="p-3 border-2 border-[#ffb4ab] bg-[#ffb4ab]/10 text-[#ffb4ab] text-xs font-mono font-bold uppercase tracking-wider rounded-none flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">
              warning
            </span>
            <span>
              {errorMessage ||
                '[SYS_ERROR]: AUTHENTICATION_FAILED - CREDENTIALS_REJECTED'}
            </span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Binary Clearance Tier Radio Selector */}
          <div>
            <label className="block text-[#849396] font-bold uppercase tracking-widest mb-2 text-[11px] font-mono">
              CLEARANCE_TIER_SELECTION
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {/* Option A (Default): L1_CIVILIAN */}
              <label
                onClick={() => !isPending && setTier('L1_CIVILIAN')}
                className={`w-full p-3.5 border cursor-pointer flex justify-between items-center rounded-none transition-all ${
                  tier === 'L1_CIVILIAN'
                    ? 'border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff]'
                    : 'border-[#3b494c] bg-[#122131] text-[#bac9cc] hover:border-[#849396]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="tier-l1"
                    name="clearanceTier"
                    value="L1_CIVILIAN"
                    checked={tier === 'L1_CIVILIAN'}
                    onChange={() => setTier('L1_CIVILIAN')}
                    disabled={isPending}
                    className="mt-0.5 accent-[#00e5ff]"
                  />
                  <div>
                    <div className="font-bold tracking-widest text-xs uppercase font-mono">
                      [ L1_CIVILIAN ] :: Standard User
                    </div>
                    <div className="text-[10px] text-[#849396] mt-1 font-mono">
                      Read-only public logistics & schedule telemetry
                    </div>
                  </div>
                </div>
                {tier === 'L1_CIVILIAN' && (
                  <span className="material-symbols-outlined text-base text-[#00e5ff]">
                    check_circle
                  </span>
                )}
              </label>

              {/* Option B: L2_COMMAND */}
              <label
                onClick={() => !isPending && setTier('L2_COMMAND')}
                className={`w-full p-3.5 border cursor-pointer flex justify-between items-center rounded-none transition-all ${
                  tier === 'L2_COMMAND'
                    ? 'border-[#ffb4ab] bg-[#ffb4ab]/10 text-[#ffb4ab]'
                    : 'border-[#3b494c] bg-[#122131] text-[#bac9cc] hover:border-[#849396]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="tier-l2"
                    name="clearanceTier"
                    value="L2_COMMAND"
                    checked={tier === 'L2_COMMAND'}
                    onChange={() => setTier('L2_COMMAND')}
                    disabled={isPending}
                    className="mt-0.5 accent-[#ffb4ab]"
                  />
                  <div>
                    <div className="font-bold tracking-widest text-xs uppercase font-mono">
                      [ L2_COMMAND ] :: Admin
                    </div>
                    <div className="text-[10px] text-[#849396] mt-1 font-mono">
                      Flight vector routing, stealth fleet & cargo clearance
                    </div>
                  </div>
                </div>
                {tier === 'L2_COMMAND' && (
                  <span className="material-symbols-outlined text-base text-[#ffb4ab]">
                    check_circle
                  </span>
                )}
              </label>
            </div>
          </div>

          {/* Email Address Field */}
          <div>
            <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px] font-mono">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@aerolock.com"
              disabled={isPending}
              required
              className={`w-full bg-[#122131] border border-[#3b494c] p-3 text-xs font-mono tracking-wider focus:outline-none rounded-none transition-colors disabled:opacity-50 ${
                tier === 'L2_COMMAND' ? 'text-[#ffb4ab] focus:border-[#ffb4ab]' : 'text-[#00e5ff] focus:border-[#00e5ff]'
              }`}
            />
          </div>

          {/* Passkey Hardware Hash Field */}
          <div>
            <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px] font-mono">
              PASSKEY HARDWARE HASH
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isPending}
                required
                className={`w-full bg-[#122131] border border-[#3b494c] p-3 pr-10 text-xs font-mono tracking-wider focus:outline-none rounded-none transition-colors disabled:opacity-50 text-[#d4e4fa] ${
                  tier === 'L2_COMMAND' ? 'focus:border-[#ffb4ab]' : 'focus:border-[#00e5ff]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isPending}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#849396] hover:text-[#d4e4fa] bg-transparent border-none cursor-pointer p-1"
                title="TOGGLE_HASH_VISIBILITY"
              >
                <span className="material-symbols-outlined text-sm">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Action Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className={`w-full font-bold p-3.5 text-xs tracking-widest uppercase disabled:opacity-50 cursor-pointer rounded-none border-none transition-colors flex items-center justify-center gap-2 font-mono ${
                tier === 'L2_COMMAND'
                  ? 'bg-[#ffb4ab] text-[#051424] hover:bg-white active:bg-[#ff9c91]'
                  : 'bg-[#00e5ff] text-[#051424] hover:bg-[#00cbe3] active:bg-[#00b0c7]'
              }`}
            >
              {isPending ? (
                <>
                  <span className="w-3 h-3 border-2 border-[#051424] border-t-transparent animate-spin inline-block rounded-full" />
                  <span>VERIFYING_CLEARANCE...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    verified_user
                  </span>
                  <span>{tier === 'L2_COMMAND' ? 'AUTHENTICATE_COMMAND_SESSION' : 'AUTHENTICATE_CIVILIAN_SESSION'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Metrics */}
        <div className="border-t border-[#3b494c]/60 pt-4 flex justify-between items-center text-[10px] text-[#849396] tracking-widest font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold ${tier === 'L2_COMMAND' ? 'text-[#ffb4ab]' : 'text-[#00e5ff]'}`}>[SYS]</span>
            <span>{isPending ? 'VERIFYING_HASH...' : 'AWAITING_INPUT...'}</span>
            <span className={`w-2 h-3 animate-pulse inline-block ${tier === 'L2_COMMAND' ? 'bg-[#ffb4ab]' : 'bg-[#00e5ff]'}`} />
          </div>
          <div className="flex gap-3">
            <span>{'PORT_8880 // SSL'}</span>
            <span>CLEARANCE: {tier}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#051424] text-[#00e5ff] flex items-center justify-center font-mono text-xs">
        [SYS] INITIALIZING_AUTHENTICATION_GATEWAY...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
