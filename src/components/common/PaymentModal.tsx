import React, { useState } from 'react';
import { formatINR } from '../../lib/utils';
import { ShieldCheck, QrCode, Smartphone, CreditCard, Landmark, CheckCircle, Loader2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  amount: number;
  title: string;
  description: string;
  onSuccess: (paymentReference: string) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  amount,
  title,
  description,
  onSuccess,
  onClose,
}) => {
  const [method, setMethod] = useState<'UPI_QR' | 'UPI_APP' | 'CARD' | 'NETBANKING'>('UPI_QR');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'SELECT' | 'PROCESSING' | 'SUCCESS'>('SELECT');
  const [upiId, setUpiId] = useState('shubham@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');

  if (!isOpen) return null;

  const handlePay = () => {
    setProcessing(true);
    setStep('PROCESSING');

    // Simulate verified Razorpay order verification & signature verification
    setTimeout(() => {
      setProcessing(false);
      setStep('SUCCESS');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      const paymentRef = `pay_rzp_${Math.random().toString(36).substring(2, 10)}`;
      setTimeout(() => {
        onSuccess(paymentRef);
        onClose();
        setStep('SELECT');
      }, 1400);
    }, 1600);
  };

  return (
    <div
      id="payment-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="payment-modal-card"
        className="bg-[#F9F8F4] border border-[#E2E1D8] rounded-[28px] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-[#5A5A40] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#474732] flex items-center justify-center text-[#D4A373] font-serif font-bold text-lg">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-semibold text-base">{title}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D4A373] text-white">
                  Razorpay Verified
                </span>
              </div>
              <p className="text-xs text-[#E2E1D8]">{description}</p>
            </div>
          </div>
          <button
            id="btn-close-payment"
            onClick={onClose}
            className="text-[#E2E1D8] hover:text-white p-1 rounded-full hover:bg-[#474732] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'SELECT' && (
            <div className="space-y-5">
              {/* Amount Display */}
              <div className="p-4 rounded-[20px] bg-white border border-[#E2E1D8] flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs text-[#8C8C70] font-medium">Total Payable</span>
                  <div className="text-2xl font-serif font-bold text-[#35352C] tracking-tight">
                    {formatINR(amount)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#5A5A40] bg-[#EDEDE9] px-3 py-1 rounded-full border border-[#E2E1D8]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-Bit SSL</span>
                </div>
              </div>

              {/* Methods Tabs */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  id="tab-pay-qr"
                  onClick={() => setMethod('UPI_QR')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-medium transition-all ${
                    method === 'UPI_QR'
                      ? 'border-[#5A5A40] bg-[#5A5A40] text-white shadow-sm'
                      : 'border-[#E2E1D8] bg-white hover:bg-[#EDEDE9] text-[#4A4A40]'
                  }`}
                >
                  <QrCode className="w-5 h-5 mb-1" />
                  <span>UPI QR</span>
                </button>
                <button
                  id="tab-pay-app"
                  onClick={() => setMethod('UPI_APP')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-medium transition-all ${
                    method === 'UPI_APP'
                      ? 'border-[#5A5A40] bg-[#5A5A40] text-white shadow-sm'
                      : 'border-[#E2E1D8] bg-white hover:bg-[#EDEDE9] text-[#4A4A40]'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mb-1" />
                  <span>UPI Apps</span>
                </button>
                <button
                  id="tab-pay-card"
                  onClick={() => setMethod('CARD')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-medium transition-all ${
                    method === 'CARD'
                      ? 'border-[#5A5A40] bg-[#5A5A40] text-white shadow-sm'
                      : 'border-[#E2E1D8] bg-white hover:bg-[#EDEDE9] text-[#4A4A40]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1" />
                  <span>Card</span>
                </button>
                <button
                  id="tab-pay-netbanking"
                  onClick={() => setMethod('NETBANKING')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-medium transition-all ${
                    method === 'NETBANKING'
                      ? 'border-[#5A5A40] bg-[#5A5A40] text-white shadow-sm'
                      : 'border-[#E2E1D8] bg-white hover:bg-[#EDEDE9] text-[#4A4A40]'
                  }`}
                >
                  <Landmark className="w-5 h-5 mb-1" />
                  <span>Netbank</span>
                </button>
              </div>

              {/* Method Details */}
              {method === 'UPI_QR' && (
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-dashed border-[#E2E1D8]">
                  <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-sm border border-[#E2E1D8] flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=salonos@icici%26pn=SalonOS%26am=${amount}%26cu=INR`}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs text-[#8C8C70] mt-2.5 font-medium">
                    Scan with GPay, PhonePe, Paytm or BHIM
                  </span>
                </div>
              )}

              {method === 'UPI_APP' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4A4A40] mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#E2E1D8] bg-white text-[#35352C] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8C8C70]">
                    <span className="px-2.5 py-1 bg-white border border-[#E2E1D8] rounded-full font-semibold text-[#4A4A40]">GPay</span>
                    <span className="px-2.5 py-1 bg-white border border-[#E2E1D8] rounded-full font-semibold text-[#4A4A40]">PhonePe</span>
                    <span className="px-2.5 py-1 bg-white border border-[#E2E1D8] rounded-full font-semibold text-[#4A4A40]">Paytm</span>
                  </div>
                </div>
              )}

              {method === 'CARD' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4A4A40] mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 0000 0000 0000"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#E2E1D8] bg-white text-[#35352C] focus:ring-2 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#4A4A40] mb-1">Expiry</label>
                      <input
                        type="text"
                        defaultValue="08/28"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-[#E2E1D8] bg-white text-[#35352C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#4A4A40] mb-1">CVV</label>
                      <input
                        type="password"
                        defaultValue="882"
                        placeholder="•••"
                        maxLength={3}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-[#E2E1D8] bg-white text-[#35352C]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'NETBANKING' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#4A4A40] mb-1">
                    Select Popular Bank
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                      <label
                        key={bank}
                        className="flex items-center gap-2 p-2 rounded-xl border border-[#E2E1D8] bg-white hover:bg-[#EDEDE9] cursor-pointer"
                      >
                        <input type="radio" name="bank" defaultChecked={bank === 'HDFC Bank'} className="accent-[#5A5A40]" />
                        <span className="truncate text-[#4A4A40] font-medium">{bank}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                id="btn-confirm-payment"
                onClick={handlePay}
                className="w-full py-3 px-4 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Authorize Payment of {formatINR(amount)}</span>
              </button>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-12 h-12 text-[#5A5A40] animate-spin" />
              <div>
                <h4 className="font-serif text-base font-semibold text-[#35352C]">
                  Verifying Razorpay Order & Signature...
                </h4>
                <p className="text-xs text-[#8C8C70] mt-1">
                  Communicating with bank payment gateway. Please do not refresh.
                </p>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#EDEDE9] text-[#5A5A40] flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#35352C]">Payment Authorized!</h4>
              <p className="text-xs text-[#8C8C70]">Transaction verified successfully.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
