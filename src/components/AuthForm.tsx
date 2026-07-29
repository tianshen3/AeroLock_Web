'use client';

import React, { useState, useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';
import { useRegister } from '../hooks/useRegister';
import { setAuthToken } from '../utils/api';
import { ClearanceLevel } from '../types';

export interface AuthFormProps {
  isModal?: boolean;
  onClose?: () => void;
  initialTier?: ClearanceLevel;
  returnUrl?: string | null;
  onSetClearance?: (level: ClearanceLevel, name: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  isModal = false,
  onClose,
  initialTier = 'L1_CIVILIAN',
  returnUrl,
  onSetClearance,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('operator@aerolock.com');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tier, setTier] = useState<ClearanceLevel>(initialTier);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialTier) {
      setTier(initialTier);
    }
  }, [initialTier]);

  // Authentication mutation for existing operator login
  const loginMutation = useLogin({
    onSuccess: async (data) => {
      const rawToken =
        (data as Record<string, unknown>).adminToken ||
        data.token ||
        data.access_token ||
        data.jwt ||
        data.accessToken;
      const extractedToken = typeof rawToken === 'string' ? rawToken : String(rawToken || '');

      // Fetch authentic user profile from /auth/profile endpoint using the accessToken
      let profileRole: string | null = null;
      if (extractedToken) {
        try {
          const res = await fetch('https://aerolock-server.onrender.com/api/auth/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${extractedToken}`,
            },
          });
          if (res.ok) {
            const profileData = await res.json();
            const rawRole = profileData.role || profileData.user?.role;
            if (rawRole) {
              profileRole = String(rawRole).toUpperCase();
            }
          }
        } catch (e) {
          console.warn('[AUTH_FORM]: Profile fetch error, falling back to login payload role.', e);
        }
      }

      const loginRole = (
        (data as Record<string, unknown>).role ||
        (data.user as Record<string, unknown> | undefined)?.role ||
        ''
      ) as string;

      const effectiveRole = profileRole || (loginRole ? loginRole.toUpperCase() : '');
      const isAccountAdmin = effectiveRole === 'ADMIN';

      // Validate Clearance Level against authentic account privileges
      if (tier === 'L2_COMMAND' && !isAccountAdmin) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('clearance');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('auth_token');
        }
        setErrorMessage('[SYS_ERROR]: CLEARANCE_MISMATCH - CIVILIAN_CREDENTIALS_REJECTED_FOR_L2_COMMAND');
        return;
      }

      if (tier === 'L1_CIVILIAN' && isAccountAdmin) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('clearance');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('auth_token');
        }
        setErrorMessage('[SYS_ERROR]: CLEARANCE_MISMATCH - ADMIN_CREDENTIALS_REJECTED_FOR_L1_CIVILIAN');
        return;
      }

      const name =
        (data as Record<string, unknown>).name ||
        data.user?.name ||
        email.split('@')[0].toUpperCase() ||
        'OPERATOR';

      setErrorMessage(null);

      if (tier === 'L2_COMMAND') {
        if (typeof window !== 'undefined') {
          if (extractedToken) {
            localStorage.setItem('adminToken', extractedToken);
            localStorage.setItem('accessToken', extractedToken);
            localStorage.setItem('auth_token', extractedToken);
            localStorage.setItem('token', extractedToken);
            setAuthToken(extractedToken);
          }
          localStorage.setItem('clearance', 'L2_COMMAND');
          localStorage.setItem(
            'user',
            JSON.stringify({ name: String(name), role: 'ADMIN', clearance: 'L2_COMMAND', email })
          );
          window.dispatchEvent(new Event('storage'));
        }
        if (onSetClearance) onSetClearance('L2_COMMAND', String(name));
        if (onClose) onClose();
        if (typeof window !== 'undefined') {
          window.location.href = '/command';
        }
      } else {
        if (typeof window !== 'undefined') {
          const civilianToken = extractedToken || data.accessToken || data.token || data.access_token || data.jwt;
          if (civilianToken) {
            localStorage.setItem('accessToken', civilianToken);
            localStorage.setItem('auth_token', civilianToken);
            localStorage.setItem('token', civilianToken);
            setAuthToken(civilianToken);
          }
          localStorage.setItem('clearance', 'L1_CIVILIAN');
          localStorage.setItem(
            'user',
            JSON.stringify({ name: String(name), role: effectiveRole || 'CUSTOMER', clearance: 'L1_CIVILIAN', email })
          );
          window.dispatchEvent(new Event('storage'));
        }
        if (onSetClearance) onSetClearance('L1_CIVILIAN', String(name));
        if (onClose) onClose();
        if (typeof window !== 'undefined') {
          const targetDestination = (returnUrl && returnUrl !== '/') ? returnUrl : '/';
          window.location.href = targetDestination;
        }
      }
    },
    onError: (err) => {
      setErrorMessage(err.message || '[SYS_ERROR]: AUTHENTICATION_FAILED - CREDENTIALS_REJECTED');
    },
  });

  // Registration mutation sending POST request with { name, email, password } to /auth/register
  const registerMutation = useRegister({
    onSuccess: (data) => {
      const name = fullName.trim() || data.user?.name || email.split('@')[0].toUpperCase() || 'CIVILIAN';
      setErrorMessage(null);
      setIsRegisterMode(false);
      localStorage.setItem('clearance', 'L1_CIVILIAN');
      localStorage.setItem(
        'user',
        JSON.stringify({ name: String(name), role: 'CUSTOMER', clearance: 'L1_CIVILIAN', email })
      );
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
      if (onSetClearance) onSetClearance('L1_CIVILIAN', String(name));
      if (onClose) onClose();
      if (typeof window !== 'undefined') {
        const targetDestination = (returnUrl && returnUrl !== '/') ? returnUrl : '/';
        window.location.href = targetDestination;
      }
    },
    onError: (err) => {
      setErrorMessage(err.message || '[SYS_ERROR]: REGISTRATION_FAILED - COULD_NOT_INITIALIZE_CIVILIAN_CREDENTIALS');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('[SYS_ERROR]: EMAIL_AND_HARDWARE_HASH_REQUIRED');
      return;
    }

    if (isRegisterMode) {
      if (!fullName.trim()) {
        setErrorMessage('[SYS_ERROR]: FULL_NAME_DESIGNATION_REQUIRED');
        return;
      }
      setErrorMessage(null);
      registerMutation.mutate({
        name: fullName.trim(),
        email: email.trim(),
        password,
      });
    } else {
      setErrorMessage(null);
      loginMutation.mutate({
        email: email.trim(),
        password,
      });
    }
  };

  const handleToggleMode = () => {
    setErrorMessage(null);
    const newMode = !isRegisterMode;
    setIsRegisterMode(newMode);
    if (newMode) {
      setEmail('');
      setFullName('');
      setPassword('');
    } else {
      setEmail('operator@aerolock.com');
      setFullName('');
      setPassword('');
    }
  };

  const isPending = isRegisterMode ? registerMutation.isPending : loginMutation.isPending;

  const content = (
    <div className={`bg-[#0d1c2d] border-2 ${tier === 'L2_COMMAND' ? 'border-[#ffb4ab]' : 'border-[#00e5ff]'} w-full max-w-lg p-6 md:p-8 relative font-mono text-[#d4e4fa] shadow-2xl rounded-none space-y-6 transition-colors duration-200`}>
      {/* Corner Accents */}
      <div className={`absolute -top-1.5 -left-1.5 w-3 h-3 ${tier === 'L2_COMMAND' ? 'bg-[#ffb4ab]' : 'bg-[#00e5ff]'}`} />
      <div className={`absolute -top-1.5 -right-1.5 w-3 h-3 ${tier === 'L2_COMMAND' ? 'bg-[#ffb4ab]' : 'bg-[#00e5ff]'}`} />
      <div className={`absolute -bottom-1.5 -left-1.5 w-3 h-3 ${tier === 'L2_COMMAND' ? 'bg-[#ffb4ab]' : 'bg-[#00e5ff]'}`} />
      <div className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 ${tier === 'L2_COMMAND' ? 'bg-[#ffb4ab]' : 'bg-[#00e5ff]'}`} />

      {/* Header Section */}
      <div className="border-b border-[#3b494c] pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`font-bold text-lg uppercase tracking-widest ${tier === 'L2_COMMAND' ? 'text-[#ffb4ab]' : 'text-[#00e5ff]'}`}>
              {isRegisterMode ? 'CIVILIAN_ONBOARDING' : 'TERMINAL_AUTHENTICATION'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-[#849396] hover:text-[#d4e4fa] bg-transparent border-none cursor-pointer p-0 flex items-center"
                title="CLOSE_MODAL"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert Display */}
      {(errorMessage || loginMutation.isError || registerMutation.isError) && (
        <div className="p-3 border-2 border-[#ffb4ab] bg-[#ffb4ab]/10 text-[#ffb4ab] text-xs font-mono font-bold uppercase tracking-wider rounded-none flex items-center gap-2">
          <span className="material-symbols-outlined text-sm shrink-0">
            warning
          </span>
          <span>
            {errorMessage || '[SYS_ERROR]: AUTHENTICATION_FAILED - CREDENTIALS_REJECTED'}
          </span>
        </div>
      )}

      {/* Authentication Form */}
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {isRegisterMode ? (
          /* Registration Mode Fields */
          <>
            <div>
              <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px] font-mono">
                FULL NAME
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="INPUT_FULL_NAME"
                disabled={isPending}
                required
                className="w-full bg-[#122131] border border-[#3b494c] p-3 text-[#00e5ff] font-mono tracking-wider focus:border-[#00e5ff] focus:outline-none uppercase rounded-none transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px] font-mono">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="SECURE_CHANNEL@DOMAIN.COM"
                disabled={isPending}
                required
                className="w-full bg-[#122131] border border-[#3b494c] p-3 text-[#00e5ff] font-mono tracking-wider focus:border-[#00e5ff] focus:outline-none rounded-none transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px] font-mono">
                ASSIGN PASSKEY HARDWARE HASH
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isPending}
                  required
                  className="w-full bg-[#122131] border border-[#3b494c] p-3 pr-10 text-[#d4e4fa] font-mono tracking-wider focus:border-[#00e5ff] focus:outline-none rounded-none transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isPending}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#849396] hover:text-[#00e5ff] bg-transparent border-none cursor-pointer p-1"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Login Mode Fields */
          <>
            {/* Binary Clearance Tier Radio Selector */}
            <div>
              <label className="block text-[#849396] font-bold uppercase tracking-widest mb-2 text-[11px] font-mono">
                CLEARANCE_TIER_SELECTION
              </label>
              <div className="grid grid-cols-1 gap-2.5">
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
          </>
        )}

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
                <span>{isRegisterMode ? 'INITIALIZING_REGISTRATION...' : 'VERIFYING_CLEARANCE...'}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">
                  verified_user
                </span>
                <span>
                  {isRegisterMode
                    ? 'INITIALIZE_REGISTRATION'
                    : tier === 'L2_COMMAND'
                    ? 'AUTHENTICATE_COMMAND_SESSION'
                    : 'AUTHENTICATE_CIVILIAN_SESSION'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Switch Mode Trigger */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleToggleMode}
            className="text-[#849396] hover:text-[#00e5ff] cursor-pointer text-[11px] font-mono border-none bg-transparent uppercase tracking-wider transition-colors"
          >
            {isRegisterMode
              ? '[ // RETURN_TO_LOGIN ]'
              : '[ // REQUEST_NEW_CIVILIAN_REGISTRATION ]'}
          </button>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md flex items-center justify-center p-4 selection:bg-[#00e5ff] selection:text-[#051424]">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] font-mono flex items-center justify-center p-4 selection:bg-[#00e5ff] selection:text-[#051424]">
      {content}
    </div>
  );
};

export default AuthForm;
