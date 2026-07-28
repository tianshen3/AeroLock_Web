import React from 'react';

interface Toast {
  id: string;
  type: 'INFO' | 'WARN' | 'SUCCESS' | 'ALERT';
  text: string;
}

interface AtmosphericOverlayProps {
  toasts: Toast[];
  onDismissToast: (id: string) => void;
}

export const AtmosphericOverlay: React.FC<AtmosphericOverlayProps> = ({
  toasts,
  onDismissToast,
}) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 font-mono">
      {/* Top right notification toasts container */}
      <div className="pointer-events-auto self-end space-y-2 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => onDismissToast(t.id)}
            className={`p-3 border shadow-lg cursor-pointer transition-all flex items-center justify-between text-xs rounded-none ${
              t.type === 'ALERT'
                ? 'bg-red-950/90 border-[#ffb4ab] text-[#ffb4ab]'
                : t.type === 'SUCCESS'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                : t.type === 'WARN'
                ? 'bg-amber-950/90 border-amber-500 text-amber-300'
                : 'bg-[#0d1c2d]/90 border-[#00e5ff] text-[#00e5ff]'
            }`}
          >
            <span className="font-bold tracking-wider uppercase font-mono">{t.text}</span>
            <span className="text-[10px] ml-2 opacity-70 font-mono">[DISMISS]</span>
          </div>
        ))}
      </div>
    </div>
  );
};
