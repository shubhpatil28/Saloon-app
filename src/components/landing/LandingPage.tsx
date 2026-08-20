import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { SUBSCRIPTION_PLANS } from '../../data/seedData';
import { formatINR } from '../../lib/utils';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone,
  Store,
  LayoutDashboard,
  Users,
  Repeat,
  Wallet,
  Gift,
  Clock,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building2,
  Star,
  LogIn,
  Layers,
  Phone,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    setViewMode,
    setCurrentRole,
    activeSalon,
    setPublicSalonSlug,
    currentUser,
    openAuthModal,
    salons,
    loadDemoSalon,
    isDemoMode,
  } = useSalon();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // ROI Calculator State
  const [monthlyCustomers, setMonthlyCustomers] = useState<number>(450);
  const [avgTicketPrice, setAvgTicketPrice] = useState<number>(350);

  const currentMonthlyRevenue = monthlyCustomers * avgTicketPrice;
  const projectedRevenueGain = Math.round(currentMonthlyRevenue * 0.32);
  const totalProjectedRevenue = currentMonthlyRevenue + projectedRevenueGain;

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#4A4A40] selection:bg-[#5A5A40] selection:text-white font-sans">
      {/* SaaS Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle warm natural glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D4A373]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDEDE9] border border-[#E2E1D8] text-xs font-semibold text-[#5A5A40] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            <span className="tracking-wide uppercase text-[11px] font-bold">Salon Digital Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif tracking-tight text-[#35352C] leading-[1.15] max-w-4xl mx-auto">
            Turn Every Salon Visit Into a{' '}
            <span className="italic text-[#5A5A40]">
              Cherished Long-Term Ritual.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#8C8C70] max-w-2xl mx-auto leading-relaxed">
            Appointments, client CRM, automated WhatsApp revisit reminders, prepaid wellness wallets, loyalty rewards, and billing — all unified in one serene multi-tenant SaaS.
          </p>

          {/* Direct CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {currentUser ? (
              <button
                id="btn-hero-dashboard"
                onClick={() => {
                  setCurrentRole('OWNER');
                  setViewMode('DASHBOARD');
                }}
                className="px-8 py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-all hover:scale-102"
              >
                <span>Go to My Salon Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-hero-start-trial"
                onClick={() => openAuthModal('OWNER')}
                className="px-8 py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-all hover:scale-102"
              >
                <Phone className="w-4 h-4" />
                <span>Sign In / Register with Phone OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {salons.length > 0 && activeSalon?.slug ? (
              <button
                id="btn-hero-explore-salon"
                onClick={() => {
                  setPublicSalonSlug(activeSalon.slug);
                  setViewMode('PUBLIC_SALON');
                }}
                className="px-7 py-3.5 rounded-full bg-white hover:bg-[#F1F0E8] text-[#4A4A40] border border-[#E2E1D8] font-semibold text-sm shadow-sm transition-all"
              >
                View Live Salon Website
              </button>
            ) : (
              <button
                id="btn-hero-demo"
                onClick={() => loadDemoSalon()}
                className="px-7 py-3.5 rounded-full bg-white hover:bg-[#F1F0E8] text-[#4A4A40] border border-[#E2E1D8] font-semibold text-sm shadow-sm flex items-center gap-2 transition-all"
              >
                <Layers className="w-4 h-4 text-[#D4A373]" />
                <span>Explore Interactive Demo Mode</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-[#E2E1D8] pt-8">
            <div className="text-center">
              <div className="text-2xl font-serif font-bold text-[#35352C]">100%</div>
              <div className="text-xs text-[#8C8C70] mt-0.5">Multi-Tenant Isolation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-serif font-bold text-[#5A5A40]">28%</div>
              <div className="text-xs text-[#8C8C70] mt-0.5">Higher Repeat Visits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-serif font-bold text-[#D4A373]">0%</div>
              <div className="text-xs text-[#8C8C70] mt-0.5">Double Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-serif font-bold text-[#6B705C]">&lt; 30s</div>
              <div className="text-xs text-[#8C8C70] mt-0.5">PWA Instant Booking</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Interactive System Personas */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F1F0E8] border-y border-[#E2E1D8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8C8C70] mb-1 font-semibold">Unified Ecosystem</p>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#35352C]">
              Explore All 4 Dedicated Interfaces
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#8C8C70]">
              SalonOS powers the entire lifecycle: from the customer's mobile booking to the stylist chair and super-admin cloud.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Persona 1: Public Website */}
            <div
              id="card-persona-public"
              onClick={() => {
                if (activeSalon?.slug) setPublicSalonSlug(activeSalon.slug);
                setViewMode('PUBLIC_SALON');
              }}
              className="p-6 rounded-[28px] bg-white border border-[#E2E1D8] hover:border-[#5A5A40] cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#F1F0E8] text-[#5A5A40] flex items-center justify-center font-bold mb-4">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#35352C] group-hover:text-[#5A5A40] transition-colors">
                  Public Salon Portal
                </h3>
                <p className="text-xs text-[#8C8C70] mt-2 leading-relaxed">
                  SEO-ready website at <code className="text-[#5A5A40] font-semibold">/s/{activeSalon?.slug || 'salon'}</code> with service catalog, stylists, reviews, and instant appointment booking.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#EDECE4] flex items-center justify-between text-xs font-semibold text-[#5A5A40]">
                <span>Open Public Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Persona 2: Customer PWA */}
            <div
              id="card-persona-customer"
              onClick={() => {
                setCurrentRole('CUSTOMER');
                setViewMode('CUSTOMER_APP');
              }}
              className="p-6 rounded-[28px] bg-white border border-[#E2E1D8] hover:border-[#5A5A40] cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#E4E4D9] text-[#5A5A40] flex items-center justify-center font-bold mb-4">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#35352C] group-hover:text-[#5A5A40] transition-colors">
                  Customer App / PWA
                </h3>
                <p className="text-xs text-[#8C8C70] mt-2 leading-relaxed">
                  Mobile-first experience with smart revisit reminder cards, prepaid wallet, loyalty points unlock, referral code sharing, and one-tap rebooking.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#EDECE4] flex items-center justify-between text-xs font-semibold text-[#5A5A40]">
                <span>Launch Customer PWA</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Persona 3: Owner Dashboard */}
            <div
              id="card-persona-dashboard"
              onClick={() => {
                if (!currentUser && salons.length === 0) {
                  openAuthModal('OWNER');
                } else {
                  setCurrentRole('OWNER');
                  setViewMode('DASHBOARD');
                }
              }}
              className="p-6 rounded-[28px] bg-white border border-[#E2E1D8] hover:border-[#5A5A40] cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#EDEDE9] text-[#5A5A40] flex items-center justify-center font-bold mb-4">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#35352C] group-hover:text-[#5A5A40] transition-colors">
                  Owner & Staff Dashboard
                </h3>
                <p className="text-xs text-[#8C8C70] mt-2 leading-relaxed">
                  Comprehensive dashboard for appointment calendar, staff scheduling, CRM segments, billing/POS, analytics, and WhatsApp campaign dispatch.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#EDECE4] flex items-center justify-between text-xs font-semibold text-[#5A5A40]">
                <span>Launch Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Persona 4: Super Admin */}
            <div
              id="card-persona-admin"
              onClick={() => {
                setCurrentRole('SUPER_ADMIN');
                setViewMode('SUPER_ADMIN');
              }}
              className="p-6 rounded-[28px] bg-white border border-[#E2E1D8] hover:border-[#474732] cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#474732] text-white flex items-center justify-center font-bold mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#35352C] group-hover:text-[#474732] transition-colors">
                  Super-Admin Portal
                </h3>
                <p className="text-xs text-[#8C8C70] mt-2 leading-relaxed">
                  Platform owner controls: multi-tenant salon provisions, subscription tier management, MRR analytics, and system audit logs.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#EDECE4] flex items-center justify-between text-xs font-semibold text-[#474732]">
                <span>Super-Admin View</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8C8C70] mb-1 font-semibold">Engineered For Salon Growth</p>
          <h2 className="text-3xl font-serif text-[#35352C]">
            Everything Needed to Run a Thriving Studio
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-[28px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#F1F0E8] text-[#5A5A40] flex items-center justify-center">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#35352C]">Intelligent Revisit Cycles</h3>
            <p className="text-xs sm:text-sm text-[#8C8C70] leading-relaxed">
              Every service has a natural cadence (Haircut: 25 days, Beard: 14 days, Hair Spa: 40 days). SalonOS automatically triggers gentle personalized WhatsApp invites at the perfect moment.
            </p>
          </div>

          <div className="p-8 rounded-[28px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#E4E4D9] text-[#5A5A40] flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#35352C]">Prepaid Wellness Wallet</h3>
            <p className="text-xs sm:text-sm text-[#8C8C70] leading-relaxed">
              Lock in upfront cash flow by letting clients top-up prepaid wallet balances with bonus credits. Creates impenetrable customer loyalty and repeat appointments.
            </p>
          </div>

          <div className="p-8 rounded-[28px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#EDEDE9] text-[#5A5A40] flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#35352C]">Integrated POS Billing</h3>
            <p className="text-xs sm:text-sm text-[#8C8C70] leading-relaxed">
              Instant GST compliant invoicing with split payments (Cash, UPI, Wallet, Loyalty Points). Print thermal receipts and send paperless WhatsApp tax invoices in one click.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing / Subscriptions Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F1F0E8] border-t border-[#E2E1D8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8C8C70] mb-1 font-semibold">Predictable SaaS Pricing</p>
            <h2 className="text-3xl font-serif text-[#35352C]">
              Simple Plans That Scale With Your Salons
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#8C8C70]">
              Every plan includes 30 days full-featured free trial. No credit card required to start.
            </p>

            {/* Billing cycle toggle */}
            <div className="mt-6 inline-flex items-center p-1 bg-[#EDEDE9] rounded-full border border-[#E2E1D8]">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-[#5A5A40] text-white shadow-sm'
                    : 'text-[#8C8C70] hover:text-[#5A5A40]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('YEARLY')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  billingCycle === 'YEARLY'
                    ? 'bg-[#5A5A40] text-white shadow-sm'
                    : 'text-[#8C8C70] hover:text-[#5A5A40]'
                }`}
              >
                <span>Yearly</span>
                <span className="text-[10px] bg-[#D4A373] text-white px-1.5 py-0.2 rounded-full font-bold">20% OFF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {(Object.entries(SUBSCRIPTION_PLANS) as [string, any][]).map(([planKey, plan]) => {
              const price = billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly;
              const isPopular = planKey === 'BUSINESS';
              const features = [
                `Up to ${plan.maxStaff === -1 ? 'Unlimited' : plan.maxStaff} Stylists & Staff`,
                `Up to ${plan.maxCustomers === -1 ? 'Unlimited' : plan.maxCustomers} Customer Profiles`,
                plan.walletEnabled ? 'Prepaid Wellness Wallet Engine' : 'Basic Cash & UPI POS',
                plan.whatsappAutomation ? 'Automated WhatsApp Revisit Reminders' : 'Manual SMS Notifications',
                plan.rewardsEnabled ? 'Loyalty Rewards & Referral Points' : 'Standard Invoicing',
                plan.advancedAnalytics ? 'Real-Time Revenue & Growth Analytics' : 'Daily Sales Summary',
              ];

              return (
                <div
                  key={planKey}
                  className={`p-8 rounded-[32px] bg-white border flex flex-col justify-between transition-all relative ${
                    isPopular
                      ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/10 shadow-lg'
                      : 'border-[#E2E1D8] shadow-sm'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5A5A40] text-white text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-[#35352C]">{plan.name}</h3>
                    </div>
                    <p className="text-xs text-[#8C8C70] mt-1">
                      {planKey === 'STARTER' ? 'Perfect for solo barbers & boutique salons' : planKey === 'BUSINESS' ? 'Complete automation suite for luxury salons' : 'Multi-branch & franchise network management'}
                    </p>

                    <div className="mt-6 mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-serif font-bold text-[#35352C]">{formatINR(price)}</span>
                        <span className="text-xs text-[#8C8C70]">/{billingCycle === 'YEARLY' ? 'year' : 'month'}</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-[#EDECE4]">
                      {features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-[#4A4A40]">
                          <CheckCircle2 className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#EDECE4]">
                    <button
                      onClick={() => openAuthModal('OWNER')}
                      className={`w-full py-3 rounded-full font-semibold text-xs transition-all ${
                        isPopular
                          ? 'bg-[#5A5A40] hover:bg-[#474732] text-white shadow-md'
                          : 'bg-[#EDEDE9] hover:bg-[#E4E4D9] text-[#4A4A40]'
                      }`}
                    >
                      Start 30-Day Free Trial
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#E2E1D8] bg-[#F9F8F4] text-xs text-[#8C8C70]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#5A5A40] flex items-center justify-center text-[#F9F8F4] font-serif font-bold text-xs">
              S
            </div>
            <span className="font-serif font-bold text-sm text-[#35352C]">SalonOS</span>
            <span>• Multi-Tenant Cloud Operating System</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Enterprise Multi-Tenancy</span>
            <span>Firebase Phone Auth</span>
            <span>© {new Date().getFullYear()} SalonOS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
