/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SalonProvider, useSalon } from './context/SalonContext';
import { TopNavigationSwitcher } from './components/common/TopNavigationSwitcher';
import { Toast } from './components/common/Toast';
import { PhoneAuthModal } from './components/common/PhoneAuthModal';
import { OwnerOnboardingWizard } from './components/common/OwnerOnboardingWizard';
import { LandingPage } from './components/landing/LandingPage';
import { PublicSalonPage } from './components/public-salon/PublicSalonPage';
import { CustomerApp } from './components/customer-app/CustomerApp';
import { OwnerDashboard } from './components/dashboard/OwnerDashboard';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';

const MainViewRouter: React.FC = () => {
  const {
    viewMode,
    isAuthModalOpen,
    closeAuthModal,
    authRoleHint,
    currentUser,
    isOnboardingOpen,
    setIsOnboardingOpen,
    setActiveSalonId,
    setPublicSalonSlug,
    setViewMode,
  } = useSalon();

  return (
    <div id="salonos-root" className="min-h-screen bg-[#F9F8F4] text-[#4A4A40] flex flex-col font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Top Universal Mode & Tenant Switcher Toolbar */}
      <TopNavigationSwitcher />

      {/* Primary View Outlet */}
      <main className="flex-1 flex flex-col">
        {viewMode === 'LANDING' && <LandingPage />}
        {viewMode === 'PUBLIC_SALON' && <PublicSalonPage />}
        {viewMode === 'CUSTOMER_APP' && <CustomerApp />}
        {viewMode === 'DASHBOARD' && <OwnerDashboard />}
        {viewMode === 'SUPER_ADMIN' && <SuperAdminDashboard />}
      </main>

      {/* Firebase Phone OTP Authentication Modal */}
      <PhoneAuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        roleHint={authRoleHint}
      />

      {/* First-Time Owner Salon Onboarding Wizard */}
      <OwnerOnboardingWizard
        isOpen={isOnboardingOpen}
        ownerUid={currentUser?.uid || ''}
        ownerPhone={currentUser?.phoneNumber || ''}
        onComplete={(newSalon) => {
          setIsOnboardingOpen(false);
          setActiveSalonId(newSalon.id);
          setPublicSalonSlug(newSalon.slug);
          setViewMode('DASHBOARD');
        }}
      />

      {/* Global Notification Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <SalonProvider>
      <MainViewRouter />
    </SalonProvider>
  );
}
