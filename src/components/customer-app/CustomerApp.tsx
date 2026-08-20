import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { formatINR, formatDate } from '../../lib/utils';
import { BookingModal } from '../booking-flow/BookingModal';
import { PaymentModal } from '../common/PaymentModal';
import {
  Home,
  Calendar,
  Scissors,
  Wallet,
  Gift,
  User,
  Sparkles,
  ArrowRight,
  Clock,
  Plus,
  Share2,
  Copy,
  Check,
  Star,
  Download,
  AlertCircle,
  TrendingUp,
  Tag,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CustomerApp: React.FC = () => {
  const {
    activeSalon,
    activeCustomer,
    bookings,
    services,
    offers,
    walletLedger,
    rechargeWallet,
    redeemLoyaltyPoints,
    cancelBooking,
    addToast,
  } = useSalon();

  // Tab State: 'HOME' | 'BOOKINGS' | 'SERVICES' | 'WALLET' | 'REWARDS' | 'PROFILE'
  const [activeTab, setActiveTab] = useState<'HOME' | 'BOOKINGS' | 'SERVICES' | 'WALLET' | 'REWARDS' | 'PROFILE'>('HOME');

  // Booking Modal
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Recharge Modal
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(500);

  // Review Modal State
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  const customerBookings = (bookings || []).filter(
    (b) => b.customerId === activeCustomer?.id && b.salonId === activeSalon?.id
  );

  const upcomingBookings = customerBookings.filter((b) =>
    ['CONFIRMED', 'IN_PROGRESS', 'PENDING'].includes(b.status)
  );

  const pastBookings = customerBookings.filter((b) =>
    ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.status)
  );

  const customerLedger = (walletLedger || []).filter(
    (w) => w.customerId === activeCustomer?.id && w.salonId === activeSalon?.id
  );

  const handleCopyReferral = () => {
    navigator.clipboard?.writeText(activeCustomer.referralCode);
    addToast('Referral Code Copied!', `Code ${activeCustomer.referralCode} copied to clipboard.`);
  };

  const handleShareReferralWhatsApp = () => {
    const text = encodeURIComponent(
      `Get ₹100 instant cashback on your first haircut at ${activeSalon.name}! Use my referral code: ${activeCustomer.referralCode}. Book here: https://salonos.app/s/${activeSalon.slug}?ref=${activeCustomer.referralCode}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleRechargeSuccess = (paymentRef: string) => {
    rechargeWallet(activeCustomer.id, rechargeAmount, paymentRef);
  };

  const handleRedeemPoints = (points: number, rewardDesc: string) => {
    try {
      redeemLoyaltyPoints(activeCustomer.id, points, rewardDesc);
      confetti({ particleCount: 70, spread: 60 });
    } catch (err: any) {
      addToast('Redemption Failed', err?.message || 'Not enough points', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E4D9] text-[#4A4A40] flex justify-center pb-24 font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Mobile Wrapper Container (Max 480px width for true native PWA experience) */}
      <div className="w-full max-w-md bg-[#F9F8F4] min-h-screen shadow-xl border-x border-[#E2E1D8] flex flex-col relative">
        {/* App Topbar */}
        <header className="p-4 bg-[#F1F0E8]/95 backdrop-blur-md sticky top-0 z-30 border-b border-[#E2E1D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={activeSalon.logo}
              alt={activeSalon.name}
              className="w-9 h-9 rounded-full object-cover border border-[#E2E1D8]"
            />
            <div>
              <h2 className="font-serif font-bold text-sm text-[#35352C] tracking-tight">{activeSalon.name}</h2>
              <p className="text-[10px] text-[#6B705C] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B705C] animate-pulse" />
                Salon Open for Booking
              </p>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('WALLET')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E2E1D8] text-xs cursor-pointer hover:border-[#5A5A40] transition-colors shadow-sm"
          >
            <Wallet className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span className="font-bold text-[#5A5A40]">{formatINR(activeCustomer.walletBalance)}</span>
          </div>
        </header>

        {/* Tab Content Area */}
        <main className="p-4 flex-1 space-y-5">
          {/* TAB 1: HOME */}
          {activeTab === 'HOME' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* SMART REVISIT REMINDER CARD */}
              <div
                id="card-smart-reminder"
                className="p-5 rounded-[28px] bg-[#F1F0E8] border border-[#D4A373]/60 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4A373]/20 text-[#5A5A40] border border-[#D4A373]/30">
                      <Sparkles className="w-3 h-3 text-[#D4A373]" />
                      <span>Smart Haircut Reminder</span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#35352C] pt-1">
                      Hey {activeCustomer.name.split(' ')[0]} 👋
                    </h3>
                    <p className="text-xs text-[#4A4A40] leading-relaxed max-w-[260px]">
                      It's been <span className="font-bold text-[#5A5A40]">25 days</span> since your last haircut. Time for a sharp refresh!
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E1D8] flex items-center justify-between">
                  <span className="text-[11px] text-[#8C8C70] font-medium">Quick Slot: Tomorrow, 11:00 AM</span>
                  <button
                    id="btn-reminder-book"
                    onClick={() => setIsBookingOpen(true)}
                    className="px-4 py-2 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow flex items-center gap-1 transition-transform active:scale-95"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Balances Grid (Wallet & Loyalty Points) */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setActiveTab('WALLET')}
                  className="p-4 rounded-[24px] bg-white border border-[#E2E1D8] hover:border-[#5A5A40] cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between text-[#8C8C70]">
                    <span className="text-[11px] font-medium">Salon Wallet</span>
                    <Wallet className="w-4 h-4 text-[#5A5A40]" />
                  </div>
                  <div className="text-xl font-serif font-bold text-[#35352C] mt-1.5">
                    {formatINR(activeCustomer.walletBalance)}
                  </div>
                  <span className="text-[10px] text-[#5A5A40] font-semibold mt-1 inline-block">
                    + Top Up Balance
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab('REWARDS')}
                  className="p-4 rounded-[24px] bg-white border border-[#E2E1D8] hover:border-[#5A5A40] cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between text-[#8C8C70]">
                    <span className="text-[11px] font-medium">Loyalty Points</span>
                    <Gift className="w-4 h-4 text-[#D4A373]" />
                  </div>
                  <div className="text-xl font-serif font-bold text-[#D4A373] mt-1.5">
                    {activeCustomer.loyaltyPoints} <span className="text-xs font-sans font-normal text-[#8C8C70]">pts</span>
                  </div>
                  <span className="text-[10px] text-[#D4A373] font-semibold mt-1 inline-block">
                    Redeem Discounts
                  </span>
                </div>
              </div>

              {/* Upcoming Appointment Widget (if any) */}
              {upcomingBookings.length > 0 && (
                <div className="p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8C8C70]">Upcoming Visit</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDEDE9] text-[#5A5A40]">
                      {upcomingBookings[0].status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#35352C]">
                      {upcomingBookings[0].services.map((s) => s.name).join(' + ')}
                    </h4>
                    <p className="text-xs text-[#8C8C70] mt-0.5">
                      Stylist: <span className="text-[#4A4A40] font-medium">{upcomingBookings[0].staffName}</span>
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[#5A5A40] font-medium mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {upcomingBookings[0].appointmentDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {upcomingBookings[0].appointmentTime}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Book Again Services */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#8C8C70]">Popular Services</h4>
                  <button
                    onClick={() => setActiveTab('SERVICES')}
                    className="text-xs text-[#5A5A40] font-semibold flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {services.slice(0, 3).map((srv) => (
                    <div
                      key={srv.id}
                      className="p-3.5 rounded-2xl bg-white border border-[#E2E1D8] flex items-center justify-between hover:bg-[#F1F0E8] transition-colors shadow-sm"
                    >
                      <div>
                        <h5 className="font-serif font-bold text-xs text-[#35352C]">{srv.name}</h5>
                        <p className="text-[11px] text-[#8C8C70] flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-[#4A4A40]">{formatINR(srv.price)}</span>
                          <span>•</span>
                          <span>{srv.duration} mins</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setIsBookingOpen(true)}
                        className="px-3.5 py-1.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referral Banner */}
              <div className="p-5 rounded-[28px] bg-[#F1F0E8] border border-[#E2E1D8] space-y-3">
                <div className="flex items-center gap-2 text-[#5A5A40] font-serif font-bold text-sm">
                  <Share2 className="w-4 h-4 text-[#D4A373]" />
                  <span>Refer Friends, Earn ₹100 Each!</span>
                </div>
                <p className="text-xs text-[#4A4A40]">
                  Share code <strong className="text-[#35352C] bg-white border border-[#E2E1D8] px-2 py-0.5 rounded-md font-mono">{activeCustomer.referralCode}</strong> with friends.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyReferral}
                    className="flex-1 py-2.5 rounded-full bg-white border border-[#E2E1D8] hover:bg-[#EDEDE9] text-xs font-semibold text-[#4A4A40] flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Copy Code</span>
                  </button>
                  <button
                    onClick={handleShareReferralWhatsApp}
                    className="flex-1 py-2.5 rounded-full bg-[#6B705C] hover:bg-[#585D4A] text-xs font-semibold text-white flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS */}
          {activeTab === 'BOOKINGS' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="font-serif font-bold text-lg text-[#35352C]">Your Appointments</h3>

              {/* Upcoming */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C8C70]">Upcoming ({upcomingBookings.length})</span>
                <div className="mt-2 space-y-3">
                  {upcomingBookings.map((b) => (
                    <div key={b.id} className="p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-3 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-[#5A5A40]">#{b.bookingNumber}</span>
                          <h4 className="font-serif font-bold text-sm text-[#35352C] mt-0.5">
                            {b.services.map((s) => s.name).join(' + ')}
                          </h4>
                          <p className="text-xs text-[#8C8C70] mt-0.5">Stylist: {b.staffName}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDEDE9] text-[#5A5A40]">
                          {b.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#4A4A40] pt-2 border-t border-[#EDECE4]">
                        <span>{b.appointmentDate} at {b.appointmentTime}</span>
                        <span className="font-serif font-bold text-[#35352C]">{formatINR(b.totalAmount)}</span>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this booking?')) {
                              cancelBooking(b.id, 'Cancelled by customer');
                            }
                          }}
                          className="w-full py-2 rounded-full bg-[#F9F8F4] border border-[#E2E1D8] hover:bg-rose-50 hover:text-rose-700 text-[#8C8C70] text-xs font-semibold transition-colors"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    </div>
                  ))}

                  {upcomingBookings.length === 0 && (
                    <div className="p-6 rounded-2xl bg-white border border-dashed border-[#E2E1D8] text-center text-xs text-[#8C8C70]">
                      No active upcoming bookings.
                    </div>
                  )}
                </div>
              </div>

              {/* Past Visits */}
              <div className="pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C8C70]">Past Visits ({pastBookings.length})</span>
                <div className="mt-2 space-y-3">
                  {pastBookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-2xl bg-white border border-[#E2E1D8] space-y-2 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-serif font-bold text-xs text-[#35352C]">
                            {b.services.map((s) => s.name).join(' + ')}
                          </h5>
                          <span className="text-[11px] text-[#8C8C70]">{b.appointmentDate} • {b.staffName}</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EDEDE9] text-[#8C8C70]">
                          {b.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#EDECE4]">
                        <span className="font-serif font-bold text-[#35352C]">{formatINR(b.totalAmount)}</span>
                        <button
                          onClick={() => setIsBookingOpen(true)}
                          className="text-[#5A5A40] font-semibold hover:underline text-[11px]"
                        >
                          Book Again
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES CATALOG */}
          {activeTab === 'SERVICES' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="font-serif font-bold text-lg text-[#35352C]">Services Catalog</h3>
              <div className="space-y-3">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-[24px] bg-white border border-[#E2E1D8] flex items-center justify-between gap-3 shadow-sm hover:border-[#5A5A40] transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#EDEDE9] text-[#5A5A40]">
                        {srv.category}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#35352C] mt-1">{srv.name}</h4>
                      <p className="text-xs text-[#8C8C70] mt-0.5 line-clamp-2">{srv.description}</p>
                      <div className="flex items-center gap-3 text-xs font-semibold mt-2">
                        <span className="font-serif font-bold text-[#35352C] text-sm">{formatINR(srv.price)}</span>
                        <span className="text-[#8C8C70] font-normal">{srv.duration} mins</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsBookingOpen(true)}
                      className="px-4 py-2 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm shrink-0"
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PREPAID WALLET */}
          {activeTab === 'WALLET' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Wallet Card */}
              <div className="p-6 rounded-[28px] bg-[#F1F0E8] border border-[#E2E1D8] shadow-sm space-y-4">
                <div className="flex items-center justify-between text-[#4A4A40]">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[#5A5A40]" />
                    <span className="font-bold text-xs tracking-wider uppercase">Prepaid Salon Balance</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EDEDE9] text-[#5A5A40] border border-[#E2E1D8]">
                    Instant Auto-Debit
                  </span>
                </div>

                <div className="text-3xl font-serif font-bold text-[#35352C] tracking-tight">
                  {formatINR(activeCustomer.walletBalance)}
                </div>

                <p className="text-xs text-[#8C8C70] leading-relaxed">
                  Use balance for online bookings and counter checkout. Never expires.
                </p>

                {/* Quick Recharge Amounts */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-[#4A4A40] block mb-2">Quick Top Up</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[200, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          setRechargeAmount(amt);
                          setIsRechargeModalOpen(true);
                        }}
                        className="py-2.5 rounded-full bg-white border border-[#E2E1D8] hover:border-[#5A5A40] hover:bg-[#EDEDE9] text-xs font-bold text-[#4A4A40] transition-colors shadow-sm"
                      >
                        +{formatINR(amt)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Immutable Ledger History */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#8C8C70]">Transaction Ledger</h4>
                <div className="space-y-2">
                  {customerLedger.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-white border border-[#E2E1D8] flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              tx.type === 'CREDIT' || tx.type === 'BONUS'
                                ? 'bg-[#EDEDE9] text-[#5A5A40]'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {tx.type}
                          </span>
                          <h5 className="font-semibold text-xs text-[#35352C]">{tx.description}</h5>
                        </div>
                        <span className="text-[10px] text-[#8C8C70] mt-0.5 block">{formatDate(tx.createdAt)}</span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-serif font-bold text-xs ${
                            tx.type === 'CREDIT' || tx.type === 'BONUS'
                              ? 'text-[#5A5A40]'
                              : 'text-rose-700'
                          }`}
                        >
                          {tx.type === 'CREDIT' || tx.type === 'BONUS' ? '+' : '-'}
                          {formatINR(tx.amount)}
                        </span>
                        <div className="text-[10px] text-[#8C8C70]">Bal: {formatINR(tx.balanceAfter)}</div>
                      </div>
                    </div>
                  ))}

                  {customerLedger.length === 0 && (
                    <div className="p-4 rounded-xl bg-white border border-dashed border-[#E2E1D8] text-center text-xs text-[#8C8C70]">
                      No wallet transactions recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REWARDS & REFERRALS */}
          {activeTab === 'REWARDS' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Loyalty Score Banner */}
              <div className="p-6 rounded-[28px] bg-[#F1F0E8] border border-[#E2E1D8] text-center space-y-2 shadow-sm">
                <Gift className="w-8 h-8 text-[#D4A373] mx-auto" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C8C70]">Your Rewards Balance</span>
                  <div className="text-3xl font-serif font-bold text-[#D4A373]">{activeCustomer.loyaltyPoints} Points</div>
                </div>
                <p className="text-xs text-[#4A4A40]">Earn 10 points for every ₹100 spent at {activeSalon.name}.</p>
              </div>

              {/* Available Rewards Redemption */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#8C8C70]">Redeemable Vouchers</h4>

                {[
                  { points: 100, label: '₹50 Flat Discount Coupon', code: 'REWARD50' },
                  { points: 250, label: '₹150 Flat Discount Coupon', code: 'REWARD150' },
                  { points: 500, label: 'Complimentary Deep Head Massage (₹199 Value)', code: 'REWARDMASSAGE' },
                ].map((rew) => {
                  const canRedeem = activeCustomer.loyaltyPoints >= rew.points;
                  return (
                    <div
                      key={rew.code}
                      className="p-4 rounded-[24px] bg-white border border-[#E2E1D8] flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div>
                        <h5 className="font-serif font-bold text-xs text-[#35352C]">{rew.label}</h5>
                        <span className="text-xs font-bold text-[#D4A373] mt-0.5 inline-block">
                          Requires {rew.points} Points
                        </span>
                      </div>
                      <button
                        disabled={!canRedeem}
                        onClick={() => handleRedeemPoints(rew.points, rew.label)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          canRedeem
                            ? 'bg-[#5A5A40] hover:bg-[#474732] text-white shadow-sm'
                            : 'bg-[#EDEDE9] text-[#8C8C70] cursor-not-allowed'
                        }`}
                      >
                        Redeem
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Referral Hub */}
              <div className="p-5 rounded-[28px] bg-white border border-[#E2E1D8] space-y-3 shadow-sm">
                <h4 className="font-serif font-bold text-sm text-[#35352C]">Refer & Earn Engine</h4>
                <p className="text-xs text-[#8C8C70]">
                  Give friends ₹100 off on their first service. You get ₹100 wallet credit when they complete their visit!
                </p>
                <div className="p-3 rounded-2xl bg-[#F9F8F4] border border-[#E2E1D8] flex items-center justify-between text-xs">
                  <span className="text-[#8C8C70]">Your Referral Code:</span>
                  <span className="font-mono font-bold text-[#5A5A40] text-sm">{activeCustomer.referralCode}</span>
                </div>
                <button
                  onClick={handleShareReferralWhatsApp}
                  className="w-full py-3 rounded-full bg-[#6B705C] hover:bg-[#585D4A] text-white font-bold text-xs shadow flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="font-serif font-bold text-lg text-[#35352C]">Your Profile</h3>

              <div className="p-5 rounded-[28px] bg-white border border-[#E2E1D8] space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#5A5A40] text-white font-serif font-bold text-lg flex items-center justify-center">
                    {activeCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#35352C]">{activeCustomer.name}</h4>
                    <p className="text-xs text-[#8C8C70]">{activeCustomer.phone}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDEDE9] text-[#5A5A40]">
                      {activeCustomer.tier} Member
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EDECE4] text-xs space-y-2 text-[#4A4A40]">
                  <div className="flex justify-between">
                    <span className="text-[#8C8C70]">Email:</span>
                    <span>{activeCustomer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C8C70]">Birthday Automation:</span>
                    <span className="text-[#D4A373] font-semibold">{activeCustomer.dob || '14 Oct'} (₹100 Auto-Gift)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C8C70]">Total Visits:</span>
                    <span>{activeCustomer.totalVisits} appointments</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C8C70]">Lifetime Spent:</span>
                    <span className="font-serif font-bold text-[#35352C]">{formatINR(activeCustomer.totalSpent)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Settings */}
              <div className="p-5 rounded-[28px] bg-white border border-[#E2E1D8] space-y-3 text-xs shadow-sm">
                <h5 className="font-serif font-bold text-sm text-[#35352C]">Notification Preferences</h5>
                <label className="flex items-center justify-between text-[#4A4A40] cursor-pointer">
                  <span>WhatsApp Revisit Reminders</span>
                  <input type="checkbox" defaultChecked className="accent-[#5A5A40]" />
                </label>
                <label className="flex items-center justify-between text-[#4A4A40] cursor-pointer">
                  <span>Birthday & Festival Special Offers</span>
                  <input type="checkbox" defaultChecked className="accent-[#5A5A40]" />
                </label>
              </div>
            </div>
          )}
        </main>

        {/* Floating Quick Action Button (When not on bookings) */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 max-w-md w-full px-4 pointer-events-none">
          <button
            id="btn-floating-book"
            onClick={() => setIsBookingOpen(true)}
            className="w-full py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-xl flex items-center justify-center gap-2 pointer-events-auto transition-transform active:scale-98"
          >
            <Scissors className="w-4 h-4" />
            <span>Book Grooming Appointment</span>
          </button>
        </div>

        {/* Bottom Mobile Navigation Bar */}
        <nav
          id="pwa-bottom-nav"
          className="bg-[#F1F0E8]/95 border-t border-[#E2E1D8] fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full grid grid-cols-5 z-40 backdrop-blur-md"
        >
          {[
            { id: 'HOME', label: 'Home', icon: <Home className="w-5 h-5" /> },
            { id: 'BOOKINGS', label: 'Bookings', icon: <Calendar className="w-5 h-5" /> },
            { id: 'SERVICES', label: 'Services', icon: <Scissors className="w-5 h-5" /> },
            { id: 'WALLET', label: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
            { id: 'PROFILE', label: 'Profile', icon: <User className="w-5 h-5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 flex flex-col items-center justify-center transition-colors ${
                activeTab === tab.id
                  ? 'text-[#5A5A40] font-bold'
                  : 'text-[#8C8C70] hover:text-[#5A5A40]'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      {/* Recharge Payment Gateway Simulation */}
      <PaymentModal
        isOpen={isRechargeModalOpen}
        amount={rechargeAmount}
        title="Wallet Recharge"
        description={`Add funds to ${activeSalon.name} Wallet`}
        onSuccess={handleRechargeSuccess}
        onClose={() => setIsRechargeModalOpen(false)}
      />
    </div>
  );
};
