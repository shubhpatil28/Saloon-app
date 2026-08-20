import React from 'react';
import { X, Send, MessageSquare, CheckCheck, Sparkles } from 'lucide-react';

interface WhatsAppPreviewModalProps {
  isOpen: boolean;
  phone: string;
  customerName: string;
  message: string;
  type: string;
  onClose: () => void;
}

export const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({
  isOpen,
  phone,
  customerName,
  message,
  type,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleOpenLiveWhatsApp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    onClose();
  };

  return (
    <div
      id="whatsapp-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="whatsapp-modal-card"
        className="bg-[#F9F8F4] border border-[#E2E1D8] text-[#4A4A40] rounded-[28px] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-[#5A5A40] px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#474732] flex items-center justify-center text-white font-bold shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-semibold text-sm">WhatsApp Business API Preview</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D4A373] text-white">
                  {type}
                </span>
              </div>
              <p className="text-xs text-[#E2E1D8]">Recipient: {customerName} ({phone})</p>
            </div>
          </div>
          <button
            id="btn-close-whatsapp-preview"
            onClick={onClose}
            className="text-[#E2E1D8] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Chat Simulation UI */}
        <div className="p-5 bg-[#F9F8F4] relative min-h-[260px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-center">
              <span className="text-[10px] text-[#8C8C70] bg-[#EDEDE9] px-3 py-0.5 rounded-full">
                Today, 09:00 AM • Automated Dispatch Engine
              </span>
            </div>

            {/* Simulated Bubble */}
            <div className="max-w-[85%] bg-white border border-[#E2E1D8] p-4 rounded-[20px] rounded-tl-sm text-sm text-[#4A4A40] shadow-sm space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[#5A5A40] font-semibold border-b border-[#EDECE4] pb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>SalonOS Automation Bot</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-xs text-[#4A4A40]">{message}</p>
              <div className="flex items-center justify-end gap-1 text-[10px] text-[#8C8C70]">
                <span>09:01 AM</span>
                <CheckCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-[#E2E1D8] flex items-center gap-3">
            <button
              id="btn-dismiss-whatsapp"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-full border border-[#E2E1D8] hover:bg-[#EDEDE9] text-xs font-medium text-[#4A4A40] transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-launch-whatsapp"
              onClick={handleOpenLiveWhatsApp}
              className="flex-1 py-2.5 px-3 rounded-full bg-[#6B705C] hover:bg-[#585D4A] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open in WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
