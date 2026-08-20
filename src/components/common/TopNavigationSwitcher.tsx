import React from 'react';
import { useSalon } from '../../context/SalonContext';
import {
  Globe,
  Store,
  Smartphone,
  LayoutDashboard,
  ShieldAlert,
  Building2,
  UserCheck,
  Sparkles,
  LogIn,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { UserRole } from '../../types';

export const TopNavigationSwitcher: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    salons,
    activeSalonId,
    setActiveSalonId,
    activeSalon,
    currentRole,
    setCurrentRole,
    setPublicSalonSlug,
    currentUser,
    openAuthModal,
    signOutUser,
    setIsOnboardingOpen,
    isDemoMode,
    loadDemoSalon,
  } = useSalon();

  const handleSalonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setActiveSalonId(sId);
    const target = salons.find((s) => s.id === sId);
    if (target) {
      setPublicSalonSlug(target.slug);
    }
  };

  return (
    <header
      id="salonos-top-bar"
      className="bg-[#F1F0E8] text-[#4A4A40] border-b border-[#E2E1D8] sticky top-0 z-40 px-3 sm:px-6 py-2.5 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setViewMode('LANDING')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[#5A5A40] flex items-center justify-center text-[#F9F8F4] font-serif font-bold text-base shadow-sm group-hover:bg-[#474732] transition-colors">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-bold text-lg tracking-tight text-[#5A5A40]">
                  SalonOS
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E4E4D9] text-[#5A5A40] border border-[#E2E1D8]">
                  SaaS Platform
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#EDEDE9] p-1 rounded-full border border-[#E2E1D8] overflow-x-auto">
          <button
            id="nav-btn-landing"
            onClick={() => setViewMode('LANDING')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
              viewMode === 'LANDING'
                ? 'bg-[#5A5A40] text-white font-semibold shadow-sm'
                : 'text-[#8C8C70] hover:text-[#5A5A40] hover:bg-[#F9F8F4]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SaaS Home</span>
          </button>

          <button
            id="nav-btn-public-salon"
            onClick={() => {
              if (activeSalon?.slug) {
                setPublicSalonSlug(activeSalon.slug);
              }
              setViewMode('PUBLIC_SALON');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
              viewMode === 'PUBLIC_SALON'
                ? 'bg-[#5A5A40] text-white font-semibold shadow-sm'
                : 'text-[#8C8C70] hover:text-[#5A5A40] hover:bg-[#F9F8F4]'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </button>

          <button
            id="nav-btn-customer-app"
            onClick={() => {
              setCurrentRole('CUSTOMER');
              setViewMode('CUSTOMER_APP');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
              viewMode === 'CUSTOMER_APP'
                ? 'bg-[#5A5A40] text-white font-semibold shadow-sm'
                : 'text-[#8C8C70] hover:text-[#5A5A40] hover:bg-[#F9F8F4]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer PWA</span>
          </button>

          <button
            id="nav-btn-dashboard"
            onClick={() => {
              if (!currentUser && salons.length === 0) {
                openAuthModal('OWNER');
              } else {
                if (currentRole === 'CUSTOMER' || currentRole === 'SUPER_ADMIN') {
                  setCurrentRole('OWNER');
                }
                setViewMode('DASHBOARD');
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
              viewMode === 'DASHBOARD'
                ? 'bg-[#5A5A40] text-white font-semibold shadow-sm'
                : 'text-[#8C8C70] hover:text-[#5A5A40] hover:bg-[#F9F8F4]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Salon Dashboard</span>
          </button>

          <button
            id="nav-btn-super-admin"
            onClick={() => {
              setCurrentRole('SUPER_ADMIN');
              setViewMode('SUPER_ADMIN');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
              viewMode === 'SUPER_ADMIN'
                ? 'bg-[#474732] text-white font-semibold shadow-sm'
                : 'text-[#8C8C70] hover:text-[#474732] hover:bg-[#F9F8F4]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </button>
        </nav>

        {/* Right Action Section: Tenant Selector & Auth */}
        <div className="flex items-center gap-2">
          {/* Active Salon Tenant Dropdown (when salons exist) */}
          {salons.length > 0 ? (
            <div className="flex items-center gap-1.5 bg-white border border-[#E2E1D8] rounded-full px-3 py-1.5 text-[#4A4A40] shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
              <select
                id="select-tenant-salon"
                value={activeSalonId}
                onChange={handleSalonChange}
                className="bg-transparent text-[#4A4A40] font-medium focus:outline-none cursor-pointer text-xs max-w-[140px] truncate"
              >
                {salons.map((salon) => (
                  <option key={salon.id} value={salon.id} className="bg-white text-[#4A4A40]">
                    {salon.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!currentUser) openAuthModal('OWNER');
                else setIsOnboardingOpen(true);
              }}
              className="flex items-center gap-1 bg-white hover:bg-[#FAF9F5] border border-[#E2E1D8] rounded-full px-3 py-1.5 text-xs font-semibold text-[#5A5A40]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Salon</span>
            </button>
          )}

          {/* Role Switcher */}
          <div className="hidden md:flex items-center gap-1.5 bg-white border border-[#E2E1D8] rounded-full px-3 py-1.5 text-[#4A4A40] shadow-sm">
            <UserCheck className="w-3.5 h-3.5 text-[#D4A373] shrink-0" />
            <select
              id="select-active-role"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-transparent text-[#4A4A40] font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="OWNER" className="bg-white text-[#4A4A40]">Role: Owner</option>
              <option value="MANAGER" className="bg-white text-[#4A4A40]">Role: Manager</option>
              <option value="STAFF" className="bg-white text-[#4A4A40]">Role: Staff</option>
              <option value="CUSTOMER" className="bg-white text-[#4A4A40]">Role: Customer</option>
              <option value="SUPER_ADMIN" className="bg-white text-[#4A4A40]">Role: Super Admin</option>
            </select>
          </div>

          {/* User Auth Pill */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-[#5A5A40] text-white rounded-full pl-3 pr-1.5 py-1 text-xs shadow-sm">
              <span className="font-semibold">{currentUser.phoneNumber || 'Owner'}</span>
              <button
                id="btn-signout"
                onClick={signOutUser}
                title="Sign Out"
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              id="btn-nav-login"
              onClick={() => openAuthModal('OWNER')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold text-xs shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
