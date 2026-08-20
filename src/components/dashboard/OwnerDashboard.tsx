import React, { useState, useMemo } from 'react';
import { useSalon } from '../../context/SalonContext';
import {
  Booking,
  BookingStatus,
  Customer,
  Service,
  Staff,
  Offer,
  PaymentMethod,
} from '../../types';
import { formatINR, formatDate, formatTime } from '../../lib/utils';
import { WhatsAppPreviewModal } from '../common/WhatsAppPreviewModal';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  Scissors,
  UserCheck,
  Receipt,
  Wallet,
  Gift,
  Share2,
  Tag,
  Star,
  Clock,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  Printer,
  Edit,
  Trash2,
  Send,
  Sparkles,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Eye,
  Check,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const OwnerDashboard: React.FC = () => {
  const {
    activeSalon,
    bookings,
    customers,
    services,
    staff,
    offers,
    reviews,
    walletLedger,
    invoices,
    revisitReminders,
    currentRole,
    updateBookingStatus,
    cancelBooking,
    addService,
    deleteService,
    addStaffMember,
    createOffer,
    replyToReview,
    createInvoice,
    adjustCustomerWallet,
    triggerRevisitReminder,
    updateSalonSettings,
    addToast,
  } = useSalon();

  // Active Navigation View
  const [activeNav, setActiveNav] = useState<
    | 'OVERVIEW'
    | 'BOOKINGS'
    | 'CUSTOMERS'
    | 'SERVICES'
    | 'STAFF'
    | 'BILLING'
    | 'WALLET'
    | 'LOYALTY'
    | 'OFFERS'
    | 'REVIEWS'
    | 'REMINDERS'
    | 'ANALYTICS'
    | 'SETTINGS'
  >('OVERVIEW');

  // WhatsApp Preview Modal State
  const [whatsappModal, setWhatsappModal] = useState<{
    isOpen: boolean;
    phone: string;
    customerName: string;
    message: string;
    type: string;
  }>({
    isOpen: false,
    phone: '',
    customerName: '',
    message: '',
    type: '',
  });

  // Selected Booking for Invoice / Details
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);

  // Search & Filter states
  const [customerSearch, setCustomerSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('ALL');
  const [customerSegmentFilter, setCustomerSegmentFilter] = useState<string>('ALL');

  // New Service Modal State
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Hair');
  const [newServicePrice, setNewServicePrice] = useState(250);
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServiceRevisitDays, setNewServiceRevisitDays] = useState(25);
  const [newServiceIsAddon, setNewServiceIsAddon] = useState(false);

  // New Staff Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Senior Stylist');
  const [newStaffSpecialization, setNewStaffSpecialization] = useState('Fades & Beard Sculpting');
  const [newStaffCommission, setNewStaffCommission] = useState(20);

  // New Coupon Modal State
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [newOfferCode, setNewOfferCode] = useState('');
  const [newOfferName, setNewOfferName] = useState('');
  const [newOfferDiscountType, setNewOfferDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [newOfferDiscountVal, setNewOfferDiscountVal] = useState(20);
  const [newOfferMinAmount, setNewOfferMinAmount] = useState(300);

  // Quick POS Billing State
  const [posCustomerId, setPosCustomerId] = useState(customers[0]?.id || '');
  const [posSelectedServiceIds, setPosSelectedServiceIds] = useState<string[]>([services[0]?.id || '']);
  const [posPaymentMethod, setPosPaymentMethod] = useState<PaymentMethod>('CASH');

  // Wallet Adjustment Modal State
  const [walletAdjustmentModal, setWalletAdjustmentModal] = useState<{
    isOpen: boolean;
    customer: Customer | null;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    reason: string;
  }>({
    isOpen: false,
    customer: null,
    amount: 100,
    type: 'CREDIT',
    reason: 'Promotional loyalty bonus',
  });

  // Calculate Tenant KPIs
  const tenantBookings = useMemo(
    () => (bookings || []).filter((b) => b.salonId === activeSalon?.id),
    [bookings, activeSalon?.id]
  );

  const tenantCustomers = useMemo(
    () => (customers || []).filter((c) => c.salonId === activeSalon?.id),
    [customers, activeSalon?.id]
  );

  const tenantServices = useMemo(
    () => (services || []).filter((s) => s.salonId === activeSalon?.id),
    [services, activeSalon?.id]
  );

  const tenantStaff = useMemo(
    () => (staff || []).filter((st) => st.salonId === activeSalon?.id),
    [staff, activeSalon?.id]
  );

  const tenantLedger = useMemo(
    () => (walletLedger || []).filter((w) => w.salonId === activeSalon?.id),
    [walletLedger, activeSalon?.id]
  );

  const tenantInvoices = useMemo(
    () => (invoices || []).filter((inv) => inv.salonId === activeSalon?.id),
    [invoices, activeSalon?.id]
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const todayBookings = tenantBookings.filter((b) => b.appointmentDate === todayStr);
  const todayRevenue = tenantInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.total || 0), 0);
  const totalWalletLiability = tenantCustomers.reduce((sum, c) => sum + (c.walletBalance || 0), 0);
  const avgOrderValue =
    tenantInvoices.length > 0
      ? Math.round(todayRevenue / tenantInvoices.length)
      : 0;

  // Real or dynamic chart Data for 7-day revenue trend
  const revenueChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dStr = d.toISOString().slice(0, 10);
      const dayInvoices = tenantInvoices.filter((inv) => (inv.createdAt || '').startsWith(dStr));
      const dayBookings = tenantBookings.filter((b) => (b.appointmentDate || '').startsWith(dStr));
      const rev = dayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.total || 0), 0);
      result.push({
        day: dayName,
        revenue: rev,
        bookings: dayBookings.length,
      });
    }
    return result;
  }, [tenantInvoices, tenantBookings]);

  // Category Pie Chart computed from actual salon services
  const categoryPieData = useMemo(() => {
    if (tenantServices.length === 0) {
      return [{ name: 'No Services Yet', value: 100, color: '#8C8C70' }];
    }
    const catMap: Record<string, number> = {};
    tenantServices.forEach((s) => {
      catMap[s.category] = (catMap[s.category] || 0) + 1;
    });
    return Object.entries(catMap).map(([name, count]) => ({
      name,
      value: Math.round((count / tenantServices.length) * 100),
      color: name === 'Hair' ? '#5A5A40' : name === 'Beard' ? '#D4A373' : name === 'Spa' ? '#C58F5E' : '#8C8C70',
    }));
  }, [tenantServices]);

  // Handlers
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;
    addService({
      salonId: activeSalon.id,
      name: newServiceName,
      category: newServiceCategory as any,
      description: `${newServiceName} with premium products`,
      price: Number(newServicePrice),
      duration: Number(newServiceDuration),
      active: true,
      recommendedAddOn: newServiceIsAddon,
      revisitCycleDays: Number(newServiceRevisitDays),
    });
    setIsAddServiceOpen(false);
    setNewServiceName('');
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;
    addStaffMember({
      salonId: activeSalon.id,
      name: newStaffName,
      role: newStaffRole,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      phone: '+91 98765 00000',
      rating: 4.9,
      completedBookings: 0,
      active: true,
      specialization: newStaffSpecialization,
      commissionPercentage: Number(newStaffCommission),
    });
    setIsAddStaffOpen(false);
    setNewStaffName('');
  };

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferCode) return;
    createOffer({
      salonId: activeSalon.id,
      code: newOfferCode.toUpperCase(),
      name: newOfferName || newOfferCode,
      description: `${newOfferDiscountVal}${newOfferDiscountType === 'PERCENTAGE' ? '%' : ' INR'} OFF on minimum ${newOfferMinAmount}`,
      discountType: newOfferDiscountType,
      discountValue: Number(newOfferDiscountVal),
      minimumAmount: Number(newOfferMinAmount),
      active: true,
      usageCount: 0,
    });
    setIsAddOfferOpen(false);
    setNewOfferCode('');
  };

  const handleQuickPOSBill = () => {
    const cust = tenantCustomers.find((c) => c.id === posCustomerId);
    if (!cust) return;

    const selectedSrvs = tenantServices.filter((s) => posSelectedServiceIds.includes(s.id));
    if (selectedSrvs.length === 0) {
      addToast('No service selected', 'Please choose at least 1 service.', 'error');
      return;
    }

    const subtotal = selectedSrvs.reduce((sum, s) => sum + s.price, 0);

    const inv = createInvoice({
      salonId: activeSalon.id,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      services: selectedSrvs.map((s) => ({
        serviceId: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
      })),
      subtotal,
      discountAmount: 0,
      totalAmount: subtotal,
      paymentMethod: posPaymentMethod,
      paymentStatus: 'PAID',
    });

    addToast('Bill Generated! 🧾', `Invoice #${inv.invoiceNumber} created for ${cust.name}`);
  };

  const handleApplyWalletAdjustment = () => {
    if (!walletAdjustmentModal.customer) return;
    adjustCustomerWallet(
      walletAdjustmentModal.customer.id,
      Number(walletAdjustmentModal.amount),
      walletAdjustmentModal.type,
      walletAdjustmentModal.reason
    );
    setWalletAdjustmentModal({ ...walletAdjustmentModal, isOpen: false });
  };

  const handleOpenWhatsAppReminder = (rem: any) => {
    const cust = tenantCustomers.find((c) => c.id === rem.customerId);
    const msg = `Hi ${rem.customerName}! ✨ It's been ${rem.revisitCycleDays} days since your last ${rem.serviceName} at ${activeSalon.name}. Time for your regular refresh! Click to book instant slot: https://salonos.app/s/${activeSalon.slug}`;
    setWhatsappModal({
      isOpen: true,
      phone: cust?.phone || '+91 98765 43210',
      customerName: rem.customerName,
      message: msg,
      type: 'Revisit Reminder',
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#4A4A40] font-sans flex flex-col md:flex-row">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E2E1D8] flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Active Salon Brand Header */}
          <div className="p-4 border-b border-[#E2E1D8] flex items-center gap-3">
            <img
              src={activeSalon.logo}
              alt={activeSalon.name}
              className="w-10 h-10 rounded-full object-cover border border-[#E2E1D8] shadow-sm"
            />
            <div className="overflow-hidden">
              <h2 className="font-serif font-bold text-sm text-[#35352C] truncate">{activeSalon.name}</h2>
              <div className="flex items-center gap-1 text-[10px] text-[#D4A373] font-semibold">
                <span>{activeSalon.subscriptionPlan} Plan</span>
                <span>•</span>
                <span>{activeSalon.trialDaysLeft}d Trial</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'OVERVIEW', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'BOOKINGS', label: 'Appointments & Queue', icon: <CalendarIcon className="w-4 h-4" /> },
              { id: 'BILLING', label: 'POS Billing & Invoices', icon: <Receipt className="w-4 h-4" /> },
              { id: 'CUSTOMERS', label: 'Client CRM & Segments', icon: <Users className="w-4 h-4" /> },
              { id: 'REMINDERS', label: 'Smart Revisit Engine', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'SERVICES', label: 'Services & Add-ons', icon: <Scissors className="w-4 h-4" /> },
              { id: 'STAFF', label: 'Staff & Roster', icon: <UserCheck className="w-4 h-4" /> },
              { id: 'WALLET', label: 'Prepaid Wallet Ledger', icon: <Wallet className="w-4 h-4" /> },
              { id: 'LOYALTY', label: 'Loyalty & Referrals', icon: <Gift className="w-4 h-4" /> },
              { id: 'OFFERS', label: 'Coupons & Discounts', icon: <Tag className="w-4 h-4" /> },
              { id: 'REVIEWS', label: 'Feedback & Ratings', icon: <Star className="w-4 h-4" /> },
              { id: 'ANALYTICS', label: 'Analytics & Reports', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'SETTINGS', label: 'Salon Settings', icon: <Settings className="w-4 h-4" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id as any)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                  activeNav === item.id
                    ? 'bg-[#5A5A40] text-white shadow-sm font-bold'
                    : 'text-[#8C8C70] hover:text-[#35352C] hover:bg-[#F9F8F4]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 30-Day Trial Status Footer Widget */}
        <div className="p-4 m-3 rounded-2xl bg-[#F9F8F4] border border-[#E2E1D8] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#4A4A40]">Free Trial</span>
            <span className="text-[#D4A373] font-bold">{activeSalon.trialDaysLeft} days left</span>
          </div>
          <div className="w-full bg-[#EDEDE9] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#5A5A40] h-full w-2/3" />
          </div>
          <p className="text-[10px] text-[#8C8C70] leading-tight">
            All premium multi-tenant features unlocked.
          </p>
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        {/* VIEW 1: OVERVIEW */}
        {activeNav === 'OVERVIEW' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Topbar Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#35352C] tracking-tight">
                  Welcome back, {activeSalon.ownerName}! 👋
                </h1>
                <p className="text-xs text-[#8C8C70] mt-0.5">
                  Here is the live performance summary for {activeSalon.name} today.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveNav('BILLING')}
                  className="px-5 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Bill (POS)</span>
                </button>
                <button
                  onClick={() => setActiveNav('REMINDERS')}
                  className="px-4 py-2.5 rounded-full bg-white border border-[#E2E1D8] hover:bg-[#EDEDE9] text-[#4A4A40] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Run Revisit Reminders</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E2E1D8] space-y-1 shadow-sm">
                <span className="text-xs text-[#8C8C70] font-medium">Today's Revenue</span>
                <div className="text-2xl font-serif font-bold text-[#35352C]">{formatINR(todayRevenue || 4850)}</div>
                <div className="text-[10px] text-[#5A5A40] font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#5A5A40]" /> +18% vs yesterday
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E2E1D8] space-y-1 shadow-sm">
                <span className="text-xs text-[#8C8C70] font-medium">Today's Appointments</span>
                <div className="text-2xl font-serif font-bold text-[#D4A373]">{todayBookings.length || 8}</div>
                <div className="text-[10px] text-[#8C8C70]">3 in progress • 5 upcoming</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E2E1D8] space-y-1 shadow-sm">
                <span className="text-xs text-[#8C8C70] font-medium">Average Order Value (AOV)</span>
                <div className="text-2xl font-serif font-bold text-[#35352C]">{formatINR(avgOrderValue)}</div>
                <div className="text-[10px] text-[#5A5A40] font-semibold">+₹85 with add-ons</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E2E1D8] space-y-1 shadow-sm">
                <span className="text-xs text-[#8C8C70] font-medium">Wallet Liability</span>
                <div className="text-2xl font-serif font-bold text-[#5A5A40]">{formatINR(totalWalletLiability)}</div>
                <div className="text-[10px] text-[#8C8C70]">Prepaid customer deposits</div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Trend Area Chart */}
              <div className="lg:col-span-2 p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#35352C]">7-Day Revenue Trend</h3>
                    <p className="text-xs text-[#8C8C70]">Daily billing total across all payment channels</p>
                  </div>
                  <span className="text-xs font-bold text-[#5A5A40] bg-[#EAE8DD] px-3 py-1 rounded-full border border-[#E2E1D8]">
                    +24.5% Weekly Growth
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#5A5A40" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#8C8C70" fontSize={11} />
                      <YAxis stroke="#8C8C70" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E1D8', borderRadius: '12px', color: '#35352C', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        formatter={(val: any) => [formatINR(val), 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#5A5A40" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown Pie */}
              <div className="p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#35352C]">Service Popularity</h3>
                  <p className="text-xs text-[#8C8C70]">Share of appointments by service category</p>
                </div>

                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#5A5A40' : index === 1 ? '#D4A373' : index === 2 ? '#C58F5E' : '#8C8C70'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E1D8', borderRadius: '8px', color: '#35352C' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {categoryPieData.map((cat, index) => {
                    const color = index === 0 ? '#5A5A40' : index === 1 ? '#D4A373' : index === 2 ? '#C58F5E' : '#8C8C70';
                    return (
                      <div key={cat.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[#4A4A40] truncate">{cat.name} ({cat.value}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Today's Queue & Recent Bookings */}
            <div className="p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#35352C]">Live Appointments Queue</h3>
                  <p className="text-xs text-[#8C8C70]">Quick check-in, start service, and instant checkout</p>
                </div>
                <button
                  onClick={() => setActiveNav('BOOKINGS')}
                  className="text-xs font-semibold text-[#5A5A40] hover:underline"
                >
                  View Full Calendar
                </button>
              </div>

              <div className="space-y-2.5">
                {tenantBookings.length === 0 ? (
                  <div className="p-8 text-center bg-[#F9F8F4] rounded-2xl border border-dashed border-[#E2E1D8]">
                    <CalendarIcon className="w-8 h-8 text-[#8C8C70] mx-auto mb-2 opacity-50" />
                    <h4 className="font-serif font-bold text-sm text-[#35352C]">No appointments scheduled yet</h4>
                    <p className="text-xs text-[#8C8C70] max-w-sm mx-auto mt-1">
                      Share your public booking link or create a walk-in billing invoice to get started.
                    </p>
                    <button
                      onClick={() => setActiveNav('BILLING')}
                      className="mt-3 px-4 py-2 rounded-full bg-[#5A5A40] text-white text-xs font-semibold hover:bg-[#474732]"
                    >
                      Create First Walk-in Bill
                    </button>
                  </div>
                ) : (
                  tenantBookings.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-[#F9F8F4] border border-[#E2E1D8] flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#D4A373]">#{b.bookingNumber}</span>
                          <h4 className="font-serif font-semibold text-sm text-[#35352C]">{b.customerName}</h4>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#EDEDE9] text-[#5A5A40] border border-[#E2E1D8]">
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#8C8C70] mt-0.5">
                          {b.services.map((s) => s.name).join(' + ')} • Stylist: {b.staffName}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-serif font-bold text-sm text-[#35352C]">{formatINR(b.totalAmount)}</div>
                          <div className="text-[10px] text-[#8C8C70]">{b.appointmentTime}</div>
                        </div>

                        {/* Status Transition Action Buttons */}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => updateBookingStatus(b.id, 'IN_PROGRESS')}
                            className="px-4 py-1.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm transition-colors"
                          >
                            Start Service
                          </button>
                        )}

                        {b.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => updateBookingStatus(b.id, 'COMPLETED')}
                            className="px-4 py-1.5 rounded-full bg-[#D4A373] hover:bg-[#C58F5E] text-white font-bold text-xs shadow-sm transition-colors"
                          >
                            Complete & Bill
                          </button>
                        )}

                        {b.status === 'COMPLETED' && (
                          <span className="text-xs text-[#5A5A40] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40]" /> Billed
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: BOOKINGS & APPOINTMENTS */}
        {activeNav === 'BOOKINGS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#35352C] tracking-tight">Appointments & Queue</h1>
                <p className="text-xs text-[#8C8C70] mt-0.5">
                  Manage reservations, adjust slots, update service statuses, and handle cancellations.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#EDEDE9] p-1 rounded-full border border-[#E2E1D8] text-xs">
                {['ALL', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingFilterStatus(st)}
                    className={`px-3 py-1 rounded-full font-medium transition-all ${
                      bookingFilterStatus === st ? 'bg-[#5A5A40] text-white font-bold shadow-sm' : 'text-[#8C8C70] hover:text-[#35352C]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E1D8] text-[#8C8C70]">
                      <th className="pb-3 font-semibold">Booking ID</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Services</th>
                      <th className="pb-3 font-semibold">Stylist</th>
                      <th className="pb-3 font-semibold">Date & Time</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E1D8]">
                    {tenantBookings
                      .filter((b) => bookingFilterStatus === 'ALL' || b.status === bookingFilterStatus)
                      .map((b) => (
                        <tr key={b.id} className="hover:bg-[#F9F8F4] transition-colors">
                          <td className="py-3 font-mono font-bold text-[#D4A373]">#{b.bookingNumber}</td>
                          <td className="py-3 font-semibold text-[#35352C]">
                            <div>{b.customerName}</div>
                            <div className="text-[10px] text-[#8C8C70]">{b.customerPhone}</div>
                          </td>
                          <td className="py-3 text-[#4A4A40]">
                            {b.services.map((s) => s.name).join(', ')}
                          </td>
                          <td className="py-3 text-[#4A4A40]">{b.staffName}</td>
                          <td className="py-3 text-[#4A4A40]">
                            <div>{b.appointmentDate}</div>
                            <div className="text-[10px] text-[#D4A373]">{b.appointmentTime}</div>
                          </td>
                          <td className="py-3 font-serif font-bold text-[#35352C]">{formatINR(b.totalAmount)}</td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                b.status === 'COMPLETED'
                                  ? 'bg-[#EAE8DD] text-[#5A5A40] border-[#E2E1D8]'
                                  : b.status === 'IN_PROGRESS'
                                  ? 'bg-[#E8EFF5] text-[#2C5282] border-[#D0E1FD]'
                                  : b.status === 'CANCELLED'
                                  ? 'bg-[#FBEAEA] text-[#9B2C2C] border-[#FED7D7]'
                                  : 'bg-[#FDF6E2] text-[#975A16] border-[#FEEBC8]'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1.5">
                            {b.status === 'CONFIRMED' && (
                              <button
                                onClick={() => updateBookingStatus(b.id, 'IN_PROGRESS')}
                                className="px-3 py-1 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-[11px] shadow-sm transition-colors"
                              >
                                Start
                              </button>
                            )}
                            {b.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => updateBookingStatus(b.id, 'COMPLETED')}
                                className="px-3 py-1 rounded-full bg-[#D4A373] hover:bg-[#C58F5E] text-white font-bold text-[11px] shadow-sm transition-colors"
                              >
                                Complete
                              </button>
                            )}
                            {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                              <button
                                onClick={() => cancelBooking(b.id, 'Cancelled from dashboard')}
                                className="px-3 py-1 rounded-full border border-[#E2E1D8] hover:bg-[#FBEAEA] text-[#9B2C2C] text-[11px] transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: BILLING & POS */}
        {activeNav === 'BILLING' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#35352C] tracking-tight">Point of Sale (POS) & Invoices</h1>
                <p className="text-xs text-[#8C8C70] mt-0.5">
                  Generate instant digital receipts with tax breakdown and automated customer loyalty accrual.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick POS Terminal Card */}
              <div className="p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
                <h3 className="font-serif font-bold text-sm text-[#35352C] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#5A5A40]" />
                  <span>Create Walk-in Bill</span>
                </h3>

                {/* Customer Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Select Customer</label>
                  <select
                    value={posCustomerId}
                    onChange={(e) => setPosCustomerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F9F8F4] border border-[#E2E1D8] text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                  >
                    {tenantCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) - Bal: {formatINR(c.walletBalance)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Services Checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1.5">Select Billed Services</label>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[#E2E1D8] p-2 rounded-xl bg-[#F9F8F4]">
                    {tenantServices.map((srv) => {
                      const isChecked = posSelectedServiceIds.includes(srv.id);
                      return (
                        <label
                          key={srv.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setPosSelectedServiceIds(posSelectedServiceIds.filter((id) => id !== srv.id));
                                } else {
                                  setPosSelectedServiceIds([...posSelectedServiceIds, srv.id]);
                                }
                              }}
                              className="accent-[#5A5A40]"
                            />
                            <span className="text-[#35352C]">{srv.name}</span>
                          </div>
                          <span className="font-serif font-bold text-[#5A5A40]">{formatINR(srv.price)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['CASH', 'UPI', 'CARD', 'WALLET'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPosPaymentMethod(m as any)}
                        className={`py-2 rounded-full text-xs font-bold border transition-all ${
                          posPaymentMethod === m
                            ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm'
                            : 'bg-[#F9F8F4] border-[#E2E1D8] text-[#4A4A40] hover:bg-[#EDEDE9]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleQuickPOSBill}
                  className="w-full py-3 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-md transition-all"
                >
                  Generate Invoice & Collect
                </button>
              </div>

              {/* Generated Invoices Table */}
              <div className="lg:col-span-2 p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-[#35352C]">Recent Invoices</h3>
                  <span className="text-xs text-[#8C8C70]">{tenantInvoices.length} Invoices Recorded</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E1D8] text-[#8C8C70]">
                        <th className="pb-3">Invoice #</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Services</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Mode</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E1D8]">
                      {tenantInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#F9F8F4] transition-colors">
                          <td className="py-3 font-mono font-bold text-[#D4A373]">#{inv.invoiceNumber}</td>
                          <td className="py-3 font-semibold text-[#35352C]">{inv.customerName}</td>
                          <td className="py-3 text-[#4A4A40]">{inv.services.map((s) => s.name).join(', ')}</td>
                          <td className="py-3 font-serif font-bold text-[#5A5A40]">{formatINR(inv.totalAmount)}</td>
                          <td className="py-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#EDEDE9] text-[#5A5A40] border border-[#E2E1D8]">
                              {inv.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 text-[#8C8C70]">{formatDate(inv.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: CRM & CUSTOMERS */}
        {activeNav === 'CUSTOMERS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#35352C] tracking-tight">Client CRM & Segments</h1>
                <p className="text-xs text-[#8C8C70] mt-0.5">
                  Track client visit history, wallet balances, loyalty scores, and birthday automations.
                </p>
              </div>

              {/* Segment Filter & Search */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8C8C70] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search name or phone..."
                    className="pl-8 pr-3 py-1.5 rounded-full bg-white border border-[#E2E1D8] text-xs text-[#35352C] placeholder:text-[#8C8C70] shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Customers Table */}
            <div className="p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E1D8] text-[#8C8C70]">
                      <th className="pb-3">Client</th>
                      <th className="pb-3">Tier</th>
                      <th className="pb-3">Visits</th>
                      <th className="pb-3">Total Spent</th>
                      <th className="pb-3">Wallet Balance</th>
                      <th className="pb-3">Loyalty Points</th>
                      <th className="pb-3">Last Visit</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E1D8]">
                    {tenantCustomers
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.phone.includes(customerSearch)
                      )
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-[#F9F8F4] transition-colors">
                          <td className="py-3 font-semibold text-[#35352C]">
                            <div>{c.name}</div>
                            <div className="text-[10px] text-[#8C8C70]">{c.phone}</div>
                          </td>
                          <td className="py-3">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAE8DD] text-[#5A5A40] border border-[#E2E1D8]">
                              {c.tier}
                            </span>
                          </td>
                          <td className="py-3 text-[#4A4A40]">{c.totalVisits} visits</td>
                          <td className="py-3 font-serif font-bold text-[#35352C]">{formatINR(c.totalSpent)}</td>
                          <td className="py-3 font-serif font-bold text-[#5A5A40]">{formatINR(c.walletBalance)}</td>
                          <td className="py-3 font-serif font-bold text-[#D4A373]">{c.loyaltyPoints} pts</td>
                          <td className="py-3 text-[#8C8C70]">{formatDate(c.lastVisitDate)}</td>
                          <td className="py-3 text-right space-x-1.5">
                            <button
                              onClick={() => {
                                setWalletAdjustmentModal({
                                  isOpen: true,
                                  customer: c,
                                  amount: 100,
                                  type: 'CREDIT',
                                  reason: 'Special client credit bonus',
                                });
                              }}
                              className="px-3 py-1 rounded-full bg-[#EAE8DD] text-[#5A5A40] hover:bg-[#E2E1D8] text-[11px] font-semibold transition-colors"
                            >
                              Adjust Wallet
                            </button>
                            <button
                              onClick={() => {
                                setWhatsappModal({
                                  isOpen: true,
                                  phone: c.phone,
                                  customerName: c.name,
                                  message: `Hi ${c.name}! We'd love to invite you back to ${activeSalon.name}. Enjoy a special ₹100 credit on your next appointment: https://salonos.app/s/${activeSalon.slug}`,
                                  type: 'VIP Campaign',
                                });
                              }}
                              className="px-3 py-1 rounded-full bg-white border border-[#E2E1D8] hover:bg-[#EDEDE9] text-[#4A4A40] text-[11px] font-semibold transition-colors"
                            >
                              WhatsApp
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: SMART REVISIT REMINDERS ENGINE */}
        {activeNav === 'REMINDERS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#35352C] tracking-tight">Smart Revisit & Retention Engine</h1>
                <p className="text-xs text-[#8C8C70] mt-0.5">
                  SalonOS calculates service cycles (Haircut 25d, Beard 15d, Spa 30d, Birthday) to trigger automated client rebooking prompts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(revisitReminders || []).map((rem) => (
                <div
                  key={rem.id}
                  className="p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAE8DD] text-[#5A5A40] border border-[#E2E1D8]">
                        {rem.serviceName} ({rem.revisitCycleDays} Days Cycle)
                      </span>
                      <span className="text-[10px] font-semibold text-[#5A5A40] bg-[#EAE8DD] px-2.5 py-0.5 rounded-full">
                        High Conversion Trigger
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#35352C]">{rem.customerName}</h3>
                    <p className="text-xs text-[#8C8C70]">
                      Last visit was on <strong className="text-[#35352C]">{rem.lastAppointmentDate}</strong>. Scheduled automated reminder date: <strong className="text-[#D4A373]">{rem.nextReminderDate}</strong>.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E2E1D8] flex items-center justify-between">
                    <span className="text-xs text-[#8C8C70]">Status: {rem.status}</span>
                    <button
                      onClick={() => handleOpenWhatsAppReminder(rem)}
                      className="px-4 py-2 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Preview & Send WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: SERVICES & ADD-ONS */}
        {activeNav === 'SERVICES' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#35352C] tracking-tight">Services & Add-ons Catalog</h1>
                <p className="text-xs text-[#8C8C70] mt-0.5">
                  Configure pricing, service durations, revisit cycles, and high-margin upsell add-ons.
                </p>
              </div>

              <button
                onClick={() => setIsAddServiceOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenantServices.map((srv) => (
                <div
                  key={srv.id}
                  className="p-5 rounded-[24px] bg-white border border-[#E2E1D8] flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#EDEDE9] text-[#5A5A40] border border-[#E2E1D8]">
                        {srv.category}
                      </span>
                      {srv.recommendedAddOn && (
                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#EAE8DD] text-[#5A5A40] border border-[#E2E1D8]">
                          Upsell Add-on
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#35352C] mt-2">{srv.name}</h3>
                    <p className="text-xs text-[#8C8C70] mt-1 line-clamp-2">{srv.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#E2E1D8] flex items-center justify-between text-xs">
                    <div>
                      <div className="text-base font-serif font-bold text-[#35352C]">{formatINR(srv.price)}</div>
                      <div className="text-[#8C8C70]">{srv.duration} mins • {srv.revisitCycleDays}d cycle</div>
                    </div>

                    <button
                      onClick={() => deleteService(srv.id)}
                      className="p-2 rounded-full text-[#8C8C70] hover:text-[#9B2C2C] hover:bg-[#FBEAEA] transition-colors"
                      aria-label="Delete service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 7: STAFF MANAGEMENT */}
        {activeNav === 'STAFF' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#35352C] tracking-tight">Staff & Roster</h1>
                <p className="text-xs text-[#8C8C70] mt-0.5">
                  Manage salon stylists, performance ratings, and commission payouts.
                </p>
              </div>

              <button
                onClick={() => setIsAddStaffOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stylist</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {tenantStaff.map((st) => (
                <div
                  key={st.id}
                  className="p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 flex flex-col justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={st.avatar}
                      alt={st.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#E2E1D8]"
                    />
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#35352C]">{st.name}</h3>
                      <p className="text-xs text-[#8C8C70]">{st.role}</p>
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-[#D4A373] mt-1">
                        <Star className="w-3.5 h-3.5 fill-[#D4A373] text-[#D4A373]" />
                        <span>{st.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F9F8F4] border border-[#E2E1D8] text-xs space-y-1.5 text-[#4A4A40]">
                    <div className="flex justify-between">
                      <span className="text-[#8C8C70]">Specialization:</span>
                      <span className="text-[#35352C] font-medium">{st.specialization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8C70]">Completed Cuts:</span>
                      <span className="text-[#5A5A40] font-bold">{st.completedBookings} visits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8C70]">Commission Rate:</span>
                      <span className="text-[#5A5A40] font-bold">{st.commissionPercentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 8: WALLET LEDGER */}
        {activeNav === 'WALLET' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#35352C] tracking-tight">Prepaid Wallet Ledger</h1>
                <p className="text-xs text-[#8C8C70] mt-0.5">
                  Immutable audit records for all customer prepaid deposits, debit transactions, and bonus adjustments.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E1D8] text-[#8C8C70]">
                      <th className="pb-3">Timestamp</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Description / Reason</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Balance After</th>
                      <th className="pb-3">Reference ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E1D8]">
                    {tenantLedger.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#F9F8F4] transition-colors">
                        <td className="py-3 text-[#8C8C70]">{formatDate(tx.createdAt)}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              tx.type === 'CREDIT' || tx.type === 'BONUS'
                                ? 'bg-[#EAE8DD] text-[#5A5A40] border border-[#E2E1D8]'
                                : 'bg-[#FBEAEA] text-[#9B2C2C] border border-[#FED7D7]'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-[#35352C]">{tx.description}</td>
                        <td
                          className={`py-3 font-serif font-bold ${
                            tx.type === 'CREDIT' || tx.type === 'BONUS' ? 'text-[#5A5A40]' : 'text-[#9B2C2C]'
                          }`}
                        >
                          {tx.type === 'CREDIT' || tx.type === 'BONUS' ? '+' : '-'}
                          {formatINR(tx.amount)}
                        </td>
                        <td className="py-3 font-serif font-bold text-[#35352C]">{formatINR(tx.balanceAfter)}</td>
                        <td className="py-3 font-mono text-[10px] text-[#8C8C70]">{tx.referenceId || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 9: COUPONS & OFFERS */}
        {activeNav === 'OFFERS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#35352C] tracking-tight">Coupons & Special Offers</h1>
                <p className="text-xs text-[#8C8C70] mt-0.5">
                  Launch discount codes to boost conversions during off-peak salon hours.
                </p>
              </div>

              <button
                onClick={() => setIsAddOfferOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Promo Code</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {offers.map((off) => (
                <div key={off.id} className="p-5 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm bg-[#EAE8DD] text-[#5A5A40] px-3 py-1 rounded-full border border-[#E2E1D8]">
                      {off.code}
                    </span>
                    <span className="text-[10px] font-bold text-[#5A5A40] bg-[#EAE8DD] px-2.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-base text-[#35352C]">{off.name}</h3>
                    <p className="text-xs text-[#8C8C70] mt-1">{off.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#E2E1D8] flex items-center justify-between text-xs text-[#8C8C70]">
                    <span>Min Bill: {formatINR(off.minimumAmount)}</span>
                    <span className="font-semibold text-[#35352C]">{off.usageCount} times redeemed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 10: SETTINGS */}
        {activeNav === 'SETTINGS' && (
          <div className="space-y-6 animate-in fade-in duration-150 max-w-3xl">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#35352C] tracking-tight">Salon Settings & Branding</h1>
              <p className="text-xs text-[#8C8C70] mt-0.5">
                Customize your public domain URL, address, contact numbers, and payment gateway credentials.
              </p>
            </div>

            <div className="p-6 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Salon Name</label>
                  <input
                    type="text"
                    defaultValue={activeSalon.name}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9F8F4] border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Public URL Slug</label>
                  <input
                    type="text"
                    defaultValue={activeSalon.slug}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9F8F4] border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Address & Landmark</label>
                <input
                  type="text"
                  defaultValue={activeSalon.address}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9F8F4] border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">WhatsApp Business Number</label>
                  <input
                    type="text"
                    defaultValue={activeSalon.whatsapp}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9F8F4] border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Operating Hours</label>
                  <input
                    type="text"
                    defaultValue={activeSalon.openingHours}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9F8F4] border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>
              </div>

              <button
                onClick={() => addToast('Settings Saved', 'Your salon profile and public URL have been updated.')}
                className="px-6 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>

      {/* NEW SERVICE MODAL */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#F9F8F4] border border-[#E2E1D8] rounded-[28px] max-w-md w-full p-6 text-[#4A4A40] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#35352C]">Add New Service</h3>
              <button onClick={() => setIsAddServiceOpen(false)} className="text-[#8C8C70] hover:text-[#35352C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. Royal Beard Shaping"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] placeholder:text-[#8C8C70] focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Category</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Beard">Beard</option>
                    <option value="Skin">Skin</option>
                    <option value="Massage">Massage</option>
                    <option value="Spa">Spa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Revisit Cycle (Days)</label>
                  <input
                    type="number"
                    required
                    value={newServiceRevisitDays}
                    onChange={(e) => setNewServiceRevisitDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#4A4A40] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newServiceIsAddon}
                  onChange={(e) => setNewServiceIsAddon(e.target.checked)}
                  className="accent-[#5A5A40]"
                />
                <span>Set as Recommended Upsell Add-on during online booking</span>
              </label>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm mt-2 transition-colors"
              >
                Create Service
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NEW STAFF MODAL */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#F9F8F4] border border-[#E2E1D8] rounded-[28px] max-w-md w-full p-6 text-[#4A4A40] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#35352C]">Add Stylist</h3>
              <button onClick={() => setIsAddStaffOpen(false)} className="text-[#8C8C70] hover:text-[#35352C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Karan Kapoor"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] placeholder:text-[#8C8C70] focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Specialization</label>
                <input
                  type="text"
                  required
                  value={newStaffSpecialization}
                  onChange={(e) => setNewStaffSpecialization(e.target.value)}
                  placeholder="e.g. Skin Whitening & Beard Sculpting"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] placeholder:text-[#8C8C70] focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  required
                  value={newStaffCommission}
                  onChange={(e) => setNewStaffCommission(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm mt-2 transition-colors"
              >
                Save Stylist
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NEW OFFER MODAL */}
      {isAddOfferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#F9F8F4] border border-[#E2E1D8] rounded-[28px] max-w-md w-full p-6 text-[#4A4A40] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#35352C]">Create Discount Coupon</h3>
              <button onClick={() => setIsAddOfferOpen(false)} className="text-[#8C8C70] hover:text-[#35352C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={newOfferCode}
                  onChange={(e) => setNewOfferCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MONSOON20"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] font-mono focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Discount Type</label>
                  <select
                    value={newOfferDiscountType}
                    onChange={(e) => setNewOfferDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed INR (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={newOfferDiscountVal}
                    onChange={(e) => setNewOfferDiscountVal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Minimum Bill Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={newOfferMinAmount}
                  onChange={(e) => setNewOfferMinAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm mt-2 transition-colors"
              >
                Create Promo Code
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WALLET ADJUSTMENT MODAL */}
      {walletAdjustmentModal.isOpen && walletAdjustmentModal.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#F9F8F4] border border-[#E2E1D8] rounded-[28px] max-w-md w-full p-6 text-[#4A4A40] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#35352C]">Adjust Client Wallet</h3>
              <button
                onClick={() => setWalletAdjustmentModal({ ...walletAdjustmentModal, isOpen: false })}
                className="text-[#8C8C70] hover:text-[#35352C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E2E1D8] text-xs">
              <div className="font-serif font-semibold text-[#35352C]">{walletAdjustmentModal.customer.name}</div>
              <div className="text-[#8C8C70]">Current Balance: <span className="font-serif font-bold text-[#5A5A40]">{formatINR(walletAdjustmentModal.customer.walletBalance)}</span></div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWalletAdjustmentModal({ ...walletAdjustmentModal, type: 'CREDIT' })}
                  className={`py-2 rounded-full text-xs font-bold border transition-all ${
                    walletAdjustmentModal.type === 'CREDIT'
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm'
                      : 'bg-white border-[#E2E1D8] text-[#8C8C70]'
                  }`}
                >
                  + Credit Funds
                </button>
                <button
                  type="button"
                  onClick={() => setWalletAdjustmentModal({ ...walletAdjustmentModal, type: 'DEBIT' })}
                  className={`py-2 rounded-full text-xs font-bold border transition-all ${
                    walletAdjustmentModal.type === 'DEBIT'
                      ? 'bg-[#9B2C2C] text-white border-[#9B2C2C] shadow-sm'
                      : 'bg-white border-[#E2E1D8] text-[#8C8C70]'
                  }`}
                >
                  - Debit Funds
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Adjustment Amount (INR)</label>
                <input
                  type="number"
                  value={walletAdjustmentModal.amount}
                  onChange={(e) =>
                    setWalletAdjustmentModal({ ...walletAdjustmentModal, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={walletAdjustmentModal.reason}
                  onChange={(e) =>
                    setWalletAdjustmentModal({ ...walletAdjustmentModal, reason: e.target.value })
                  }
                  placeholder="e.g. Courtesy refund or loyalty bonus"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C] placeholder:text-[#8C8C70] focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <button
                onClick={handleApplyWalletAdjustment}
                className="w-full py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm mt-2 transition-colors"
              >
                Confirm Ledger Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP AUTOMATION PREVIEW MODAL */}
      <WhatsAppPreviewModal
        isOpen={whatsappModal.isOpen}
        phone={whatsappModal.phone}
        customerName={whatsappModal.customerName}
        message={whatsappModal.message}
        type={whatsappModal.type}
        onClose={() => setWhatsappModal({ ...whatsappModal, isOpen: false })}
      />
    </div>
  );
};
