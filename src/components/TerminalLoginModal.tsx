'use client';

import React, { useState } from 'react';
import { ClearanceLevel } from '../types';
import { useLogin } from '../hooks/useLogin';
import { useRegister } from '../hooks/useRegister';

interface TerminalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: ClearanceLevel;
  onSetClearance: (level: ClearanceLevel, name: string) => void;
}

export const TerminalLoginModal: React.FC<TerminalLoginModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onSetClearance,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('operator@aerolock.com');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<ClearanceLevel>(
    currentLevel === 'L1_CIVILIAN' ? 'L1_CIVILIAN' : 'L2_COMMAND'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authentication mutation for existing operator login
  const loginMutation = useLogin({
    onSuccess: (data) => {
      const name = data.user?.name || email.split('@')[0].toUpperCase() || 'OPERATOR';
      onSetClearance(selectedLevel, name);
      setErrorMessage(null);
      onClose();
    },
    onError: (err) => {
      setErrorMessage(err.message || 'AUTHENTICATION_FAILURE: INVALID_CREDENTIALS_OR_SOCKET_DISCONNECT');
    },
  });

  // Registration mutation sending POST request with { name, email, password } to /auth/register
  const registerMutation = useRegister({
    onSuccess: (data) => {
      const name = fullName.trim() || data.user?.name || email.split('@')[0].toUpperCase() || 'CIVILIAN';
      onSetClearance('L1_CIVILIAN', name);
      setErrorMessage(null);
      setIsRegisterMode(false);
      onClose();
    },
    onError: (err) => {
      setErrorMessage(err.message || 'REGISTRATION_FAILURE: COULD_NOT_INITIALIZE_CIVILIAN_CREDENTIALS');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('INPUT_ERROR: EMAIL_AND_HARDWARE_HASH_REQUIRED');
      return;
    }

    if (isRegisterMode) {
      if (!fullName) {
        setErrorMessage('INPUT_ERROR: FULL_NAME_DESIGNATION_REQUIRED');
        return;
      }
      setErrorMessage(null);
      // Calls API POST /auth/register with payload { name, email, password }
      registerMutation.mutate({
        name: fullName,
        email,
        password,
      });
    } else {
      setErrorMessage(null);
      // Calls API POST /auth/login with payload { email, password }
      loginMutation.mutate({
        email,
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

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md flex items-center justify-center p-4 selection:bg-[#00e5ff] selection:text-[#051424]">
      {/* Outer Tactical Modal Frame */}
      <div className="bg-[#0d1c2d] border-2 border-[#00e5ff] w-full max-w-lg p-6 relative font-mono text-[#d4e4fa] shadow-2xl rounded-none space-y-5">
        {/* Corner Accents */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#00e5ff]" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#00e5ff]" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#00e5ff]" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#00e5ff]" />

        {/* Modal Header Bar */}
        <div className="border-b border-[#3b494c] pb-3 space-y-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-base uppercase tracking-widest text-[#00e5ff]">
                {isRegisterMode ? 'CIVILIAN_ONBOARDING' : 'TERMINAL_AUTHENTICATION'}
              </h3>
              <p className="text-xs text-[#849396] tracking-wider uppercase">
                {isRegisterMode ? '// L1_REGISTRATION' : '// CLEARANCE_VERIFICATION'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-red-950/80 border border-red-500/60 text-red-400 text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-none">
                <span className="material-symbols-outlined text-xs">lock</span>
                SECURE_LINK
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-[#849396] hover:text-[#00e5ff] bg-transparent border-none cursor-pointer p-0 flex items-center"
                title="CLOSE_MODAL"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>

          <div className="text-[10px] text-[#849396] tracking-widest uppercase text-right">
            SYSTEM_VERIFICATION_REQUIRED
          </div>
        </div>

        {/* Error Alert Display */}
        {errorMessage && (
          <div className="p-2.5 border border-red-500 bg-red-950/50 text-red-400 text-xs font-mono uppercase tracking-wider rounded-none">
            ⚠ {errorMessage}
          </div>
        )}

        {/* Pre-locked Clearance Badge for Registration Mode */}
        {isRegisterMode && (
          <div className="bg-[#122131] border border-[#00e5ff] p-3 flex items-center justify-between text-xs tracking-wider rounded-none">
            <div className="flex items-center gap-2 text-[#00e5ff] font-bold">
              <span className="material-symbols-outlined text-base">lock</span>
              <span>CLEARANCE_STATUS: L1_CIVILIAN</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
          </div>
        )}

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegisterMode ? (
            /* Registration Mode Fields */
            <>
              <div>
                <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px]">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="INPUT_FULL_NAME"
                  required
                  className="w-full bg-[#122131] border border-[#3b494c] p-2.5 text-[#00e5ff] font-mono tracking-wider focus:border-[#00e5ff] focus:outline-none uppercase rounded-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px]">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="SECURE_CHANNEL@DOMAIN.COM"
                  required
                  className="w-full bg-[#122131] border border-[#3b494c] p-2.5 text-[#00e5ff] font-mono tracking-wider focus:border-[#00e5ff] focus:outline-none rounded-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px]">
                  ASSIGN PASSKEY HARDWARE HASH
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#122131] border border-[#3b494c] p-2.5 pr-10 text-[#d4e4fa] font-mono tracking-wider focus:border-[#00e5ff] focus:outline-none rounded-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#849396] hover:text-[#00e5ff] bg-transparent border-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Authentication / Login Mode Fields */
            <>
              <div>
                <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px]">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@aerolock.com"
                  required
                  className="w-full bg-[#122131] border border-[#3b494c] p-2.5 text-[#00e5ff] font-mono tracking-wider focus:border-[#00e5ff] focus:outline-none rounded-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#849396] font-bold uppercase tracking-widest mb-1.5 text-[11px]">
                  SELECT CLEARANCE TIER
                </label>
                <div className="space-y-2">
                  <div
                    onClick={() => setSelectedLevel('L1_CIVILIAN')}
                    className={`p-3 border cursor-pointer flex justify-between items-center rounded-none transition-colors ${
                      selectedLevel === 'L1_CIVILIAN'
                        ? 'border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff]'
                        : 'border-[#3b494c] bg-[#122131] text-[#bac9cc] hover:border-[#849396]'
                    }`}
                  >
                    <div>
                      <div className="font-bold tracking-wider">L1_CIVILIAN (Standard User)</div>
                      <div className="text-[10px] text-[#849396]">
                        Read-only public logistics & schedule telemetry
                      </div>
                    </div>
                    {selectedLevel === 'L1_CIVILIAN' && (
                      <span className="material-symbols-outlined text-base">check_circle</span>
                    )}
                  </div>

                  <div
                    onClick={() => setSelectedLevel('L2_COMMAND')}
                    className={`p-3 border cursor-pointer flex justify-between items-center rounded-none transition-colors ${
                      selectedLevel === 'L2_COMMAND'
                        ? 'border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff]'
                        : 'border-[#3b494c] bg-[#122131] text-[#bac9cc] hover:border-[#849396]'
                    }`}
                  >
                    <div>
                      <div className="font-bold tracking-wider">L2_COMMAND (Admin)</div>
                      <div className="text-[10px] text-[#849396]">
                        Flight vector routing, stealth fleet & cargo clearance
                      </div>
                    </div>
                    {selectedLevel === 'L2_COMMAND' && (
                      <span className="material-symbols-outlined text-base">check_circle</span>
                    )}
                  </div>
                </div>
              </div>

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
                    required
                    className="w-full bg-[#122131] border border-[#3b494c] p-2.5 pr-10 text-[#d4e4fa] font-mono tracking-wider focus:border-[#00e5ff] focus:outline-none rounded-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#849396] hover:text-[#00e5ff] bg-transparent border-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#00e5ff] text-[#051424] font-bold p-3 text-xs tracking-widest uppercase hover:bg-[#00cbe3] active:bg-[#00b0c7] disabled:opacity-50 cursor-pointer rounded-none border-none transition-colors"
            >
              {isPending
                ? isRegisterMode
                  ? 'INITIALIZING_REGISTRATION...'
                  : 'AUTHENTICATING_SESSION...'
                : isRegisterMode
                ? 'INITIALIZE_REGISTRATION'
                : 'AUTHENTICATE_SESSION'}
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

        {/* Tactical Footer Metrics Line */}
        <div className="border-t border-[#3b494c]/60 pt-3 flex justify-between items-center text-[10px] text-[#849396] tracking-widest">
          <div className="flex items-center gap-1.5">
            <span className="text-[#00e5ff] font-bold">[SYS]</span>
            <span>AWAITING_INPUT...</span>
            <span className="w-2 h-3 bg-[#00e5ff] animate-pulse inline-block" />
          </div>
          <div className="flex gap-3">
            <span>PORT_8880 // SECURE_SOCKET_LAYER</span>
            <span>LATENCY: 12ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
