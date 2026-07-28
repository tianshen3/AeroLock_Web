'use client';

import React, { useState } from 'react';
import { useLogin } from '../../hooks/useLogin';

import { useRouter } from 'next/navigation';

export type ClearanceTier = 'L1_CIVILIAN' | 'L2_COMMAND';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('operator@aerolock.com');
  const [password, setPassword] = useState('');
  const [tier, setTier] = useState<ClearanceTier>('L1_CIVILIAN');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useLogin({
    onSuccess: (data) => {
      // Extract JWT token from response object
      const token =
        data.accessToken || data.token || data.access_token || data.jwt;

      if (token) {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
        }
      }

      setErrorMessage(null);

      // Safe navigation to /dashboard
      try {
        router.push('/dashboard');
      } catch {
        window.location.href = '/dashboard';
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

    // Trigger login mutation
    loginMutation.mutate({
      email: email.trim(),
      password,
    });
  };

  const isPending = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] font-mono flex items-center justify-center p-4 selection:bg-[#00e5ff] selection:text-[#051424]">
      {/* Outer Tactical Modal Frame */}
      <div className="bg-[#0d1c2d] border-2 border-[#00e5ff] w-full max-w-lg p-6 md:p-8 relative shadow-2xl rounded-none space-y-6">
        {/* Corner Tactical Accents */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#00e5ff]" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#00e5ff]" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#00e5ff]" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#00e5ff]" />

        {/* Header Section */}
        <div className="border-b border-[#3b494c] pb-4 space-y-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-bold text-lg uppercase tracking-widest text-[#00e5ff]">
                TERMINAL_AUTHENTICATION
              </h1>
              <p className="text-xs text-[#849396] tracking-wider uppercase">
                {'// CLEARANCE_VERIFICATION'}
              </p>
            </div>

            <span className="bg-red-950/80 border border-red-500/60 text-red-400 text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-none">
              <span className="material-symbols-outlined text-xs">lock</span>
              SECURE_LINK
            </span>
          </div>

          <div className="text-[10px] text-[#849396] tracking-widest uppercase text-right pt-1">
            SYSTEM_VERIFICATION_REQUIRED
          </div>
        </div>

        {/* Error Alert Display (Electric Red #ffb4ab) */}
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
          {/* Email Address Field */}
          <div>
            <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px]">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@aerolock.com"
              disabled={isPending}
              required
              className="w-full bg-[#122131] border border-[#3b494c] p-3 text-[#00e5ff] font-mono tracking-wider focus:border-[#00e5ff] focus:outline-none rounded-none transition-colors disabled:opacity-50 text-xs"
            />
          </div>

          {/* Clearance Tier Selector */}
          <div>
            <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px]">
              SELECT CLEARANCE TIER
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setTier('L1_CIVILIAN')}
                disabled={isPending}
                className={`w-full text-left p-3 border cursor-pointer flex justify-between items-center rounded-none transition-colors ${
                  tier === 'L1_CIVILIAN'
                    ? 'border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff]'
                    : 'border-[#3b494c] bg-[#122131] text-[#bac9cc] hover:border-[#849396]'
                }`}
              >
                <div>
                  <div className="font-bold tracking-wider text-xs">
                    L1_CIVILIAN (Standard User)
                  </div>
                  <div className="text-[10px] text-[#849396] mt-0.5">
                    Read-only public logistics & schedule telemetry
                  </div>
                </div>
                {tier === 'L1_CIVILIAN' && (
                  <span className="material-symbols-outlined text-base">
                    check_circle
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setTier('L2_COMMAND')}
                disabled={isPending}
                className={`w-full text-left p-3 border cursor-pointer flex justify-between items-center rounded-none transition-colors ${
                  tier === 'L2_COMMAND'
                    ? 'border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff]'
                    : 'border-[#3b494c] bg-[#122131] text-[#bac9cc] hover:border-[#849396]'
                }`}
              >
                <div>
                  <div className="font-bold tracking-wider text-xs">
                    L2_COMMAND (Admin)
                  </div>
                  <div className="text-[10px] text-[#849396] mt-0.5">
                    Flight vector routing, stealth fleet & cargo clearance
                  </div>
                </div>
                {tier === 'L2_COMMAND' && (
                  <span className="material-symbols-outlined text-base">
                    check_circle
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Passkey Hardware Hash Field */}
          <div>
            <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px]">
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
                className="w-full bg-[#122131] border border-[#3b494c] p-3 pr-10 text-[#d4e4fa] font-mono tracking-wider focus:border-[#00e5ff] focus:outline-none rounded-none transition-colors disabled:opacity-50 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isPending}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#849396] hover:text-[#00e5ff] bg-transparent border-none cursor-pointer p-1"
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
              className="w-full bg-[#00e5ff] text-[#051424] font-bold p-3.5 text-xs tracking-widest uppercase hover:bg-[#00cbe3] active:bg-[#00b0c7] disabled:opacity-50 cursor-pointer rounded-none border-none transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-3 h-3 border-2 border-[#051424] border-t-transparent animate-spin inline-block rounded-full" />
                  <span>VERIFYING_HASH...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    verified_user
                  </span>
                  <span>AUTHENTICATE_SESSION</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Metrics */}
        <div className="border-t border-[#3b494c]/60 pt-4 flex justify-between items-center text-[10px] text-[#849396] tracking-widest">
          <div className="flex items-center gap-1.5">
            <span className="text-[#00e5ff] font-bold">[SYS]</span>
            <span>{isPending ? 'VERIFYING_CREDENTIALS...' : 'AWAITING_INPUT...'}</span>
            <span className="w-2 h-3 bg-[#00e5ff] animate-pulse inline-block" />
          </div>
          <div className="flex gap-3">
            <span>{'PORT_8880 // SSL'}</span>
            <span>LATENCY: 12ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
