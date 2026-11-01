import React from 'react';
import { ShieldCheck, Lock, Trash2, Cpu, Server, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PrivacySecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearSession: () => void;
}

export const PrivacySecurityModal: React.FC<PrivacySecurityModalProps> = ({
  isOpen,
  onClose,
  onClearSession,
}) => {
  if (!isOpen) return null;

  const handlePurge = () => {
    if (window.confirm("Are you sure you want to discard your current scan, makeup choices, and uploaded photos? This cannot be undone.")) {
      onClearSession();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-neutral-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100/60 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-neutral-900 dark:text-neutral-100">
                Biometric Privacy & Data Security
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Your face data belongs solely to you
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Main Privacy Notice */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 space-y-3">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              Privacy Principles
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              We treat facial imagery as sensitive personal biometric data. The Satguru Virtual Beauty Studio is engineered with privacy-by-design principles:
            </p>

            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No Permanent Storage:</strong> Images and mesh models are never permanently saved to any database.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No Face Images in Logs:</strong> System server logs never write or retain personal facial images.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No Account Needed:</strong> Try looks anonymously without logins, email collections, or cookies.</span>
              </li>
            </ul>
          </div>

          {/* Architecture: Local vs Backend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl border border-rose-100 dark:border-neutral-800 bg-rose-50/30 dark:bg-neutral-800/30">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">
                <Cpu className="w-4 h-4 text-rose-500" />
                In-Browser Processing
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Mode A (Quick Makeup) and biometric facial landmark extraction run 100% locally on your device using WebAssembly & WebGL. No photo data leaves your browser.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/30">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">
                <Server className="w-4 h-4 text-amber-500" />
                Reconstruction Backend
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                If connecting to an optional GPU reconstruction cluster for Mode B, frames are encrypted, processed in memory, and immediately purged upon GLB transmission.
              </p>
            </div>
          </div>

          {/* Purge Session Box */}
          <div className="p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Clear Session & Discard Data
              </div>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                Immediately erases your uploaded photos, landmark points, 3D meshes, and color history from browser memory.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePurge}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm shrink-0 transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Discard Session
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900 border-t border-rose-100/60 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-200/80 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
