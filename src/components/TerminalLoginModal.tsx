'use client';

import React from 'react';
import { ClearanceLevel } from '../types';
import { AuthForm } from './AuthForm';

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
  if (!isOpen) return null;

  return (
    <AuthForm
      isModal={true}
      onClose={onClose}
      initialTier={currentLevel === 'L1_CIVILIAN' ? 'L1_CIVILIAN' : 'L2_COMMAND'}
      onSetClearance={onSetClearance}
    />
  );
};

export default TerminalLoginModal;
