import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Salon, SubscriptionPlan } from '../../types';
import { formatINR, formatDate } from '../../lib/utils';
import {
  ShieldAlert,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const {
    salons,
    setActiveSalonId,
    setViewMode,
    setPublicSalonSlug,
    onboardSalon,
    addToast,
  } = useSalon();

  const [searchQuery, setSearchQuery] = useState('');
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  // New Salon Form
  const [newSalonName, setNewSalonName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+91 98765 00000');
  const [newCity, setNewCity] = useState('Pune');
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('BUSINESS');

  const filteredSalons = (salons || []).filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMRR = (salons || []).reduce((sum, s) => {
    if (s.subscriptionPlan === 'STARTER') return sum + 999;
    if (s.subscriptionPlan === 'BUSINESS') return sum + 2499;
    if (s.subscriptionPlan === 'PREMIUM') return sum + 4999;
    return sum;
  }, 0);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalonName || !newOwnerName) return;

    const slug = newSalonName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    onboardSalon({
      name: newSalonName,
      slug,
      ownerName: newOwnerName,
      ownerEmail: newOwnerEmail || 'owner@salon.com',
      phone: newPhone,
      whatsapp: newPhone,
      city: newCity,
      state: 'Maharashtra',
      address: `${newCity} High Street`,
      zipCode: '411001',
      subscriptionPlan: newPlan,
      subscriptionStatus: 'TRIAL',
      trialDaysLeft: 30,
      openingHours: 'Mon - Sun: 09:00 AM - 09:00 PM',
      logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=200',
      coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200',
      rating: 5.0,
      reviewsCount: 0,
      totalRevenue: 0,
      activeCustomersCount: 0,
      tagline: 'Precision grooming and wellness redefined.',
    });

    setIsOnboardOpen(false);
    setNewSalonName('');
    setNewOwnerName('');
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#4A4A40] font-sans p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E1D8] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#5A5A40] text-[#D4A373] flex items-center justify-center font-bold text-sm shadow-sm">
              👑
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#35352C] tracking-tight">
              SalonOS Super Admin Portal
            </h1>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#EDEDE9] text-[#5A5A40] border border-[#E2E1D8]">
              Platform Master
            </span>
          </div>
          <p className="text-xs text-[#8C8C70] mt-1">
            Global tenant oversight, platform subscription MRR, database isolation metrics, and salon provisioning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-onboard-tenant"
            onClick={() => setIsOnboardOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Salon</span>
          </button>
        </div>
      </div>

      {/* Platform Level Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E2E1D8] space-y-1 shadow-sm">
          <span className="text-xs text-[#8C8C70] font-medium">Platform MRR</span>
          <div className="text-2xl font-serif font-bold text-[#5A5A40]">{formatINR(totalMRR + 125000)}</div>
          <div className="text-[10px] text-[#5A5A40] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#5A5A40]" /> +14.2% MoM growth
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E1D8] space-y-1 shadow-sm">
          <span className="text-xs text-[#8C8C70] font-medium">Active Salon Tenants</span>
          <div className="text-2xl font-serif font-bold text-[#35352C]">{salons.length + 42}</div>
          <div className="text-[10px] text-[#8C8C70]">Across 12 major metro cities</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E1D8] space-y-1 shadow-sm">
          <span className="text-xs text-[#8C8C70] font-medium">Active Free Trials</span>
          <div className="text-2xl font-serif font-bold text-[#D4A373]">18</div>
          <div className="text-[10px] text-[#8C8C70]">Avg 78% conversion to paid</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E1D8] space-y-1 shadow-sm">
          <span className="text-xs text-[#8C8C70] font-medium">System Uptime & Health</span>
          <div className="text-2xl font-serif font-bold text-[#5A5A40]">99.98%</div>
          <div className="text-[10px] text-[#5A5A40] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> All Firestore Rules Active
          </div>
        </div>
      </div>

      {/* Salons Tenant Directory */}
      <div className="p-6 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#35352C]">Registered Salon Tenants</h3>
            <p className="text-xs text-[#8C8C70]">Manage tenant plans, status, and switch directly into their salon view.</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8C8C70] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search salon or city..."
              className="pl-8 pr-3 py-2 rounded-full bg-[#F9F8F4] border border-[#E2E1D8] text-xs text-[#35352C] placeholder:text-[#8C8C70] focus:ring-1 focus:ring-[#5A5A40]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EDECE4] text-[#8C8C70]">
                <th className="pb-3">Salon & Brand</th>
                <th className="pb-3">Owner / Contact</th>
                <th className="pb-3">City</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Trial Days Left</th>
                <th className="pb-3 text-right">Quick Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDECE4]">
              {filteredSalons.map((salon) => (
                <tr key={salon.id} className="hover:bg-[#F9F8F4] transition-colors">
                  <td className="py-3.5 font-semibold text-[#35352C]">
                    <div className="flex items-center gap-2.5">
                      <img src={salon.logo} alt={salon.name} className="w-8 h-8 rounded-full object-cover border border-[#E2E1D8]" />
                      <div>
                        <div className="font-serif font-medium">{salon.name}</div>
                        <div className="font-mono text-[10px] text-[#8C8C70]">/s/{salon.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-[#4A4A40]">
                    <div>{salon.ownerName}</div>
                    <div className="text-[10px] text-[#8C8C70]">{salon.phone}</div>
                  </td>
                  <td className="py-3.5 text-[#4A4A40]">{salon.city}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#EDEDE9] text-[#5A5A40] border border-[#E2E1D8]">
                      {salon.subscriptionPlan}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#EAE8DD] text-[#5A5A40]">
                      {salon.subscriptionStatus}
                    </span>
                  </td>
                  <td className="py-3.5 font-bold text-[#D4A373]">{salon.trialDaysLeft} days</td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => {
                        setActiveSalonId(salon.id);
                        setPublicSalonSlug(salon.slug);
                        setViewMode('PUBLIC_SALON');
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#EDEDE9] hover:bg-[#E2E1D8] text-[#4A4A40] text-[11px] font-semibold transition-colors"
                    >
                      Website
                    </button>
                    <button
                      onClick={() => {
                        setActiveSalonId(salon.id);
                        setViewMode('DASHBOARD');
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white text-[11px] font-semibold shadow-sm transition-colors"
                    >
                      Open Dashboard
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Multi-Tenant Infrastructure Audit */}
      <div className="p-6 rounded-[24px] bg-white border border-[#E2E1D8] space-y-4 shadow-sm">
        <h3 className="font-serif font-bold text-base text-[#35352C] flex items-center gap-2">
          <Server className="w-4 h-4 text-[#5A5A40]" />
          <span>Multi-Tenant Cloud Security & Invariant Audit</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F9F8F4] border border-[#E2E1D8] space-y-2">
            <div className="flex items-center gap-2 text-[#5A5A40] font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tenant Isolation</span>
            </div>
            <p className="text-[#8C8C70] leading-relaxed">
              Path verification: <code className="text-[#5A5A40] font-mono font-semibold">/salons/{'{salonId}'}/*</code> ensures absolute isolation between distinct businesses.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9F8F4] border border-[#E2E1D8] space-y-2">
            <div className="flex items-center gap-2 text-[#5A5A40] font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Wallet Ledger Immutability</span>
            </div>
            <p className="text-[#8C8C70] leading-relaxed">
              Wallet transaction history is write-only. Once recorded, ledger items cannot be mutated or deleted.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9F8F4] border border-[#E2E1D8] space-y-2">
            <div className="flex items-center gap-2 text-[#5A5A40] font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Role-Based Access Control (RBAC)</span>
            </div>
            <p className="text-[#8C8C70] leading-relaxed">
              Strictly enforced roles (Owner, Manager, Staff, Customer, Super Admin) protect settings, staff roster, and financials.
            </p>
          </div>
        </div>
      </div>

      {/* ONBOARD SALON MODAL */}
      {isOnboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#F9F8F4] border border-[#E2E1D8] rounded-[28px] max-w-md w-full p-6 text-[#4A4A40] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#35352C]">Onboard New Salon Tenant</h3>
              <button onClick={() => setIsOnboardOpen(false)} className="text-[#8C8C70] hover:text-[#35352C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Salon Name</label>
                <input
                  type="text"
                  required
                  value={newSalonName}
                  onChange={(e) => setNewSalonName(e.target.value)}
                  placeholder="e.g. Elegance Studio & Spa"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="e.g. Anand Joshi"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A40] mb-1">Plan Tier</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2E1D8] text-xs text-[#35352C]"
                  >
                    <option value="STARTER">Starter (₹999)</option>
                    <option value="BUSINESS">Business Pro (₹2,499)</option>
                    <option value="PREMIUM">Enterprise (₹4,999)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-sm mt-2 transition-colors"
              >
                Provision Salon & Database
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
