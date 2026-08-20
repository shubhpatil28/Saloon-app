import React from 'react';
import { useSalon } from '../../context/SalonContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useSalon();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#5A5A40] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#D4A373] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#6B705C] shrink-0" />,
  };

  const borderColors = {
    success: 'border-[#5A5A40]/30 bg-[#F9F8F4] text-[#4A4A40] shadow-lg',
    error: 'border-[#D4A373]/30 bg-[#F9F8F4] text-[#4A4A40] shadow-lg',
    info: 'border-[#6B705C]/30 bg-[#F9F8F4] text-[#4A4A40] shadow-lg',
  };

  return (
    <div
      id="salonos-toast-container"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      <div
        id={`toast-${toast.id}`}
        className={`flex items-start gap-3 p-4 rounded-2xl border ${borderColors[toast.type]}`}
      >
        {icons[toast.type]}
        <div className="flex-1">
          <h4 className="text-sm font-serif font-semibold tracking-tight text-[#35352C]">{toast.title}</h4>
          <p className="text-xs text-[#6B705C] mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          id="btn-toast-dismiss"
          onClick={dismissToast}
          className="text-[#8C8C70] hover:text-[#4A4A40] transition-colors p-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
