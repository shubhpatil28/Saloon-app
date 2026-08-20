import React, { useState, useMemo } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Service, Staff, BookingServiceItem, PaymentMethod } from '../../types';
import { formatINR, generateTimeSlots } from '../../lib/utils';
import {
  X,
  Check,
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  Sparkles,
  Tag,
  CreditCard,
  Wallet,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  isOpen: boolean;
  preselectedService?: Service;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  preselectedService,
  onClose,
}) => {
  const {
    activeSalon,
    services,
    staff,
    activeCustomer,
    offers,
    createBooking,
    bookings,
    addToast,
  } = useSalon();

  // Wizard Step (1: Services, 2: Add-ons, 3: Staff, 4: Date & Slot, 5: Review & Coupon, 6: Payment, 7: Confirmed)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedServices, setSelectedServices] = useState<Service[]>(() =>
    preselectedService ? [preselectedService] : services.slice(0, 1)
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('11:00 AM');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WALLET');
  const [customerName, setCustomerName] = useState<string>(activeCustomer?.name || 'Shubham Patil');
  const [customerPhone, setCustomerPhone] = useState<string>(activeCustomer?.phone || '+91 98765 43210');
  const [customerEmail, setCustomerEmail] = useState<string>(activeCustomer?.email || 'shubhampatil282487@gmail.com');
  const [notes, setNotes] = useState<string>('');
  const [confirmedBookingNumber, setConfirmedBookingNumber] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync if preselectedService changes
  React.useEffect(() => {
    if (preselectedService) {
      setSelectedServices([preselectedService]);
    }
  }, [preselectedService]);

  if (!isOpen) return null;

  // Total Duration and Subtotal
  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Recommended Add-ons
  const recommendedAddOns = (services || []).filter(
    (s) => s.recommendedAddOn && !(selectedServices || []).some((sel) => sel.id === s.id)
  );

  // Dynamic Slot Availability Calculator (Checking collisions with existing bookings for selected date & staff)
  const availableSlots = generateTimeSlots(9, 20);

  const isSlotBooked = (slot: string) => {
    if (selectedStaffId === 'any') return false;
    return bookings.some(
      (b) =>
        b.salonId === activeSalon.id &&
        b.staffId === selectedStaffId &&
        b.appointmentDate === selectedDate &&
        b.appointmentTime === slot &&
        !['CANCELLED', 'NO_SHOW'].includes(b.status)
    );
  };

  const handleToggleService = (srv: Service) => {
    if (selectedServices.some((s) => s.id === srv.id)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s.id !== srv.id));
      } else {
        addToast('At least one service required', 'Please select at least one primary service.', 'info');
      }
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const handleApplyCoupon = () => {
    setErrorMsg(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    const offer = offers.find((o) => o.code === code && o.active);
    if (!offer) {
      setErrorMsg('Invalid or expired coupon code');
      return;
    }

    if (subtotal < offer.minimumAmount) {
      setErrorMsg(`Minimum bill of ${formatINR(offer.minimumAmount)} required for coupon ${code}`);
      return;
    }

    let calculatedDiscount = 0;
    if (offer.discountType === 'FIXED_AMOUNT') {
      calculatedDiscount = offer.discountValue;
    } else if (offer.discountType === 'PERCENTAGE') {
      calculatedDiscount = Math.min(
        (subtotal * offer.discountValue) / 100,
        offer.maximumDiscount || 9999
      );
    }

    setAppliedCoupon({ code, discount: Math.round(calculatedDiscount) });
    addToast('Coupon Applied! 🎉', `Saved ${formatINR(Math.round(calculatedDiscount))} with code ${code}`);
  };

  const handleConfirmBooking = () => {
    setErrorMsg(null);
    try {
      const assignedStaff =
        selectedStaffId === 'any'
          ? staff[0] || { id: 'staff-vikram', name: 'Vikram Sharma' }
          : staff.find((s) => s.id === selectedStaffId) || { id: 'staff-vikram', name: 'Vikram Sharma' };

      const serviceItems: BookingServiceItem[] = selectedServices.map((s) => ({
        serviceId: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
      }));

      const newBooking = createBooking({
        salonId: activeSalon.id,
        customerId: activeCustomer?.id || 'cust-shubham',
        customerName: customerName || 'Valued Customer',
        customerPhone: customerPhone || '+91 98765 43210',
        customerEmail,
        staffId: assignedStaff.id,
        staffName: assignedStaff.name,
        services: serviceItems,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        durationMinutes: totalDuration,
        subtotal,
        discountAmount,
        appliedCouponCode: appliedCoupon?.code,
        totalAmount: finalTotal,
        status: 'CONFIRMED',
        paymentStatus: paymentMethod === 'PAY_AT_SALON' ? 'PENDING' : 'PAID',
        paymentMethod,
        notes,
      });

      setConfirmedBookingNumber(newBooking.bookingNumber);
      setStep(7); // Show Confirmation Step

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to place appointment. Please try again.');
    }
  };

  return (
    <div
      id="booking-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in"
    >
      <div
        id="booking-modal-container"
        className="bg-[#F9F8F4] border border-[#E2E1D8] rounded-[28px] max-w-2xl w-full overflow-hidden shadow-2xl my-auto text-[#4A4A40]"
      >
        {/* Modal Header */}
        <div className="bg-[#5A5A40] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base tracking-tight">Book Appointment</h3>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#D4A373] text-white">
                {activeSalon.name}
              </span>
            </div>
            <p className="text-xs text-[#E2E1D8] mt-0.5">
              Step {step} of 6 • Instant confirmation & zero wait times
            </p>
          </div>
          <button
            id="btn-close-booking-modal"
            onClick={onClose}
            className="text-[#E2E1D8] hover:text-white p-1 rounded-full hover:bg-[#474732] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#EDECE4] h-1.5">
          <div
            className="bg-[#D4A373] h-1.5 transition-all duration-300 rounded-r-full"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-[#F5EBE0] border border-[#D4A373] flex items-center gap-2.5 text-[#8C4A2F] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D4A373]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: SELECT SERVICES */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-base font-bold text-[#35352C]">Choose Primary Services</h4>
                <p className="text-xs text-[#8C8C70]">Select one or more services for your grooming session.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((srv) => {
                  const isSelected = selectedServices.some((s) => s.id === srv.id);
                  return (
                    <div
                      key={srv.id}
                      onClick={() => handleToggleService(srv)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#5A5A40] bg-white ring-1 ring-[#5A5A40] shadow-sm'
                          : 'border-[#E2E1D8] bg-white hover:border-[#5A5A40]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#EDEDE9] text-[#5A5A40]">
                            {srv.category}
                          </span>
                          <h5 className="font-serif font-bold text-sm text-[#35352C] mt-1.5">{srv.name}</h5>
                          <p className="text-xs text-[#8C8C70] mt-0.5 line-clamp-2">{srv.description}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#5A5A40] text-white font-bold'
                              : 'border border-[#E2E1D8]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-[#EDECE4] flex items-center justify-between text-xs">
                        <span className="text-[#8C8C70] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {srv.duration} mins
                        </span>
                        <span className="font-serif font-bold text-[#35352C] text-sm">{formatINR(srv.price)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT ADD-ONS */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4A373]" />
                  <h4 className="font-serif text-base font-bold text-[#35352C]">Frequently Added Add-ons</h4>
                </div>
                <p className="text-xs text-[#8C8C70]">Customers love pairing these quick rejuvenating treatments.</p>
              </div>

              <div className="space-y-2.5">
                {recommendedAddOns.map((addon) => (
                  <div
                    key={addon.id}
                    className="p-4 rounded-2xl border border-[#E2E1D8] bg-white flex items-center justify-between gap-4 hover:border-[#5A5A40]/40 transition-colors shadow-sm"
                  >
                    <div>
                      <h5 className="font-serif font-semibold text-sm text-[#35352C]">{addon.name}</h5>
                      <p className="text-xs text-[#8C8C70] mt-0.5">{addon.description}</p>
                      <span className="text-xs font-semibold text-[#D4A373] mt-1 inline-block">
                        +{formatINR(addon.price)} • {addon.duration} mins
                      </span>
                    </div>
                    <button
                      id={`btn-add-addon-${addon.id}`}
                      onClick={() => handleToggleService(addon)}
                      className="px-3.5 py-1.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold text-xs flex items-center gap-1 shadow-sm shrink-0 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}

                {recommendedAddOns.length === 0 && (
                  <div className="text-center py-6 text-[#8C8C70] text-xs">
                    All top recommended add-ons already included in your selection!
                  </div>
                )}
              </div>

              {/* Current Selection summary banner */}
              <div className="p-4 rounded-2xl bg-white border border-[#E2E1D8] flex items-center justify-between text-xs shadow-sm">
                <div>
                  <span className="text-[#8C8C70]">Selected Services:</span>
                  <div className="font-medium text-[#35352C]">
                    {selectedServices.map((s) => s.name).join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#8C8C70]">Running Total:</span>
                  <div className="font-serif font-bold text-base text-[#5A5A40]">{formatINR(subtotal)}</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT STYLIST / STAFF */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-base font-bold text-[#35352C]">Select Preferred Stylist</h4>
                <p className="text-xs text-[#8C8C70]">Choose your favorite grooming master or select any available stylist.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Any Available Option */}
                <div
                  onClick={() => setSelectedStaffId('any')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 bg-white ${
                    selectedStaffId === 'any'
                      ? 'border-[#5A5A40] ring-1 ring-[#5A5A40] shadow-sm'
                      : 'border-[#E2E1D8] hover:border-[#5A5A40]/40'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-[#EDEDE9] text-[#5A5A40] flex items-center justify-center font-bold text-sm">
                    ✨
                  </div>
                  <div>
                    <h5 className="font-serif font-semibold text-sm text-[#35352C]">Any Available Stylist</h5>
                    <p className="text-xs text-[#8C8C70]">Fastest slot availability</p>
                  </div>
                </div>

                {staff.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStaffId(st.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 bg-white ${
                      selectedStaffId === st.id
                        ? 'border-[#5A5A40] ring-1 ring-[#5A5A40] shadow-sm'
                        : 'border-[#E2E1D8] hover:border-[#5A5A40]/40'
                    }`}
                  >
                    <img src={st.avatar} alt={st.name} className="w-11 h-11 rounded-full object-cover border border-[#E2E1D8]" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-serif font-semibold text-sm text-[#35352C]">{st.name}</h5>
                        <span className="text-[10px] font-bold text-[#D4A373]">★ {st.rating}</span>
                      </div>
                      <p className="text-xs text-[#8C8C70]">{st.specialization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: DATE & SMART SLOT */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-base font-bold text-[#35352C]">Select Date & Time Slot</h4>
                <p className="text-xs text-[#8C8C70]">Dynamic slot calculations prevent any wait times.</p>
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1.5">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E1D8] bg-white text-[#35352C] text-sm font-medium focus:ring-2 focus:ring-[#5A5A40]"
                />
              </div>

              {/* Slots Grid */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-2">
                  Available Slots ({selectedDate})
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const booked = isSlotBooked(slot);
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        disabled={booked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                          booked
                            ? 'bg-[#EDECE4] text-[#A8A892] border-[#E2E1D8] line-through cursor-not-allowed'
                            : isSelected
                            ? 'border-[#5A5A40] bg-[#5A5A40] text-white font-bold shadow-sm'
                            : 'border-[#E2E1D8] bg-white hover:border-[#5A5A40] text-[#4A4A40]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & COUPON */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-base font-bold text-[#35352C]">Review & Contact Info</h4>
                <p className="text-xs text-[#8C8C70]">Verify details and apply discount coupons.</p>
              </div>

              {/* Customer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E2E1D8] bg-white text-[#35352C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Mobile (for SMS/WhatsApp)</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E2E1D8] bg-white text-[#35352C]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Special Instructions (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Skin sensitivity, low fade preference..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E2E1D8] bg-white text-[#35352C]"
                />
              </div>

              {/* Coupon Box */}
              <div className="p-4 rounded-2xl bg-white border border-[#E2E1D8] shadow-sm">
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1.5">Apply Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. WELCOME50, ROYAL20"
                    className="flex-1 px-3 py-2 text-sm uppercase rounded-xl border border-[#E2E1D8] bg-[#F9F8F4] text-[#35352C]"
                  />
                  <button
                    id="btn-apply-coupon"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 rounded-xl bg-[#5A5A40] text-white font-semibold text-xs hover:bg-[#474732] transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="mt-2 text-xs text-[#5A5A40] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Coupon {appliedCoupon.code} applied (-{formatINR(appliedCoupon.discount)})</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-[#5A5A40] text-white space-y-2 text-xs shadow-sm">
                <div className="flex justify-between text-[#E2E1D8]">
                  <span>Subtotal ({selectedServices.length} services)</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[#D4A373]">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-{formatINR(appliedCoupon.discount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#6B705C] flex justify-between font-bold text-base text-white">
                  <span>Total Amount</span>
                  <span className="text-[#D4A373] font-serif">{formatINR(finalTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: PAYMENT METHOD */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-base font-bold text-[#35352C]">Select Payment Mode</h4>
                <p className="text-xs text-[#8C8C70]">Choose how you'd like to pay for your appointment.</p>
              </div>

              <div className="space-y-2.5">
                {/* Salon Wallet Option */}
                <label
                  onClick={() => setPaymentMethod('WALLET')}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all bg-white ${
                    paymentMethod === 'WALLET'
                      ? 'border-[#5A5A40] ring-1 ring-[#5A5A40] shadow-sm'
                      : 'border-[#E2E1D8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EDEDE9] text-[#5A5A40] flex items-center justify-center font-bold">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-serif font-semibold text-sm text-[#35352C]">Salon Wallet</h5>
                      <p className="text-xs text-[#8C8C70]">
                        Available Balance: {formatINR(activeCustomer?.walletBalance || 0)}
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'WALLET'}
                    onChange={() => setPaymentMethod('WALLET')}
                    className="accent-[#5A5A40]"
                  />
                </label>

                {/* Instant UPI Option */}
                <label
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all bg-white ${
                    paymentMethod === 'UPI'
                      ? 'border-[#5A5A40] ring-1 ring-[#5A5A40] shadow-sm'
                      : 'border-[#E2E1D8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EDEDE9] text-[#5A5A40] flex items-center justify-center font-serif font-bold text-base">
                      ₹
                    </div>
                    <div>
                      <h5 className="font-serif font-semibold text-sm text-[#35352C]">UPI / GPay / PhonePe / QR</h5>
                      <p className="text-xs text-[#8C8C70]">Fast 1-click Razorpay verified checkout</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="accent-[#5A5A40]"
                  />
                </label>

                {/* Card Option */}
                <label
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all bg-white ${
                    paymentMethod === 'CARD'
                      ? 'border-[#5A5A40] ring-1 ring-[#5A5A40] shadow-sm'
                      : 'border-[#E2E1D8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EDEDE9] text-[#5A5A40] flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-serif font-semibold text-sm text-[#35352C]">Debit / Credit Card</h5>
                      <p className="text-xs text-[#8C8C70]">Visa, Mastercard, RuPay</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="accent-[#5A5A40]"
                  />
                </label>

                {/* Pay at Salon Option */}
                <label
                  onClick={() => setPaymentMethod('PAY_AT_SALON')}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all bg-white ${
                    paymentMethod === 'PAY_AT_SALON'
                      ? 'border-[#5A5A40] ring-1 ring-[#5A5A40] shadow-sm'
                      : 'border-[#E2E1D8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EDEDE9] text-[#5A5A40] flex items-center justify-center font-bold">
                      🏢
                    </div>
                    <div>
                      <h5 className="font-serif font-semibold text-sm text-[#35352C]">Pay at Counter</h5>
                      <p className="text-xs text-[#8C8C70]">Pay via cash or card after your service</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'PAY_AT_SALON'}
                    onChange={() => setPaymentMethod('PAY_AT_SALON')}
                    className="accent-[#5A5A40]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 7: CONFIRMATION SUCCESS */}
          {step === 7 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EDEDE9] text-[#5A5A40] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#D4A373]">Confirmed</span>
                <h4 className="font-serif text-2xl font-bold text-[#35352C] mt-1">Appointment Confirmed!</h4>
                <p className="text-xs text-[#8C8C70] mt-1">
                  Your booking number is <span className="font-bold text-[#35352C]">{confirmedBookingNumber}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2E1D8] text-xs text-left max-w-sm mx-auto space-y-1.5 shadow-sm">
                <div className="flex justify-between text-[#8C8C70]">
                  <span>Date & Time</span>
                  <span className="font-semibold text-[#35352C]">{selectedDate} at {selectedSlot}</span>
                </div>
                <div className="flex justify-between text-[#8C8C70]">
                  <span>Salon</span>
                  <span className="font-semibold text-[#35352C]">{activeSalon.name}</span>
                </div>
                <div className="flex justify-between text-[#8C8C70]">
                  <span>Total Paid</span>
                  <span className="font-bold font-serif text-[#5A5A40] text-sm">{formatINR(finalTotal)}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  id="btn-done-booking"
                  onClick={onClose}
                  className="px-8 py-3 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-md transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 7 && (
          <div className="bg-[#EDEDE9] px-6 py-4 border-t border-[#E2E1D8] flex items-center justify-between">
            {step > 1 ? (
              <button
                id="btn-booking-back"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-full border border-[#E2E1D8] bg-white hover:bg-[#F9F8F4] text-xs font-semibold flex items-center gap-1 text-[#4A4A40] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                id="btn-booking-next"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-booking-submit"
                onClick={handleConfirmBooking}
                className="px-6 py-2.5 rounded-full bg-[#6B705C] hover:bg-[#585D4A] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Reserve ({formatINR(finalTotal)})</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
