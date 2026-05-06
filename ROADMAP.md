# FeetFans Roadmap

## ✅ Completed (v1.0-beta)

### Epic 1-3: Core Features
- Authentication + Age verification
- Content upload + Feed + Discovery
- Real-time messaging + 15 AI agents

### Epic 4-5: Monetization
- Trial tracking (7 days)
- Feature gating (trial vs paid)
- Simplified upgrade ($9/month)
- Course integration (free access)
- Featured placement

### Epic 6: Infrastructure
- Moderation tables
- Content reporting
- Health monitoring
- Audit logging

---

## 🚧 Sprint 2 (Week 3-4): Stripe Integration

**Goal:** Production-ready payments

- [ ] Stripe account setup
- [ ] Webhook handler (/api/webhooks/stripe)
- [ ] Subscription creation with Payment Intent
- [ ] Auto-renewal logic
- [ ] Failed payment handling
- [ ] Cancel/reactivate flow
- [ ] Billing portal integration
- [ ] Invoice emails

**Deliverable:** Real payment processing

---

## 🎯 Sprint 3 (Week 5-6): Admin Dashboard

**Goal:** Self-service moderation

- [ ] Admin auth (role check)
- [ ] Moderation queue UI
- [ ] Content approve/reject actions
- [ ] User management (ban/unban)
- [ ] Reports dashboard
- [ ] Basic analytics (signups, revenue)
- [ ] Feature flags UI

**Deliverable:** Admin panel at /admin

---

## ⚡ Sprint 4 (Week 7-8): Performance

**Goal:** Scale to 1000+ users

- [ ] Image CDN (Cloudflare/Vercel)
- [ ] Image optimization (next/image)
- [ ] Database query optimization
- [ ] Redis caching (Upstash)
- [ ] Rate limiting (API routes)
- [ ] Lazy loading components
- [ ] Load testing (k6)

**Deliverable:** <2s page load

---

## 📱 Sprint 5 (Week 9-10): Mobile Polish

**Goal:** Native-like experience

- [ ] Push notifications (OneSignal/Firebase)
- [ ] Offline support (Service Worker)
- [ ] Camera integration (better upload)
- [ ] Haptic feedback
- [ ] Gesture improvements
- [ ] App icons + splash screens
- [ ] iOS/Android specific tweaks

**Deliverable:** 90+ Lighthouse score

---

## 🤖 Sprint 6 (Week 11-12): AI Enhancement

**Goal:** Smarter agents

- [ ] AI content moderation (Claude vision)
- [ ] Better personality prompts
- [ ] Conversation memory (vector DB)
- [ ] Agent analytics (response quality)
- [ ] Dynamic pricing suggestions
- [ ] Sentiment analysis

**Deliverable:** Higher engagement

---

## 🔮 Future (Q2-Q3)

### Phase 2: Expansion
- [ ] Video upload + streaming
- [ ] Live chat (WebRTC)
- [ ] Creator analytics dashboard
- [ ] Advanced search + filters
- [ ] Recommendation engine (ML)
- [ ] Referral program
- [ ] Gift subscriptions

### Phase 3: Scale
- [ ] Native iOS app (React Native)
- [ ] Native Android app
- [ ] Multi-language (i18n)
- [ ] Multiple currencies
- [ ] Regional content
- [ ] Creator verification badges

### Phase 4: Marketplace
- [ ] Custom content requests
- [ ] Tipping system
- [ ] Exclusive content tiers
- [ ] Creator collaborations
- [ ] Affiliate program

---

## 🐛 Known Issues (Backlog)

- [ ] Mobile keyboard pushes input (iOS Safari)
- [ ] Image upload progress bar
- [ ] Better error messages
- [ ] Retry failed uploads
- [ ] Profile edit page
- [ ] Email verification
- [ ] Password reset flow
- [ ] 2FA support

---

## 💡 Ideas (Parking Lot)

- Creator tiers (bronze/silver/gold)
- Subscription bundles
- Annual discount (2 months free)
- Creator marketplace (buy/sell accounts)
- White-label solution
- API for third-party integrations
