import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Salon,
  Service,
  Staff,
  Customer,
  Booking,
  Invoice,
  WalletTransaction,
  LoyaltyReward,
  Offer,
  Review,
  Reminder,
  NotificationItem,
  AuditLog,
  UserRole,
  SubscriptionPlan,
  SubscriptionStatus,
  BookingStatus,
  PaymentMethod,
  CustomerSegment,
} from '../types';
import {
  auth,
  db,
  onAuthStateChanged,
  fbSignOut,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  FirebaseUser,
} from '../lib/firebase';
import {
  INITIAL_SALONS,
  INITIAL_SERVICES,
  INITIAL_STAFF,
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS,
  INITIAL_INVOICES,
  INITIAL_WALLET_TRANSACTIONS,
  INITIAL_LOYALTY_REWARDS,
  INITIAL_OFFERS,
  INITIAL_REVIEWS,
  INITIAL_REMINDERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';

interface SalonContextType {
  // Navigation & Role State
  viewMode: 'LANDING' | 'PUBLIC_SALON' | 'CUSTOMER_APP' | 'DASHBOARD' | 'SUPER_ADMIN';
  setViewMode: (mode: 'LANDING' | 'PUBLIC_SALON' | 'CUSTOMER_APP' | 'DASHBOARD' | 'SUPER_ADMIN') => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  dashboardTab: string;
  setDashboardTab: (tab: string) => void;
  customerAppTab: string;
  setCustomerAppTab: (tab: string) => void;
  publicSalonSlug: string;
  setPublicSalonSlug: (slug: string) => void;

  // Authentication State
  currentUser: FirebaseUser | null;
  authLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (roleHint?: 'OWNER' | 'CUSTOMER') => void;
  closeAuthModal: () => void;
  authRoleHint: 'OWNER' | 'CUSTOMER';
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  signOutUser: () => Promise<void>;

  // Demo Mode toggle
  isDemoMode: boolean;
  setIsDemoMode: (isDemo: boolean) => void;
  loadDemoSalon: () => void;

  // Active Tenant & Persona
  salons: Salon[];
  activeSalonId: string;
  setActiveSalonId: (id: string) => void;
  activeSalon: Salon;
  activeCustomerId: string;
  setActiveCustomerId: (id: string) => void;
  activeCustomer: Customer;
  activeStaffId: string;
  setActiveStaffId: (id: string) => void;
  activeStaff?: Staff;

  // Tenant-Isolated Data Collections & Aliases
  services: Service[];
  staff: Staff[];
  customers: Customer[];
  bookings: Booking[];
  invoices: Invoice[];
  walletTransactions: WalletTransaction[];
  walletLedger: WalletTransaction[];
  loyaltyRewards: LoyaltyReward[];
  offers: Offer[];
  reviews: Review[];
  reminders: Reminder[];
  revisitReminders: Reminder[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];

  // Global All Data (for Super Admin)
  allSalons: Salon[];
  allBookings: Booking[];
  allCustomers: Customer[];

  // Business Actions & Aliases
  createBooking: (bookingData: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt'>) => Booking;
  updateBookingStatus: (bookingId: string, newStatus: BookingStatus, notes?: string) => void;
  cancelBooking: (bookingId: string, reason?: string) => void;
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => Invoice;
  rechargeWallet: (customerId: string, amount: number, paymentRef: string) => void;
  adjustCustomerWallet: (customerId: string, amount: number, type: 'CREDIT' | 'DEBIT', reason: string) => void;
  redeemLoyaltyReward: (customerId: string, rewardId: string) => boolean;
  redeemLoyaltyPoints: (customerId: string, points: number, rewardDesc: string) => boolean;
  createCustomer: (customerData: Partial<Customer>) => Customer;
  updateCustomer: (customerId: string, data: Partial<Customer>) => void;
  createService: (serviceData: Omit<Service, 'id' | 'createdAt'>) => Service;
  addService: (serviceData: Omit<Service, 'id' | 'createdAt'>) => Service;
  updateService: (serviceId: string, data: Partial<Service>) => void;
  deleteService: (serviceId: string) => void;
  createStaff: (staffData: Omit<Staff, 'id' | 'createdAt'>) => Staff;
  addStaffMember: (staffData: Omit<Staff, 'id' | 'createdAt'>) => Staff;
  updateStaff: (staffId: string, data: Partial<Staff>) => void;
  deleteStaff: (staffId: string) => void;
  createOffer: (offerData: Omit<Offer, 'id' | 'createdAt'>) => Offer;
  toggleOffer: (offerId: string) => void;
  submitReview: (reviewData: Omit<Review, 'id' | 'createdAt'>) => Review;
  replyToReview: (reviewId: string, replyText: string) => void;
  sendReminder: (reminderId: string, channel?: 'WHATSAPP' | 'SMS') => void;
  triggerRevisitReminder: (reminderId: string, channel?: 'WHATSAPP' | 'SMS') => void;
  createSalon: (salonData: Partial<Salon>) => Salon;
  onboardSalon: (salonData: Partial<Salon>) => Salon;
  updateSalon: (salonId: string, data: Partial<Salon>) => void;
  updateSalonSettings: (data: Partial<Salon>) => void;
  updateSubscription: (salonId: string, plan: SubscriptionPlan, status: SubscriptionStatus) => void;
  markNotificationAsRead: (notifId: string) => void;
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  toast: { title: string; message: string; type: 'success' | 'error' | 'info'; id: string } | null;
  dismissToast: () => void;
  exportDataAsCsv: (type: 'customers' | 'bookings' | 'invoices' | 'revenue') => void;
  globalSearch: (query: string) => {
    customers: Customer[];
    bookings: Booking[];
    invoices: Invoice[];
  };
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

const STORAGE_PREFIX = 'salonos_prod_v2_';

const loadArray = <T,>(key: string, fallback: T[]): T[] => {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const SalonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRoleHint, setAuthRoleHint] = useState<'OWNER' | 'CUSTOMER'>('OWNER');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Demo mode flag (allows user to explicitly explore demo if requested)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_PREFIX + 'isDemoMode') === 'true';
  });

  // Salons list
  const [salons, setSalons] = useState<Salon[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'salons');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  });

  const [activeSalonId, setActiveSalonId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'activeSalonId');
    return saved || '';
  });

  const [viewMode, setViewMode] = useState<'LANDING' | 'PUBLIC_SALON' | 'CUSTOMER_APP' | 'DASHBOARD' | 'SUPER_ADMIN'>('LANDING');
  const [currentRole, setCurrentRole] = useState<UserRole>('OWNER');
  const [dashboardTab, setDashboardTab] = useState<string>('overview');
  const [customerAppTab, setCustomerAppTab] = useState<string>('home');
  const [publicSalonSlug, setPublicSalonSlug] = useState<string>('');

  const [activeCustomerId, setActiveCustomerId] = useState<string>('');
  const [activeStaffId, setActiveStaffId] = useState<string>('');

  // Clean Production Tenant Collections (Empty by default for new accounts)
  const [servicesMaster, setServicesMaster] = useState<Service[]>(() => loadArray('services', []));
  const [staffMaster, setStaffMaster] = useState<Staff[]>(() => loadArray('staff', []));
  const [customersMaster, setCustomersMaster] = useState<Customer[]>(() => loadArray('customers', []));
  const [bookingsMaster, setBookingsMaster] = useState<Booking[]>(() => loadArray('bookings', []));
  const [invoicesMaster, setInvoicesMaster] = useState<Invoice[]>(() => loadArray('invoices', []));
  const [walletTxMaster, setWalletTxMaster] = useState<WalletTransaction[]>(() => loadArray('walletTx', []));
  const [loyaltyRewardsMaster, setLoyaltyRewardsMaster] = useState<LoyaltyReward[]>(() => loadArray('loyaltyRewards', []));
  const [offersMaster, setOffersMaster] = useState<Offer[]>(() => loadArray('offers', []));
  const [reviewsMaster, setReviewsMaster] = useState<Review[]>(() => loadArray('reviews', []));
  const [remindersMaster, setRemindersMaster] = useState<Reminder[]>(() => loadArray('reminders', []));
  const [notificationsMaster, setNotificationsMaster] = useState<NotificationItem[]>(() => loadArray('notifications', []));
  const [auditLogsMaster, setAuditLogsMaster] = useState<AuditLog[]>(() => loadArray('auditLogs', []));

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info'; id: string } | null>(null);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToast({ title, message, type, id });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  };

  const dismissToast = () => setToast(null);

  const openAuthModal = (roleHint: 'OWNER' | 'CUSTOMER' = 'OWNER') => {
    setAuthRoleHint(roleHint);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Sync state to local storage cache
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'isDemoMode', String(isDemoMode));
    localStorage.setItem(STORAGE_PREFIX + 'salons', JSON.stringify(salons));
    localStorage.setItem(STORAGE_PREFIX + 'activeSalonId', activeSalonId);
    localStorage.setItem(STORAGE_PREFIX + 'services', JSON.stringify(servicesMaster));
    localStorage.setItem(STORAGE_PREFIX + 'staff', JSON.stringify(staffMaster));
    localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(customersMaster));
    localStorage.setItem(STORAGE_PREFIX + 'bookings', JSON.stringify(bookingsMaster));
    localStorage.setItem(STORAGE_PREFIX + 'invoices', JSON.stringify(invoicesMaster));
    localStorage.setItem(STORAGE_PREFIX + 'walletTx', JSON.stringify(walletTxMaster));
    localStorage.setItem(STORAGE_PREFIX + 'loyaltyRewards', JSON.stringify(loyaltyRewardsMaster));
    localStorage.setItem(STORAGE_PREFIX + 'offers', JSON.stringify(offersMaster));
    localStorage.setItem(STORAGE_PREFIX + 'reviews', JSON.stringify(reviewsMaster));
    localStorage.setItem(STORAGE_PREFIX + 'reminders', JSON.stringify(remindersMaster));
    localStorage.setItem(STORAGE_PREFIX + 'notifications', JSON.stringify(notificationsMaster));
    localStorage.setItem(STORAGE_PREFIX + 'auditLogs', JSON.stringify(auditLogsMaster));
  }, [
    isDemoMode,
    salons,
    activeSalonId,
    servicesMaster,
    staffMaster,
    customersMaster,
    bookingsMaster,
    invoicesMaster,
    walletTxMaster,
    loyaltyRewardsMaster,
    offersMaster,
    reviewsMaster,
    remindersMaster,
    notificationsMaster,
    auditLogsMaster,
  ]);

  // Firebase Auth State Listener & Auto-Load Salon Profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        // User logged in via phone
        const uid = user.uid;
        const phone = user.phoneNumber || '';

        try {
          // Check if this owner has an existing salon in Firestore by ownerId or email
          let snap = await getDocs(query(collection(db, 'salons'), where('ownerId', '==', uid)));

          if (snap.empty && user.email) {
            snap = await getDocs(query(collection(db, 'salons'), where('email', '==', user.email)));
          }

          if (!snap.empty) {
            // Existing Salon Owner found
            const loadedSalons: Salon[] = [];
            snap.forEach((docSnap) => {
              loadedSalons.push(docSnap.data() as Salon);
            });

            setSalons((prev) => {
              const merged = [...loadedSalons];
              prev.forEach((p) => {
                if (!merged.some((m) => m.id === p.id)) merged.push(p);
              });
              return merged;
            });

            const mySalon = loadedSalons[0];
            setActiveSalonId(mySalon.id);
            setPublicSalonSlug(mySalon.slug);
            setCurrentRole('OWNER');
            setViewMode('DASHBOARD');
            addToast('Welcome Back!', `Logged in as owner of ${mySalon.name}.`);
          } else {
            // Check if phone matches any salon phone or check customer record
            if (phone) {
              const qPhone = query(collection(db, 'salons'), where('phone', '==', phone));
              const snapPhone = await getDocs(qPhone);

              if (!snapPhone.empty) {
                const loadedSalons: Salon[] = [];
                snapPhone.forEach((docSnap) => loadedSalons.push(docSnap.data() as Salon));
                setSalons((prev) => [...loadedSalons, ...prev.filter((p) => !loadedSalons.some((l) => l.id === p.id))]);
                const mySalon = loadedSalons[0];
                setActiveSalonId(mySalon.id);
                setPublicSalonSlug(mySalon.slug);
                setCurrentRole('OWNER');
                setViewMode('DASHBOARD');
                return;
              }
            }

            if (authRoleHint === 'OWNER') {
              // Brand new owner: trigger first-time salon onboarding wizard
              setIsOnboardingOpen(true);
            } else {
              // Customer mode: setup or load customer profile
              const defaultSalonId = activeSalonId || (salons.length > 0 ? salons[0].id : 'salon-main');
              const custId = `cust-${uid}`;
              const custDocRef = doc(db, 'salons', defaultSalonId, 'customers', custId);
              const custSnap = await getDoc(custDocRef);

              if (custSnap.exists()) {
                const custData = custSnap.data() as Customer;
                setActiveCustomerId(custData.id);
              } else {
                const newCustomer: Customer = {
                  id: custId,
                  salonId: defaultSalonId,
                  name: user.displayName || `Customer ${phone.slice(-4) || 'VIP'}`,
                  phone: phone,
                  email: user.email || '',
                  referralCode: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
                  totalVisits: 0,
                  totalSpent: 0,
                  walletBalance: 0,
                  loyaltyPoints: 50, // Welcome signup points bonus
                  lifetimePointsEarned: 50,
                  redeemedPoints: 0,
                  segment: 'NEW',
                  createdAt: new Date().toISOString(),
                };
                setCustomersMaster((prev) => [newCustomer, ...prev]);
                setActiveCustomerId(newCustomer.id);
                try {
                  await setDoc(custDocRef, newCustomer);
                } catch (e) {
                  console.error('Customer firestore write error:', e);
                }
              }
              setCurrentRole('CUSTOMER');
              setViewMode('CUSTOMER_APP');
              addToast('Welcome! 📱', `Logged in to your customer wellness account.`);
            }
          }
        } catch (err) {
          console.error('Error querying Firestore for user:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [authRoleHint]);

  // Real-time Firestore Subscriptions for Active Salon Tenant Data
  useEffect(() => {
    if (!activeSalonId) return;

    // 1. Subscribe to Salon Document
    const salonDocRef = doc(db, 'salons', activeSalonId);
    const unsubSalon = onSnapshot(salonDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const salonData = docSnap.data() as Salon;
        setSalons((prev) => {
          const index = prev.findIndex((s) => s.id === salonData.id);
          if (index >= 0) {
            const copy = [...prev];
            copy[index] = salonData;
            return copy;
          }
          return [salonData, ...prev];
        });
      }
    }, (err) => console.log('Salon snapshot error (ignored if offline):', err.message));

    // 2. Subscribe to Services
    const servicesRef = collection(db, 'salons', activeSalonId, 'services');
    const unsubServices = onSnapshot(servicesRef, (snap) => {
      const list: Service[] = [];
      snap.forEach((d) => list.push(d.data() as Service));
      if (list.length > 0) {
        setServicesMaster((prev) => [
          ...list,
          ...prev.filter((p) => p.salonId !== activeSalonId),
        ]);
      }
    }, (err) => console.log('Services sub error:', err.message));

    // 3. Subscribe to Staff
    const staffRef = collection(db, 'salons', activeSalonId, 'staff');
    const unsubStaff = onSnapshot(staffRef, (snap) => {
      const list: Staff[] = [];
      snap.forEach((d) => list.push(d.data() as Staff));
      if (list.length > 0) {
        setStaffMaster((prev) => [
          ...list,
          ...prev.filter((p) => p.salonId !== activeSalonId),
        ]);
      }
    }, (err) => console.log('Staff sub error:', err.message));

    // 4. Subscribe to Customers
    const customersRef = collection(db, 'salons', activeSalonId, 'customers');
    const unsubCustomers = onSnapshot(customersRef, (snap) => {
      const list: Customer[] = [];
      snap.forEach((d) => list.push(d.data() as Customer));
      if (list.length > 0) {
        setCustomersMaster((prev) => [
          ...list,
          ...prev.filter((p) => p.salonId !== activeSalonId),
        ]);
      }
    }, (err) => console.log('Customers sub error:', err.message));

    // 5. Subscribe to Bookings
    const bookingsRef = collection(db, 'salons', activeSalonId, 'bookings');
    const unsubBookings = onSnapshot(bookingsRef, (snap) => {
      const list: Booking[] = [];
      snap.forEach((d) => list.push(d.data() as Booking));
      if (list.length > 0) {
        setBookingsMaster((prev) => [
          ...list,
          ...prev.filter((p) => p.salonId !== activeSalonId),
        ]);
      }
    }, (err) => console.log('Bookings sub error:', err.message));

    // 6. Subscribe to Invoices
    const invoicesRef = collection(db, 'salons', activeSalonId, 'invoices');
    const unsubInvoices = onSnapshot(invoicesRef, (snap) => {
      const list: Invoice[] = [];
      snap.forEach((d) => list.push(d.data() as Invoice));
      if (list.length > 0) {
        setInvoicesMaster((prev) => [
          ...list,
          ...prev.filter((p) => p.salonId !== activeSalonId),
        ]);
      }
    }, (err) => console.log('Invoices sub error:', err.message));

    // 7. Subscribe to Offers
    const offersRef = collection(db, 'salons', activeSalonId, 'offers');
    const unsubOffers = onSnapshot(offersRef, (snap) => {
      const list: Offer[] = [];
      snap.forEach((d) => list.push(d.data() as Offer));
      if (list.length > 0) {
        setOffersMaster((prev) => [
          ...list,
          ...prev.filter((p) => p.salonId !== activeSalonId),
        ]);
      }
    }, (err) => console.log('Offers sub error:', err.message));

    // 8. Subscribe to Reviews
    const reviewsRef = collection(db, 'salons', activeSalonId, 'reviews');
    const unsubReviews = onSnapshot(reviewsRef, (snap) => {
      const list: Review[] = [];
      snap.forEach((d) => list.push(d.data() as Review));
      if (list.length > 0) {
        setReviewsMaster((prev) => [
          ...list,
          ...prev.filter((p) => p.salonId !== activeSalonId),
        ]);
      }
    }, (err) => console.log('Reviews sub error:', err.message));

    // 9. Subscribe to Wallet Transactions
    const walletRef = collection(db, 'salons', activeSalonId, 'walletTransactions');
    const unsubWallet = onSnapshot(walletRef, (snap) => {
      const list: WalletTransaction[] = [];
      snap.forEach((d) => list.push(d.data() as WalletTransaction));
      if (list.length > 0) {
        setWalletTxMaster((prev) => [
          ...list,
          ...prev.filter((p) => p.salonId !== activeSalonId),
        ]);
      }
    }, (err) => console.log('Wallet sub error:', err.message));

    return () => {
      unsubSalon();
      unsubServices();
      unsubStaff();
      unsubCustomers();
      unsubBookings();
      unsubInvoices();
      unsubOffers();
      unsubReviews();
      unsubWallet();
    };
  }, [activeSalonId]);

  // Load Isolated Demo Mode Data (Explicitly isolated)
  const loadDemoSalon = () => {
    setIsDemoMode(true);
    setSalons(INITIAL_SALONS);
    setServicesMaster(INITIAL_SERVICES);
    setStaffMaster(INITIAL_STAFF);
    setCustomersMaster(INITIAL_CUSTOMERS);
    setBookingsMaster(INITIAL_BOOKINGS);
    setInvoicesMaster(INITIAL_INVOICES);
    setWalletTxMaster(INITIAL_WALLET_TRANSACTIONS);
    setLoyaltyRewardsMaster(INITIAL_LOYALTY_REWARDS);
    setOffersMaster(INITIAL_OFFERS);
    setReviewsMaster(INITIAL_REVIEWS);
    setRemindersMaster(INITIAL_REMINDERS);
    setNotificationsMaster(INITIAL_NOTIFICATIONS);
    setAuditLogsMaster(INITIAL_AUDIT_LOGS);
    setActiveSalonId('salon-royal-grooming');
    setPublicSalonSlug('royal-grooming-studio');
    setActiveCustomerId('cust-shubham');
    setActiveStaffId('staff-vikram');
    addToast('Demo Mode Activated', 'Loaded sample data for interactive product preview.');
  };

  const signOutUser = async () => {
    try {
      await fbSignOut(auth);
      setCurrentUser(null);
      setViewMode('LANDING');
      addToast('Signed Out', 'You have been safely signed out.');
    } catch (err: any) {
      console.error('Signout error:', err);
    }
  };

  // Fallback default salon object for clean initial render
  const defaultEmptySalon: Salon = {
    id: activeSalonId || 'salon-default',
    name: 'My Salon',
    slug: 'my-salon',
    tagline: 'Luxury Hair & Wellness Studio',
    ownerId: currentUser?.uid || '',
    ownerName: 'Owner',
    ownerEmail: '',
    phone: currentUser?.phoneNumber || '+91 98765 00000',
    whatsapp: currentUser?.phoneNumber || '+91 98765 00000',
    address: 'Main Boulevard',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80',
    category: 'Unisex Luxury Salon',
    rating: 5.0,
    reviewsCount: 0,
    subscriptionPlan: 'BUSINESS',
    subscriptionStatus: 'TRIAL',
    trialStartDate: new Date().toISOString(),
    trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    primaryColor: '#5A5A40',
    secondaryColor: '#D4A373',
    openingHours: '09:00 AM - 09:00 PM',
    pointsPer100: 10,
    referralRewardAmount: 100,
    birthdayRewardAmount: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Derived Active Salon
  const activeSalon = useMemo(() => {
    return salons.find((s) => s.id === activeSalonId) || salons[0] || defaultEmptySalon;
  }, [salons, activeSalonId]);

  // Derived Active Customer
  const defaultEmptyCustomer: Customer = {
    id: activeCustomerId || (currentUser ? `cust-${currentUser.uid}` : 'cust-guest'),
    salonId: activeSalon.id,
    name: currentUser?.displayName || (currentUser?.phoneNumber ? `Client ${currentUser.phoneNumber.slice(-4)}` : 'Client Guest'),
    phone: currentUser?.phoneNumber || '+91 98765 00000',
    email: currentUser?.email || '',
    referralCode: 'REF-JOIN',
    totalVisits: 0,
    totalSpent: 0,
    walletBalance: 0,
    loyaltyPoints: 0,
    lifetimePointsEarned: 0,
    redeemedPoints: 0,
    segment: 'NEW',
    createdAt: new Date().toISOString(),
  };

  const activeCustomer = useMemo(() => {
    return customersMaster.find((c) => c.id === activeCustomerId) || customersMaster[0] || defaultEmptyCustomer;
  }, [customersMaster, activeCustomerId, currentUser, activeSalon.id]);

  // Derived Active Staff
  const activeStaff = useMemo(() => {
    return staffMaster.find((s) => s.id === activeStaffId);
  }, [staffMaster, activeStaffId]);

  // Tenant-Scoped Data (Pure Isolation by activeSalon.id)
  const services = useMemo(
    () => (servicesMaster || []).filter((s) => s.salonId === activeSalon.id),
    [servicesMaster, activeSalon.id]
  );
  const staff = useMemo(
    () => (staffMaster || []).filter((s) => s.salonId === activeSalon.id),
    [staffMaster, activeSalon.id]
  );
  const customers = useMemo(
    () => (customersMaster || []).filter((c) => c.salonId === activeSalon.id),
    [customersMaster, activeSalon.id]
  );
  const bookings = useMemo(
    () => (bookingsMaster || []).filter((b) => b.salonId === activeSalon.id),
    [bookingsMaster, activeSalon.id]
  );
  const invoices = useMemo(
    () => (invoicesMaster || []).filter((i) => i.salonId === activeSalon.id),
    [invoicesMaster, activeSalon.id]
  );
  const walletTransactions = useMemo(
    () => (walletTxMaster || []).filter((w) => w.salonId === activeSalon.id),
    [walletTxMaster, activeSalon.id]
  );
  const loyaltyRewards = useMemo(
    () => (loyaltyRewardsMaster || []).filter((r) => r.salonId === activeSalon.id),
    [loyaltyRewardsMaster, activeSalon.id]
  );
  const offers = useMemo(
    () => (offersMaster || []).filter((o) => o.salonId === activeSalon.id),
    [offersMaster, activeSalon.id]
  );
  const reviews = useMemo(
    () => (reviewsMaster || []).filter((r) => r.salonId === activeSalon.id),
    [reviewsMaster, activeSalon.id]
  );
  const reminders = useMemo(
    () => (remindersMaster || []).filter((rem) => rem.salonId === activeSalon.id),
    [remindersMaster, activeSalon.id]
  );

  const notifications = useMemo(() => {
    return (notificationsMaster || []).filter(
      (n) => !n.salonId || n.salonId === activeSalon.id
    );
  }, [notificationsMaster, activeSalon.id]);

  const auditLogs = useMemo(
    () => (auditLogsMaster || []).filter((a) => a.salonId === activeSalon.id),
    [auditLogsMaster, activeSalon.id]
  );

  // Global search scoped to current salon
  const globalSearch = (queryStr: string) => {
    const q = queryStr.toLowerCase().trim();
    if (!q) return { customers: [], bookings: [], invoices: [] };

    const matchedCustomers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
    );

    const matchedBookings = bookings.filter(
      (b) =>
        b.bookingNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q)
    );

    const matchedInvoices = invoices.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q)
    );

    return {
      customers: matchedCustomers,
      bookings: matchedBookings,
      invoices: matchedInvoices,
    };
  };

  // Business Action: Create Booking
  const createBooking = (
    bookingData: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt'>
  ): Booking => {
    const timestamp = Date.now();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const newId = `bkg-${timestamp}`;
    const bookingNumber = `SLN-${dateStr}-${randDigits}`;

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      bookingNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBookingsMaster((prev) => [newBooking, ...prev]);

    // Persist to Firestore
    setDoc(doc(db, 'salons', newBooking.salonId, 'bookings', newBooking.id), newBooking).catch((e) =>
      console.error('Booking firestore write error:', e)
    );

    // Auto-create customer if does not exist
    const existingCust = customersMaster.find(
      (c) =>
        c.salonId === newBooking.salonId &&
        (c.phone === newBooking.customerPhone || c.id === newBooking.customerId)
    );

    if (!existingCust) {
      const newCust: Customer = {
        id: newBooking.customerId || `cust-${Date.now()}`,
        salonId: newBooking.salonId,
        name: newBooking.customerName,
        phone: newBooking.customerPhone,
        email: newBooking.customerEmail || '',
        referralCode: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        totalVisits: 1,
        totalSpent: newBooking.totalAmount,
        walletBalance: 0,
        loyaltyPoints: Math.floor(newBooking.totalAmount / 10),
        lifetimePointsEarned: Math.floor(newBooking.totalAmount / 10),
        redeemedPoints: 0,
        lastVisitDate: newBooking.appointmentDate,
        segment: 'NEW',
        createdAt: new Date().toISOString(),
      };
      setCustomersMaster((prev) => [newCust, ...prev]);
      setDoc(doc(db, 'salons', newCust.salonId, 'customers', newCust.id), newCust).catch((e) =>
        console.error('Customer firestore write error:', e)
      );
    } else {
      setCustomersMaster((prev) =>
        prev.map((c) => {
          if (c.id === existingCust.id) {
            const visits = c.totalVisits + 1;
            const pointsEarned = Math.floor(newBooking.totalAmount / 10);
            return {
              ...c,
              totalVisits: visits,
              totalSpent: c.totalSpent + newBooking.totalAmount,
              loyaltyPoints: c.loyaltyPoints + pointsEarned,
              lifetimePointsEarned: c.lifetimePointsEarned + pointsEarned,
              lastVisitDate: newBooking.appointmentDate,
              segment: (visits > 4 ? 'VIP' : visits > 1 ? 'RETURNING' : 'ACTIVE') as CustomerSegment,
            };
          }
          return c;
        })
      );
    }

    addToast(
      'Appointment Confirmed! 📅',
      `Booking ${bookingNumber} created for ${newBooking.customerName}.`
    );

    return newBooking;
  };

  // Business Action: Update Booking Status
  const updateBookingStatus = (
    bookingId: string,
    newStatus: BookingStatus,
    notes?: string
  ) => {
    setBookingsMaster((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const updated = {
            ...b,
            status: newStatus,
            notes: notes !== undefined ? notes : b.notes,
            updatedAt: new Date().toISOString(),
          };
          setDoc(doc(db, 'salons', b.salonId, 'bookings', b.id), updated, { merge: true }).catch((e) =>
            console.error('Booking status update error:', e)
          );
          return updated;
        }
        return b;
      })
    );

    addToast('Booking Updated', `Status changed to ${newStatus}.`);
  };

  // Business Action: Cancel Booking
  const cancelBooking = (bookingId: string, reason?: string) => {
    updateBookingStatus(bookingId, 'CANCELLED', reason ? `Cancelled: ${reason}` : undefined);
    addToast('Booking Cancelled', 'Appointment was cancelled.', 'info');
  };

  // Business Action: Create POS Invoice
  const createInvoice = (
    invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>
  ): Invoice => {
    const timestamp = Date.now();
    const newId = `inv-${timestamp}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: newId,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    setInvoicesMaster((prev) => [newInvoice, ...prev]);
    setDoc(doc(db, 'salons', newInvoice.salonId, 'invoices', newInvoice.id), newInvoice).catch((e) =>
      console.error('Invoice write error:', e)
    );

    addToast('Invoice Generated 🧾', `${invoiceNumber} for ₹${newInvoice.total} recorded.`);
    return newInvoice;
  };

  // Business Action: Recharge Customer Wallet
  const rechargeWallet = (customerId: string, amount: number, paymentRef: string) => {
    if (amount <= 0) return;

    setCustomersMaster((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newBal = c.walletBalance + amount;
          const newTx: WalletTransaction = {
            id: `wtx-${Date.now()}`,
            salonId: activeSalon.id,
            customerId: c.id,
            amount,
            type: 'CREDIT',
            referenceId: paymentRef || `TOPUP-${Date.now().toString().slice(-4)}`,
            description: `Prepaid Salon Wallet Recharge`,
            balanceAfter: newBal,
            createdAt: new Date().toISOString(),
          };

          setWalletTxMaster((txPrev) => [newTx, ...txPrev]);
          setDoc(doc(db, 'salons', activeSalon.id, 'walletTransactions', newTx.id), newTx).catch((e) =>
            console.error('Wallet tx error:', e)
          );

          const updatedCust = { ...c, walletBalance: newBal };
          setDoc(doc(db, 'salons', activeSalon.id, 'customers', c.id), updatedCust, { merge: true }).catch((e) =>
            console.error('Cust wallet error:', e)
          );

          return updatedCust;
        }
        return c;
      })
    );

    addToast('Wallet Recharged 💰', `₹${amount} added to salon wallet.`);
  };

  // Business Action: Adjust Customer Wallet
  const adjustCustomerWallet = (
    customerId: string,
    amount: number,
    type: 'CREDIT' | 'DEBIT',
    reason: string
  ) => {
    if (amount <= 0) return;
    setCustomersMaster((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newBalance = type === 'CREDIT' ? c.walletBalance + amount : Math.max(0, c.walletBalance - amount);
          const wTx: WalletTransaction = {
            id: `wtx-${Date.now()}`,
            salonId: activeSalon.id,
            customerId: c.id,
            amount,
            type,
            referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
            description: reason || `Manual Wallet ${type === 'CREDIT' ? 'Credit' : 'Debit'}`,
            balanceAfter: newBalance,
            createdAt: new Date().toISOString(),
          };
          setWalletTxMaster((txPrev) => [wTx, ...txPrev]);
          setDoc(doc(db, 'salons', activeSalon.id, 'walletTransactions', wTx.id), wTx).catch((e) =>
            console.error('Wallet adjustment error:', e)
          );

          const updatedCust = { ...c, walletBalance: newBalance };
          setDoc(doc(db, 'salons', activeSalon.id, 'customers', c.id), updatedCust, { merge: true }).catch((e) =>
            console.error('Cust update error:', e)
          );

          return updatedCust;
        }
        return c;
      })
    );
    addToast('Wallet Adjusted', `₹${amount} ${type === 'CREDIT' ? 'credited to' : 'debited from'} client wallet.`);
  };

  // Business Action: Redeem Loyalty Reward
  const redeemLoyaltyReward = (customerId: string, rewardId: string): boolean => {
    const reward = loyaltyRewardsMaster.find((r) => r.id === rewardId);
    const customer = customersMaster.find((c) => c.id === customerId);

    if (!reward || !customer) return false;
    if (customer.loyaltyPoints < reward.pointsCost) {
      addToast(
        'Insufficient Points',
        `You need ${reward.pointsCost} points, but have ${customer.loyaltyPoints}`,
        'error'
      );
      return false;
    }

    setCustomersMaster((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            loyaltyPoints: c.loyaltyPoints - reward.pointsCost,
            redeemedPoints: c.redeemedPoints + reward.pointsCost,
          };
        }
        return c;
      })
    );

    addToast('Reward Unlocked! 🎁', `Redeemed ${reward.title} for ${reward.pointsCost} points.`);
    return true;
  };

  const redeemLoyaltyPoints = (customerId: string, points: number, rewardDesc: string): boolean => {
    const customer = customersMaster.find((c) => c.id === customerId);
    if (!customer || customer.loyaltyPoints < points) {
      addToast('Insufficient Points', `You need ${points} points, but have ${customer?.loyaltyPoints || 0}`, 'error');
      return false;
    }

    setCustomersMaster((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updated = {
            ...c,
            loyaltyPoints: c.loyaltyPoints - points,
            redeemedPoints: (c.redeemedPoints || 0) + points,
          };
          setDoc(doc(db, 'salons', activeSalon.id, 'customers', c.id), updated, { merge: true }).catch((e) =>
            console.error('Cust points update error:', e)
          );
          return updated;
        }
        return c;
      })
    );

    addToast('Points Redeemed! 🎁', `Redeemed ${points} points for ${rewardDesc}.`);
    return true;
  };

  // Customer Management
  const createCustomer = (customerData: Partial<Customer>): Customer => {
    const newId = `cust-${Date.now()}`;
    const newCust: Customer = {
      id: newId,
      salonId: customerData.salonId || activeSalon.id,
      name: customerData.name || 'New Client',
      phone: customerData.phone || '+91 98000 00000',
      email: customerData.email || '',
      referralCode: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      totalVisits: 0,
      totalSpent: 0,
      walletBalance: customerData.walletBalance || 0,
      loyaltyPoints: 0,
      lifetimePointsEarned: 0,
      redeemedPoints: 0,
      segment: 'NEW',
      createdAt: new Date().toISOString(),
      ...customerData,
    };

    setCustomersMaster((prev) => [newCust, ...prev]);
    setDoc(doc(db, 'salons', newCust.salonId, 'customers', newCust.id), newCust).catch((e) =>
      console.error('Create cust firestore error:', e)
    );

    addToast('Client Added', `${newCust.name} added to salon CRM.`);
    return newCust;
  };

  const updateCustomer = (customerId: string, data: Partial<Customer>) => {
    setCustomersMaster((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updated = { ...c, ...data };
          setDoc(doc(db, 'salons', c.salonId, 'customers', c.id), updated, { merge: true }).catch((e) =>
            console.error('Update cust firestore error:', e)
          );
          return updated;
        }
        return c;
      })
    );
    addToast('Client Profile Updated', 'Changes saved successfully.');
  };

  // Service Management
  const createService = (serviceData: Omit<Service, 'id' | 'createdAt'>): Service => {
    const newId = `srv-${Date.now()}`;
    const newSrv: Service = {
      ...serviceData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setServicesMaster((prev) => [newSrv, ...prev]);
    setDoc(doc(db, 'salons', newSrv.salonId, 'services', newSrv.id), newSrv).catch((e) =>
      console.error('Service firestore write error:', e)
    );

    addToast('Service Created ✂️', `${newSrv.name} added to catalog.`);
    return newSrv;
  };

  const updateService = (serviceId: string, data: Partial<Service>) => {
    setServicesMaster((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const updated = { ...s, ...data, updatedAt: new Date().toISOString() };
          setDoc(doc(db, 'salons', s.salonId, 'services', s.id), updated, { merge: true }).catch((e) =>
            console.error('Service update error:', e)
          );
          return updated;
        }
        return s;
      })
    );
    addToast('Service Updated', 'Changes saved.');
  };

  const deleteService = (serviceId: string) => {
    const srv = servicesMaster.find((s) => s.id === serviceId);
    if (srv) {
      deleteDoc(doc(db, 'salons', srv.salonId, 'services', serviceId)).catch((e) =>
        console.error('Service delete error:', e)
      );
    }
    setServicesMaster((prev) => prev.filter((s) => s.id !== serviceId));
    addToast('Service Deleted', 'Removed from service catalog.', 'info');
  };

  // Staff Management
  const createStaff = (staffData: Omit<Staff, 'id' | 'createdAt'>): Staff => {
    const newId = `staff-${Date.now()}`;
    const newStaffMember: Staff = {
      ...staffData,
      id: newId,
      completedBookings: 0,
      revenueGenerated: 0,
      rating: 5.0,
      createdAt: new Date().toISOString(),
    };

    setStaffMaster((prev) => [newStaffMember, ...prev]);
    setDoc(doc(db, 'salons', newStaffMember.salonId, 'staff', newStaffMember.id), newStaffMember).catch((e) =>
      console.error('Staff write error:', e)
    );

    addToast('Staff Member Added 👤', `${newStaffMember.name} joined the team roster.`);
    return newStaffMember;
  };

  const updateStaff = (staffId: string, data: Partial<Staff>) => {
    setStaffMaster((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const updated = { ...s, ...data };
          setDoc(doc(db, 'salons', s.salonId, 'staff', s.id), updated, { merge: true }).catch((e) =>
            console.error('Staff update error:', e)
          );
          return updated;
        }
        return s;
      })
    );
    addToast('Staff Profile Updated', 'Changes saved.');
  };

  const deleteStaff = (staffId: string) => {
    const st = staffMaster.find((s) => s.id === staffId);
    if (st) {
      deleteDoc(doc(db, 'salons', st.salonId, 'staff', staffId)).catch((e) =>
        console.error('Staff delete error:', e)
      );
    }
    setStaffMaster((prev) => prev.filter((s) => s.id !== staffId));
    addToast('Staff Removed', 'Staff record deleted.', 'info');
  };

  // Offers Management
  const createOffer = (offerData: Omit<Offer, 'id' | 'createdAt'>): Offer => {
    const newId = `off-${Date.now()}`;
    const newOff: Offer = {
      ...offerData,
      id: newId,
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };

    setOffersMaster((prev) => [newOff, ...prev]);
    setDoc(doc(db, 'salons', newOff.salonId, 'offers', newOff.id), newOff).catch((e) =>
      console.error('Offer write error:', e)
    );

    addToast('Promo Coupon Created 🏷️', `Coupon code "${newOff.code}" is active.`);
    return newOff;
  };

  const toggleOffer = (offerId: string) => {
    setOffersMaster((prev) =>
      prev.map((o) => {
        if (o.id === offerId) {
          const updated = { ...o, active: !o.active };
          setDoc(doc(db, 'salons', o.salonId, 'offers', o.id), updated, { merge: true }).catch((e) =>
            console.error('Offer update error:', e)
          );
          return updated;
        }
        return o;
      })
    );
  };

  // Reviews Management
  const submitReview = (reviewData: Omit<Review, 'id' | 'createdAt'>): Review => {
    const newId = `rev-${Date.now()}`;
    const newReview: Review = {
      ...reviewData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setReviewsMaster((prev) => [newReview, ...prev]);
    setDoc(doc(db, 'salons', newReview.salonId, 'reviews', newReview.id), newReview).catch((e) =>
      console.error('Review write error:', e)
    );

    // Update salon rating score
    const salonReviews = [...reviewsMaster.filter((r) => r.salonId === reviewData.salonId), newReview];
    const avg = salonReviews.reduce((sum, r) => sum + r.rating, 0) / salonReviews.length;
    updateSalon(reviewData.salonId, {
      rating: Number(avg.toFixed(1)),
      reviewsCount: salonReviews.length,
    });

    addToast('Feedback Submitted ⭐', 'Thank you for your review!');
    return newReview;
  };

  const replyToReview = (reviewId: string, replyText: string) => {
    setReviewsMaster((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const updated = {
            ...r,
            ownerReply: replyText,
            ownerRepliedAt: new Date().toISOString(),
          };
          setDoc(doc(db, 'salons', r.salonId, 'reviews', r.id), updated, { merge: true }).catch((e) =>
            console.error('Review reply write error:', e)
          );
          return updated;
        }
        return r;
      })
    );
    addToast('Reply Posted', 'Your reply is now live.');
  };

  // Reminders Management
  const sendReminder = (reminderId: string, channel: 'WHATSAPP' | 'SMS' = 'WHATSAPP') => {
    setRemindersMaster((prev) =>
      prev.map((rem) => {
        if (rem.id === reminderId) {
          const updated = {
            ...rem,
            status: 'SENT' as const,
            channel,
          };
          setDoc(doc(db, 'salons', rem.salonId, 'reminders', rem.id), updated, { merge: true }).catch((e) =>
            console.error('Reminder write error:', e)
          );
          return updated;
        }
        return rem;
      })
    );

    addToast('Smart Reminder Dispatched 📲', `Revisit invitation sent via ${channel}.`);
  };

  // Salon Tenant Creation & Onboarding
  const createSalon = (salonData: Partial<Salon>): Salon => {
    const timestamp = Date.now();
    const newId = salonData.id || `salon-${timestamp}`;
    const newSalon: Salon = {
      id: newId,
      name: salonData.name || 'New Salon',
      slug:
        salonData.slug ||
        (salonData.name || 'salon')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      tagline: salonData.tagline || 'Excellence in Hair & Beauty',
      ownerId: salonData.ownerId || currentUser?.uid || 'owner-uid',
      ownerName: salonData.ownerName || 'Salon Owner',
      ownerEmail: salonData.ownerEmail || 'owner@salonos.in',
      phone: salonData.phone || '+91 98765 00000',
      whatsapp: salonData.whatsapp || '+91 98765 00000',
      address: salonData.address || 'High Street 42',
      city: salonData.city || 'Mumbai',
      state: salonData.state || 'Maharashtra',
      zipCode: salonData.zipCode || '400001',
      logo: salonData.logo || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80',
      coverImage: salonData.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80',
      category: salonData.category || 'Luxury Unisex Salon',
      rating: 5.0,
      reviewsCount: 0,
      subscriptionPlan: salonData.subscriptionPlan || 'BUSINESS',
      subscriptionStatus: 'TRIAL',
      trialStartDate: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      primaryColor: '#5A5A40',
      secondaryColor: '#D4A373',
      openingHours: salonData.openingHours || '09:00 AM - 09:00 PM',
      pointsPer100: 10,
      referralRewardAmount: 100,
      birthdayRewardAmount: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...salonData,
    };

    setSalons((prev) => [newSalon, ...prev.filter((s) => s.id !== newSalon.id)]);
    setActiveSalonId(newSalon.id);
    setPublicSalonSlug(newSalon.slug);
    setCurrentRole('OWNER');
    setViewMode('DASHBOARD');

    // Persist to Firestore
    setDoc(doc(db, 'salons', newSalon.id), newSalon).catch((e) =>
      console.error('Salon creation firestore error:', e)
    );

    addToast('Tenant Initialized 🏢', `${newSalon.name} is ready.`);
    return newSalon;
  };

  const updateSalon = (salonId: string, data: Partial<Salon>) => {
    setSalons((prev) =>
      prev.map((s) => {
        if (s.id === salonId) {
          const updated = { ...s, ...data, updatedAt: new Date().toISOString() };
          setDoc(doc(db, 'salons', s.id), updated, { merge: true }).catch((e) =>
            console.error('Salon update firestore error:', e)
          );
          return updated;
        }
        return s;
      })
    );
    addToast('Settings Saved ⚙️', 'Salon branding and preferences updated.');
  };

  const updateSubscription = (
    salonId: string,
    plan: SubscriptionPlan,
    status: SubscriptionStatus
  ) => {
    updateSalon(salonId, {
      subscriptionPlan: plan,
      subscriptionStatus: status,
    });
    addToast('Subscription Plan Updated', `Plan changed to ${plan} (${status}).`);
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotificationsMaster((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const exportDataAsCsv = (type: 'customers' | 'bookings' | 'invoices' | 'revenue') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `${activeSalon.name}-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === 'customers') {
      headers = ['Name', 'Phone', 'Email', 'Visits', 'Spent', 'Wallet', 'Points', 'Segment'];
      rows = customers.map((c) => [
        `"${c.name}"`,
        `"${c.phone}"`,
        `"${c.email}"`,
        c.totalVisits.toString(),
        c.totalSpent.toString(),
        c.walletBalance.toString(),
        c.loyaltyPoints.toString(),
        c.segment,
      ]);
    } else if (type === 'bookings') {
      headers = ['Booking Number', 'Date', 'Time', 'Customer', 'Phone', 'Staff', 'Amount', 'Status'];
      rows = bookings.map((b) => [
        b.bookingNumber,
        b.appointmentDate,
        b.appointmentTime,
        `"${b.customerName}"`,
        `"${b.customerPhone}"`,
        `"${b.staffName}"`,
        b.totalAmount.toString(),
        b.status,
      ]);
    } else if (type === 'invoices') {
      headers = ['Invoice Number', 'Date', 'Customer', 'Phone', 'Subtotal', 'Tax', 'Total', 'Payment Method'];
      rows = invoices.map((inv) => [
        inv.invoiceNumber,
        inv.createdAt.slice(0, 10),
        `"${inv.customerName}"`,
        `"${inv.customerPhone}"`,
        inv.subtotal.toString(),
        inv.tax.toString(),
        inv.total.toString(),
        inv.paymentMethod,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('CSV Exported 📥', `Downloaded ${type} export successfully.`);
  };

  return (
    <SalonContext.Provider
      value={{
        viewMode,
        setViewMode,
        currentRole,
        setCurrentRole,
        dashboardTab,
        setDashboardTab,
        customerAppTab,
        setCustomerAppTab,
        publicSalonSlug,
        setPublicSalonSlug,

        // Auth
        currentUser,
        authLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authRoleHint,
        isOnboardingOpen,
        setIsOnboardingOpen,
        signOutUser,

        // Demo
        isDemoMode,
        setIsDemoMode,
        loadDemoSalon,

        // Persona & Tenant
        salons,
        activeSalonId,
        setActiveSalonId,
        activeSalon,
        activeCustomerId,
        setActiveCustomerId,
        activeCustomer,
        activeStaffId,
        setActiveStaffId,
        activeStaff,

        // Collections
        services,
        staff,
        customers,
        bookings,
        invoices,
        walletTransactions,
        walletLedger: walletTransactions,
        loyaltyRewards,
        offers,
        reviews,
        reminders,
        revisitReminders: reminders,
        notifications,
        auditLogs,
        allSalons: salons,
        allBookings: bookingsMaster,
        allCustomers: customersMaster,

        // Business Actions
        createBooking,
        updateBookingStatus,
        cancelBooking,
        createInvoice,
        rechargeWallet,
        adjustCustomerWallet,
        redeemLoyaltyReward,
        redeemLoyaltyPoints,
        createCustomer,
        updateCustomer,
        createService,
        addService: createService,
        updateService,
        deleteService,
        createStaff,
        addStaffMember: createStaff,
        updateStaff,
        deleteStaff,
        createOffer,
        toggleOffer,
        submitReview,
        replyToReview,
        sendReminder,
        triggerRevisitReminder: sendReminder,
        createSalon,
        onboardSalon: createSalon,
        updateSalon,
        updateSalonSettings: (data: Partial<Salon>) => updateSalon(activeSalon.id, data),
        updateSubscription,
        markNotificationAsRead,
        addToast,
        toast,
        dismissToast,
        exportDataAsCsv,
        globalSearch,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};
