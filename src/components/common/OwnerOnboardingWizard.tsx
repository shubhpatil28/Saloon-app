import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Salon, Service, Staff } from '../../types';
import {
  Sparkles,
  Building2,
  Phone,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Scissors,
  UserCheck,
  Camera,
  Layers,
} from 'lucide-react';

interface OwnerOnboardingWizardProps {
  isOpen: boolean;
  ownerUid: string;
  ownerPhone: string;
  onComplete: (salon: Salon) => void;
}

export const OwnerOnboardingWizard: React.FC<OwnerOnboardingWizardProps> = ({
  isOpen,
  ownerUid,
  ownerPhone,
  onComplete,
}) => {
  const { onboardSalon, addToast } = useSalon();

  const [step, setStep] = useState<number>(1);
  const [salonName, setSalonName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [tagline, setTagline] = useState('Luxury Hair & Grooming Sanctuary');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [zipCode, setZipCode] = useState('400050');
  const [openingHours, setOpeningHours] = useState('09:00 AM - 09:00 PM');
  const [category, setCategory] = useState('Unisex Luxury Salon & Spa');
  const [logo, setLogo] = useState('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80');

  // Initial Services to setup
  const [services, setServices] = useState<Array<{ name: string; category: string; price: number; duration: number }>>([
    { name: 'Signature Haircut & Wash', category: 'Hair', price: 350, duration: 30 },
    { name: 'Beard Sculpting & Hot Towel', category: 'Beard', price: 200, duration: 25 },
  ]);

  // Initial Staff members
  const [staffList, setStaffList] = useState<Array<{ name: string; role: 'MANAGER' | 'STAFF'; specialization: string }>>([
    { name: 'Lead Stylist', role: 'STAFF', specialization: 'Master Cuts & Styling' },
  ]);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(250);
  const [newStaffName, setNewStaffName] = useState('');

  if (!isOpen) return null;

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    setServices([
      ...services,
      { name: newServiceName.trim(), category: 'Hair', price: newServicePrice || 250, duration: 30 },
    ]);
    setNewServiceName('');
    setNewServicePrice(250);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim()) return;
    setStaffList([
      ...staffList,
      { name: newStaffName.trim(), role: 'STAFF', specialization: 'Stylist' },
    ]);
    setNewStaffName('');
  };

  const handleRemoveStaff = (index: number) => {
    setStaffList(staffList.filter((_, i) => i !== index));
  };

  const handleFinishOnboarding = async () => {
    if (!salonName.trim()) {
      addToast('Missing Information', 'Please provide a name for your salon.', 'error');
      setStep(1);
      return;
    }

    const slug = salonName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `salon-${Date.now()}`;

    const newSalonData: Partial<Salon> = {
      name: salonName.trim(),
      slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
      tagline,
      ownerId: ownerUid,
      ownerName: ownerName.trim() || 'Salon Owner',
      ownerEmail: ownerEmail.trim() || `${ownerPhone.replace(/\D/g, '')}@salonos.in`,
      phone: ownerPhone,
      whatsapp: ownerPhone,
      address: address.trim() || 'Main High Street',
      city: city.trim() || 'Mumbai',
      state: state.trim() || 'Maharashtra',
      zipCode: zipCode.trim() || '400001',
      logo,
      coverImage,
      category,
      rating: 5.0,
      reviewsCount: 0,
      subscriptionPlan: 'BUSINESS',
      subscriptionStatus: 'TRIAL',
      trialStartDate: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      primaryColor: '#5A5A40',
      secondaryColor: '#D4A373',
      openingHours,
      pointsPer100: 10,
      referralRewardAmount: 100,
      birthdayRewardAmount: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createdSalon = onboardSalon(newSalonData);

    addToast('Salon Created! 🎉', `Welcome to SalonOS, ${newSalonData.name}!`);
    onComplete(createdSalon);
  };

  return (
    <div
      id="onboarding-modal-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        id="onboarding-modal-card"
        className="bg-[#F9F8F4] border border-[#E2E1D8] text-[#4A4A40] rounded-[28px] max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8"
      >
        {/* Header */}
        <div className="bg-[#5A5A40] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
              <Sparkles className="w-5 h-5 text-[#D4A373]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg">Salon Setup Wizard</h2>
              <p className="text-xs text-white/80">Step {step} of 3 • Digital Salon Creation</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-7 h-2 rounded-full transition-all ${
                  s === step
                    ? 'bg-[#D4A373]'
                    : s < step
                    ? 'bg-white/80'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* STEP 1: Basic Details & Branding */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-[#E2E1D8] pb-3">
                <h3 className="text-base font-serif font-bold text-[#35352C]">
                  Salon Identity & Contact
                </h3>
                <p className="text-xs text-[#8C8C70]">
                  This information will be displayed on your client booking portal and invoices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A5A40] mb-1">
                    Salon / Spa Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                    placeholder="e.g. Royal Glow Studio"
                    className="w-full bg-white border border-[#E2E1D8] rounded-full px-4 py-2.5 text-xs text-[#35352C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5A40] mb-1">
                    Owner Full Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Anand Sharma"
                    className="w-full bg-white border border-[#E2E1D8] rounded-full px-4 py-2.5 text-xs text-[#35352C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5A40] mb-1">
                    Verified Mobile Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value={ownerPhone}
                    className="w-full bg-[#EDEDE9] border border-[#E2E1D8] rounded-full px-4 py-2.5 text-xs text-[#8C8C70] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5A40] mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="contact@yourbrand.com"
                    className="w-full bg-white border border-[#E2E1D8] rounded-full px-4 py-2.5 text-xs text-[#35352C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#5A5A40] mb-1">
                    Catchy Tagline / Bio
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Masterful Cuts & Relaxing Spa Therapies"
                    className="w-full bg-white border border-[#E2E1D8] rounded-full px-4 py-2.5 text-xs text-[#35352C] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Address & Operational Hours */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-[#E2E1D8] pb-3">
                <h3 className="text-base font-serif font-bold text-[#35352C]">
                  Location & Operating Hours
                </h3>
                <p className="text-xs text-[#8C8C70]">
                  Help clients locate your salon easily and schedule bookings during open hours.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#5A5A40] mb-1">
                    Street Address / Landmark
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop 4, Sunrise Plaza, MG Road"
                    className="w-full bg-white border border-[#E2E1D8] rounded-full px-4 py-2.5 text-xs text-[#35352C] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5A40] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full bg-white border border-[#E2E1D8] rounded-full px-4 py-2.5 text-xs text-[#35352C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5A40] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full bg-white border border-[#E2E1D8] rounded-full px-4 py-2.5 text-xs text-[#35352C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5A40] mb-1">
                    Daily Working Hours
                  </label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="09:00 AM - 09:00 PM"
                    className="w-full bg-white border border-[#E2E1D8] rounded-full px-4 py-2.5 text-xs text-[#35352C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5A40] mb-1">
                    Category Focus
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-[#E2E1D8] rounded-full px-4 py-2.5 text-xs text-[#35352C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                  >
                    <option value="Unisex Luxury Salon & Spa">Unisex Luxury Salon & Spa</option>
                    <option value="Men's Barber & Grooming Lounge">Men's Barber & Grooming Lounge</option>
                    <option value="Women's Beauty & Hair Studio">Women's Beauty & Hair Studio</option>
                    <option value="Ayurvedic Wellness & Spa">Ayurvedic Wellness & Spa</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Initial Services & Staff Setup */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-[#E2E1D8] pb-3">
                <h3 className="text-base font-serif font-bold text-[#35352C]">
                  Services & Stylists
                </h3>
                <p className="text-xs text-[#8C8C70]">
                  Add your primary offerings. You can add and edit more anytime from your dashboard.
                </p>
              </div>

              {/* Services List */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#5A5A40]">
                  Initial Services ({services.length})
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-[#E2E1D8] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Scissors className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span className="font-semibold text-[#35352C]">{srv.name}</span>
                        <span className="text-[10px] text-[#8C8C70]">({srv.duration} mins)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#5A5A40]">₹{srv.price}</span>
                        {services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveService(idx)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="New service name"
                    className="flex-1 bg-white border border-[#E2E1D8] rounded-full px-3.5 py-1.5 text-xs text-[#35352C] focus:outline-none"
                  />
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    placeholder="Price ₹"
                    className="w-20 bg-white border border-[#E2E1D8] rounded-full px-3 py-1.5 text-xs text-[#35352C] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-3.5 py-1.5 rounded-full bg-[#5A5A40] text-white text-xs font-semibold hover:bg-[#474732]"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Staff List */}
              <div className="space-y-2 pt-2 border-t border-[#E2E1D8]">
                <label className="block text-xs font-semibold text-[#5A5A40]">
                  Initial Staff Members ({staffList.length})
                </label>
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {staffList.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-[#E2E1D8] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-[#D4A373]" />
                        <span className="font-semibold text-[#35352C]">{st.name}</span>
                        <span className="text-[10px] text-[#8C8C70]">({st.specialization})</span>
                      </div>
                      {staffList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStaff(idx)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="Staff member name"
                    className="flex-1 bg-white border border-[#E2E1D8] rounded-full px-3.5 py-1.5 text-xs text-[#35352C] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddStaff}
                    className="px-3.5 py-1.5 rounded-full bg-[#5A5A40] text-white text-xs font-semibold hover:bg-[#474732]"
                  >
                    Add Staff
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-[#E2E1D8] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-full bg-white border border-[#E2E1D8] text-[#4A4A40] text-xs font-semibold hover:bg-[#EDEDE9]"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !salonName.trim()) {
                    addToast('Salon Name Required', 'Please enter your salon name.', 'error');
                    return;
                  }
                  setStep(step + 1);
                }}
                className="px-6 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                id="btn-complete-onboarding"
                onClick={handleFinishOnboarding}
                className="px-7 py-3 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:scale-102 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D4A373]" />
                <span>Launch My Salon Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
