import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Service, ServiceCategory } from '../../types';
import { formatINR } from '../../lib/utils';
import { BookingModal } from '../booking-flow/BookingModal';
import {
  Star,
  MapPin,
  Phone,
  Clock,
  MessageSquare,
  Sparkles,
  Scissors,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Award,
  Tag,
  ArrowRight,
} from 'lucide-react';

export const PublicSalonPage: React.FC = () => {
  const {
    activeSalon,
    services,
    staff,
    reviews,
    offers,
    setCurrentRole,
    setViewMode,
  } = useSalon();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | undefined>(undefined);

  const categories = ['All', 'Hair', 'Beard', 'Skin', 'Massage', 'Spa', 'Packages'];

  const filteredServices = (services || []).filter((s) => {
    if (!s.active) return false;
    if (activeCategory === 'All') return true;
    return s.category === activeCategory;
  });

  const handleBookService = (srv?: Service) => {
    setSelectedServiceForBooking(srv);
    setIsBookingOpen(true);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = activeSalon.whatsapp.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hi ${activeSalon.name}! I would like to enquire about booking an appointment.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#4A4A40] font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Hero Banner Section */}
      <section className="relative min-h-[520px] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        {/* Cover Background with warm natural overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeSalon.coverImage}
            alt={activeSalon.name}
            className="w-full h-full object-cover brightness-[0.4] scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F8F4] via-[#F9F8F4]/80 to-black/40" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Logo & Category Badge */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={activeSalon.logo}
              alt={activeSalon.name}
              className="w-20 h-20 rounded-full border-2 border-[#5A5A40] shadow-xl object-cover"
            />
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-[#E2E1D8] text-xs font-semibold text-[#5A5A40] backdrop-blur-md shadow-sm">
              <Star className="w-3.5 h-3.5 fill-[#D4A373] text-[#D4A373]" />
              <span>{activeSalon.rating} ({activeSalon.reviewsCount} verified reviews)</span>
              <span className="text-[#8C8C70]">•</span>
              <span>{activeSalon.city}</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif text-[#35352C] tracking-tight leading-tight">
            Look Good. <span className="italic text-[#5A5A40]">Feel Better.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#4A4A40] max-w-2xl mx-auto leading-relaxed font-medium">
            {activeSalon.tagline || 'Premium grooming experience designed for you.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              id="btn-public-book-now"
              onClick={() => handleBookService()}
              className="px-8 py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-all hover:scale-102"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <button
              id="btn-public-whatsapp"
              onClick={handleOpenWhatsApp}
              className="px-6 py-3.5 rounded-full bg-[#6B705C] hover:bg-[#585D4A] text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </button>

            <button
              id="btn-switch-to-customer-pwa"
              onClick={() => {
                setCurrentRole('CUSTOMER');
                setViewMode('CUSTOMER_APP');
              }}
              className="px-5 py-3.5 rounded-full bg-white hover:bg-[#F1F0E8] text-[#4A4A40] border border-[#E2E1D8] text-sm font-medium transition-all shadow-sm"
            >
              Customer App View
            </button>
          </div>

          {/* Address & Timings Pill */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#8C8C70] pt-4">
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-[#E2E1D8]">
              <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-[#4A4A40] font-medium">{activeSalon.address}, {activeSalon.city}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-[#E2E1D8]">
              <Clock className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-[#4A4A40] font-medium">{activeSalon.openingHours}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Banner */}
      {offers.length > 0 && (
        <section className="bg-[#D4A373] text-white py-3 px-4 text-xs font-semibold shadow-sm">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>
                SPECIAL OFFER: Use code <span className="underline font-bold">{offers[0].code}</span> for {offers[0].name} ({offers[0].description})
              </span>
            </div>
            <button
              onClick={() => handleBookService()}
              className="px-3.5 py-1 rounded-full bg-[#35352C] text-white text-[11px] font-bold hover:bg-black transition-colors shadow-sm"
            >
              Claim Now
            </button>
          </div>
        </section>
      )}

      {/* Service Catalog Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5A5A40]">Our Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#35352C] mt-1">Services & Packages</h2>
            <p className="text-xs text-[#8C8C70] mt-1">Crafted with world-class products and precision hygiene.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#5A5A40] text-white shadow-sm'
                    : 'bg-[#EDEDE9] text-[#8C8C70] hover:text-[#5A5A40] hover:bg-[#E4E4D9]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="p-6 rounded-[28px] bg-white border border-[#E2E1D8] hover:border-[#5A5A40] transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EDEDE9] text-[#5A5A40]">
                    {srv.category}
                  </span>
                  {srv.featured && (
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#D4A373]/20 text-[#D4A373] border border-[#D4A373]/30">
                      Popular
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-lg text-[#35352C] mt-3 group-hover:text-[#5A5A40] transition-colors">
                  {srv.name}
                </h3>
                <p className="text-xs text-[#8C8C70] mt-1.5 line-clamp-2 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EDECE4] flex items-center justify-between">
                <div>
                  <div className="text-xl font-serif font-bold text-[#35352C]">{formatINR(srv.price)}</div>
                  <div className="text-[11px] text-[#8C8C70] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {srv.duration} mins
                  </div>
                </div>

                <button
                  id={`btn-book-srv-${srv.id}`}
                  onClick={() => handleBookService(srv)}
                  className="px-4 py-2 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1"
                >
                  <span>Book</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stylist Team Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F1F0E8] border-y border-[#E2E1D8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5A5A40]">Masters of the Craft</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#35352C] mt-1">Meet Our Expert Stylists</h2>
            <p className="text-xs text-[#8C8C70] mt-1">Certified artists dedicated to perfection in every cut, shave, and spa treatment.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {staff.map((member) => (
              <div
                key={member.id}
                className="p-5 rounded-[28px] bg-white border border-[#E2E1D8] text-center space-y-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-[#E2E1D8]"
                />
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#35352C]">{member.name}</h4>
                  <p className="text-[11px] text-[#8C8C70] mt-0.5 line-clamp-1">{member.specialization}</p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#5A5A40] bg-[#EDEDE9] px-2.5 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-[#D4A373] text-[#D4A373]" />
                  <span>{member.rating}</span>
                  <span className="text-[#8C8C70] font-normal">({member.completedBookings}+ cuts)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Reviews Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5A5A40]">Real Feedback</span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#35352C] mt-1">Verified Customer Reviews</h2>
          <p className="text-xs text-[#8C8C70] mt-1">100% verified post-service ratings from happy salon patrons.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-[28px] bg-white border border-[#E2E1D8] flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-[#D4A373] text-[#D4A373]' : 'text-[#D6CCC2]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#8C8C70]">{rev.createdAt.split('T')[0]}</span>
                </div>

                <p className="text-xs text-[#4A4A40] mt-3.5 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2.5 pt-3 border-t border-[#EDECE4]">
                  <div className="w-8 h-8 rounded-full bg-[#EDEDE9] text-[#5A5A40] flex items-center justify-center font-serif font-bold text-xs">
                    {rev.customerName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-[#35352C]">{rev.customerName}</h5>
                    <p className="text-[10px] text-[#8C8C70]">Service: {rev.serviceNames || 'Haircut'}</p>
                  </div>
                </div>

                {rev.ownerReply && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-[#F9F8F4] border border-[#E2E1D8] text-[11px] text-[#4A4A40]">
                    <span className="font-semibold text-[#5A5A40]">Owner Reply: </span>
                    {rev.ownerReply}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Location & Booking CTA Footer */}
      <footer className="bg-[#F1F0E8] border-t border-[#E2E1D8] py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#8C8C70]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={activeSalon.logo} alt={activeSalon.name} className="w-8 h-8 rounded-full object-cover border border-[#E2E1D8]" />
              <span className="font-serif font-bold text-[#35352C] text-base">{activeSalon.name}</span>
            </div>
            <p className="text-[#8C8C70] leading-relaxed">{activeSalon.address}, {activeSalon.city}, {activeSalon.state} - {activeSalon.zipCode}</p>
            <div className="mt-3 text-[#5A5A40] font-semibold">Phone: {activeSalon.phone}</div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-[#35352C] text-sm mb-3">Operating Hours</h4>
            <p className="leading-relaxed">{activeSalon.openingHours}</p>
            <p className="mt-2 text-[#6B705C] font-semibold">● Open Today for Appointments</p>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h4 className="font-serif font-bold text-[#35352C] text-sm mb-2">Need a Quick Grooming Slot?</h4>
              <p className="text-[#8C8C70]">Reserve your stylist online with zero queue wait times.</p>
            </div>
            <button
              onClick={() => handleBookService()}
              className="mt-4 w-full py-3 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-bold text-xs shadow-md transition-all"
            >
              Book Now
            </button>
          </div>
        </div>
      </footer>

      {/* Direct Interactive Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        preselectedService={selectedServiceForBooking}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};
