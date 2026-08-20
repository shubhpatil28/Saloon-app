export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF' | 'CUSTOMER';

export type SubscriptionPlan = 'STARTER' | 'BUSINESS' | 'PREMIUM';
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
export type PaymentMethod = 'WALLET' | 'UPI' | 'CASH' | 'CARD' | 'PAY_AT_SALON';

export type CustomerSegment =
  | 'NEW'
  | 'ACTIVE'
  | 'RETURNING'
  | 'INACTIVE'
  | 'VIP'
  | 'HIGH_VALUE'
  | 'AT_RISK';

export type WalletTransactionType =
  | 'CREDIT'
  | 'DEBIT'
  | 'REFUND'
  | 'BONUS'
  | 'EXPIRY'
  | 'ADJUSTMENT';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SERVICE';

export type ServiceCategory =
  | 'Hair'
  | 'Beard'
  | 'Skin'
  | 'Massage'
  | 'Spa'
  | 'Hair Color'
  | 'Packages'
  | 'Other';

export interface PlanFeatureLimits {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxStaff: number; // -1 for unlimited
  maxCustomers: number; // -1 for unlimited
  walletEnabled: boolean;
  rewardsEnabled: boolean;
  whatsappAutomation: boolean;
  smartReminders: boolean;
  advancedAnalytics: boolean;
  customBranding: boolean;
  multiBranch: boolean;
}

export interface Salon {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  logo: string;
  coverImage: string;
  category: string;
  rating: number;
  reviewsCount: number;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  trialStartDate: string;
  trialEndsAt: string;
  primaryColor: string;
  secondaryColor: string;
  openingHours: string;
  pointsPer100: number; // Loyalty: e.g. 10 points per ₹100
  referralRewardAmount: number; // e.g. ₹100
  birthdayRewardAmount: number; // e.g. ₹100
  razorpayKeyId?: string;
  whatsappConfigured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price: number;
  duration: number; // in minutes
  image: string;
  active: boolean;
  recommendedAddOn: boolean;
  featured: boolean;
  revisitCycleDays: number; // e.g. Haircut = 25, Beard = 15, Facial = 30
  createdAt: string;
  updatedAt?: string;
}

export interface Staff {
  id: string;
  salonId: string;
  name: string;
  phone: string;
  email: string;
  role: 'MANAGER' | 'STAFF';
  specialization: string;
  avatar: string;
  active: boolean;
  workingDays: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  workingHours: string; // e.g. '09:00 - 20:00'
  breakTime?: string;
  commissionPercentage: number;
  rating: number;
  completedBookings: number;
  revenueGenerated: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  salonId: string;
  name: string;
  phone: string;
  email: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  avatar?: string;
  referralCode: string;
  referredBy?: string;
  totalVisits: number;
  totalSpent: number;
  walletBalance: number;
  loyaltyPoints: number;
  lifetimePointsEarned: number;
  redeemedPoints: number;
  lastVisitDate?: string;
  nextReminderDate?: string;
  segment: CustomerSegment;
  notes?: string;
  preferredStaffId?: string;
  createdAt: string;
}

export interface BookingServiceItem {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
}

export interface Booking {
  id: string;
  bookingNumber: string; // e.g. SLN-20260810-00421
  salonId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  staffId: string;
  staffName: string;
  services: BookingServiceItem[];
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "10:30 AM"
  durationMinutes: number;
  subtotal: number;
  discountAmount: number;
  appliedCouponCode?: string;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  isReviewed?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-004812
  salonId: string;
  bookingId: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  staffName: string;
  items: {
    name: string;
    price: number;
    qty: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'REFUNDED';
  notes?: string;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  salonId: string;
  customerId: string;
  amount: number;
  type: WalletTransactionType;
  referenceId?: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface LoyaltyReward {
  id: string;
  salonId: string;
  title: string;
  description: string;
  pointsCost: number;
  discountType: DiscountType;
  discountValue: number;
  active: boolean;
}

export interface Offer {
  id: string;
  salonId: string;
  name: string;
  description: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minimumAmount: number;
  maximumDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  perCustomerLimit: number;
  active: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  salonId: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number; // 1-5
  comment: string;
  staffName?: string;
  serviceNames?: string;
  ownerReply?: string;
  ownerRepliedAt?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  salonId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  lastServiceName: string;
  lastVisitDate: string;
  reminderDueDate: string;
  status: 'SCHEDULED' | 'SENT' | 'BOOKED' | 'DISMISSED';
  channel: 'WHATSAPP' | 'SMS' | 'IN_APP' | 'PUSH';
  message: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  salonId?: string;
  customerId?: string;
  recipientRole: UserRole;
  title: string;
  message: string;
  type:
    | 'BOOKING_CONFIRMED'
    | 'BOOKING_REMINDER'
    | 'SERVICE_REMINDER'
    | 'PAYMENT_SUCCESS'
    | 'WALLET_CREDIT'
    | 'WALLET_DEBIT'
    | 'OFFER'
    | 'REFERRAL_REWARD'
    | 'BIRTHDAY'
    | 'REVIEW_REQUEST'
    | 'SYSTEM_ALERT';
  read: boolean;
  createdAt: string;
  linkAction?: string;
}

export interface ReferralRecord {
  id: string;
  salonId: string;
  referrerCustomerId: string;
  referrerName: string;
  referredCustomerId?: string;
  referredName?: string;
  referredPhone?: string;
  referralCode: string;
  status: 'INVITED' | 'REGISTERED' | 'FIRST_BOOKING' | 'QUALIFIED' | 'REWARDED';
  rewardAmount: number;
  createdAt: string;
  rewardedAt?: string;
}

export interface AuditLog {
  id: string;
  salonId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  timestamp: string;
}

export interface AppState {
  currentRole: UserRole;
  activeSalonId: string;
  activeCustomerId: string;
  activeStaffId?: string;
  viewMode: 'LANDING' | 'PUBLIC_SALON' | 'CUSTOMER_APP' | 'DASHBOARD' | 'SUPER_ADMIN';
  dashboardTab: string;
  customerAppTab: string;
  globalSearchQuery: string;
}
