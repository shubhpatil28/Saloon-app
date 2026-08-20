# Security Specification: SalonOS Multi-Tenant Architecture

## 1. Data Invariants & Zero-Trust Tenants
1. **Strict Tenant Isolation**: Every subcollection and tenant-level entity belongs strictly under `/salons/{salonId}/`. No salon tenant can read, query, or mutate another salon's customers, bookings, revenue, or staff.
2. **Immutable Ledger Integrity**: Wallet transactions (`walletTransactions`) are strictly append-only or system-computed. Clients cannot directly tamper with balances or generate fake credits.
3. **Verified Roles & RBAC**:
   - `SUPER_ADMIN`: Access to platform metrics, subscriptions, and all salon metadata.
   - `OWNER` / `MANAGER`: Full management of their specific salon's services, staff, bookings, coupons, and invoices.
   - `STAFF`: Scoped access to assigned bookings, check-in, and service completions.
   - `CUSTOMER`: Access restricted to their own bookings, wallet balance, loyalty points, and review submissions.
4. **Temporal Integrity**: All creations and updates require valid timestamps (`request.time`).
5. **No Client Trust for Financials**: Discounts, loyalty point calculations, and service totals are verified against service catalog rules.

## 2. The "Dirty Dozen" Attack Vectors (Blocked by Rules)
1. **Cross-Tenant Snoop**: Attacker from Salon A attempts to read `/salons/salon-B/customers` -> `PERMISSION_DENIED`.
2. **Direct Wallet Balance Hack**: Customer attempts to directly modify their `walletBalance` field without payment -> `PERMISSION_DENIED`.
3. **Negative Price Injection**: Booking payload containing `totalAmount: -500` or invalid number -> `PERMISSION_DENIED`.
4. **Unauthorized Staff Promotion**: Staff member updates their own role to `OWNER` -> `PERMISSION_DENIED`.
5. **Unbounded ID Poisoning**: Attempting to insert a 2MB junk string into document path `{bookingId}` -> `PERMISSION_DENIED` via `isValidId()`.
6. **Ghost Review Spoofing**: Submitting a review for a booking that the user never booked or attended -> `PERMISSION_DENIED`.
7. **Coupon Abuse / Over-discount**: Client payload with `discount: 99999` on a ₹199 haircut -> `PERMISSION_DENIED`.
8. **Double-Claim Referral**: Generating fake referral credits to self-refer -> `PERMISSION_DENIED`.
9. **Tampering with Closed Invoices**: Modifying a completed, paid invoice record -> `PERMISSION_DENIED`.
10. **Shadow Field Injection**: Adding administrative flags like `isPlatformAdmin: true` into customer profile -> `PERMISSION_DENIED`.
11. **Timestamp Falsification**: Sending backdated timestamps for historical bookings -> `PERMISSION_DENIED`.
12. **Public Unauthenticated Scraping**: Unauthenticated user scraping customer phone numbers or private logs -> `PERMISSION_DENIED`.
