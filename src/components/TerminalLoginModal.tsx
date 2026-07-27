'use client';

import React, { useState } from 'react';
import { ClearanceLevel } from '../types';
import { useLogin } from '../hooks/useLogin';

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
  const [email, setEmail] = useState('operator@aerolock.com');
  const [password, setPassword] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<ClearanceLevel>(
    currentLevel === 'L1_CIVILIAN' ? 'L1_CIVILIAN' : 'L2_COMMAND'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useLogin({
    onSuccess: () => {
      const name = email.split('@')[0] || 'OPERATOR';
      onSetClearance(selectedLevel, name);
      setErrorMessage(null);
      onClose();
    },
    onError: (err) => {
      setErrorMessage(err.message || 'API login failed. Please check backend connection.');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }
    setErrorMessage(null);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d1c2d] border-2 border-[#00e5ff] w-full max-w-md p-6 relative font-mono text-[#d4e4fa] shadow-2xl space-y-6">
        {/* Corner Accents */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00e5ff]"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00e5ff]"></div>

        <div className="flex justify-between items-center border-b border-[#3b494c] pb-3">
          <div className="flex items-center gap-2 text-[#00e5ff]">
            <span className="material-symbols-outlined">terminal</span>
            <h3 className="font-bold text-base uppercase tracking-wider">TERMINAL_AUTHENTICATION</h3>
          </div>
          <button type="button" onClick={onClose} className="text-[#849396] hover:text-[#00e5ff]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-2 border border-red-500 bg-red-950/40 text-red-400 text-xs font-mono">
            ⚠ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#849396] font-bold uppercase mb-1">Operator Designation</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@aerolock.com"
              required
              className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#00e5ff] font-bold focus:border-[#00e5ff] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#849396] font-bold uppercase mb-1">Select Security Clearance Level</label>
            <div className="space-y-2">
              <div
                onClick={() => setSelectedLevel('L1_CIVILIAN')}
                className={`p-3 border cursor-pointer flex justify-between items-center ${
                  selectedLevel === 'L1_CIVILIAN'
                    ? 'border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff]'
                    : 'border-[#3b494c] bg-[#122131] text-[#bac9cc]'
                }`}
              >
                <div>
                  <div className="font-bold">L1_CIVILIAN (Standard User)</div>
                  <div className="text-[10px] text-[#849396]">Read-only public logistics & schedule telemetry</div>
                </div>
                {selectedLevel === 'L1_CIVILIAN' && <span className="material-symbols-outlined">check_circle</span>}
              </div>

              <div
                onClick={() => setSelectedLevel('L2_COMMAND')}
                className={`p-3 border cursor-pointer flex justify-between items-center ${
                  selectedLevel === 'L2_COMMAND'
                    ? 'border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff]'
                    : 'border-[#3b494c] bg-[#122131] text-[#bac9cc]'
                }`}
              >
                <div>
                  <div className="font-bold">L2_COMMAND (Admin)</div>
                  <div className="text-[10px] text-[#849396]">Flight vector routing, stealth fleet & cargo clearance</div>
                </div>
                {selectedLevel === 'L2_COMMAND' && <span className="material-symbols-outlined">check_circle</span>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[#849396] font-bold uppercase mb-1">Passkey Hardware Hash</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#d4e4fa] focus:border-[#00e5ff] focus:outline-none"
            />
          </div>

          <div className="pt-2 border-t border-[#3b494c] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#3b494c] px-4 py-2 text-[#849396] hover:text-[#d4e4fa]"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="bg-[#00e5ff] text-[#051424] font-bold px-6 py-2 uppercase hover:bg-[#00daf3] disabled:opacity-50"
            >
              {loginMutation.isPending ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


