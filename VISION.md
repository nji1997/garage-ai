# Garage AI — Product Vision

## Mission
Garage AI is the permanent memory and intelligence layer for vehicle ownership. It transforms scattered receipts, invoices, and emails into a living vehicle record — then uses that record to predict problems, protect value, and eliminate expensive surprises.

---

## The Four Pillars

### 1. Vehicle Record System — System of Record
The foundation of everything. Every other pillar depends on the quality of data here.

**Core capabilities**
- Upload PDFs, photos, emails, invoices (drag and drop)
- OCR and structured data extraction via AI
- Manual entry with smart defaults
- VIN decode → auto-populate year/make/model/trim/engine
- Mileage tracking over time
- Ownership history
- Full chronological timeline of everything that happened to the vehicle

**Extraction targets from any document**
- Date of service
- Mileage at service
- Service(s) performed
- Cost (parts + labor + total)
- Shop name and location
- Parts replaced (with part numbers if available)
- Technician notes / recommendations

**Example uploads**
- Jiffy Lube receipt → oil change logged
- Tire purchase email → tire replacement logged with brand/size
- Brake service invoice → brake job logged with parts detail

---

### 2. Vehicle Intelligence Copilot — System of Understanding
The AI layer that turns raw records into answers. Not a generic chatbot — an advisor that knows this specific vehicle's history.

**Core capabilities**
- Natural language Q&A grounded in the vehicle's actual record
- Maintenance explanations (what is X, why does it matter)
- Risk surfacing ("your coolant has never been flushed — at 80k miles this is overdue")
- Personalized recommendations based on mileage, climate, driving patterns
- Multi-vehicle awareness ("which of my cars needs attention most?")

**Example questions it must answer well**
- "When were my brakes last replaced?"
- "Am I overdue for anything?"
- "Why might my check engine light be on?"
- "How much have I spent on this car this year?"
- "What should I do before a 2,000-mile road trip?"
- "Is this repair quote reasonable?"

**Key insight**: The AI isn't just trained on general automotive knowledge. It's answering from this vehicle's specific history. That's the moat.

---

### 3. Vehicle Health Engine — System of Prediction
The most valuable pillar long-term. Most apps stop at record keeping. Garage AI goes further: what's likely to happen next?

**Core capabilities**
- Predict upcoming maintenance based on mileage intervals and manufacturer schedules
- Estimate remaining life of consumables (brakes, tires, battery, belts)
- Identify gaps ("transmission fluid has never been serviced")
- Generate a Vehicle Health Score (0–100) that updates over time
- Alert users before problems become expensive
- Compare against manufacturer maintenance schedule

**Example outputs**
- "Oil change due in ~800 miles"
- "Battery showing signs of age based on last service date"
- "Tires likely need replacement within 6 months at current mileage rate"
- "Health score dropped from 91 → 82 — here's why"
- "3 items flagged as overdue"

**This is the retention mechanism.** Users return weekly because the score changes and alerts fire.

---

### 4. Ownership & Value Management — System of Economics
People don't actually care about maintenance. They care about avoiding expensive surprises, preserving resale value, and knowing what their car is worth. This pillar makes Garage AI financially tangible.

**Vehicle Value**
- Current estimated market value (KBB/Edmunds comparable)
- Trade-in vs. private sale value
- How maintenance history affects value

**Cost Analytics**
- Total lifetime maintenance spend
- Cost per mile (maintenance + fuel if tracked)
- Annual ownership cost
- Spend by category (oil changes, tires, brakes, etc.)
- Comparison to average for this make/model

**Resale Readiness**
- Organized, exportable service record
- Maintenance health score visible to buyers
- Shareable vehicle report (public link)
- "Your records could add $X to resale value"

**Shareable Report example**
> "Here's a verified maintenance history and health report for my 2019 Honda Accord."
> [Public link with timeline, health score, and verified records]

---

## Current State (v0.1)
- ✅ Firebase Auth (Google + email/password)
- ✅ VIN decode via NHTSA
- ✅ Firestore vehicle storage
- ✅ Service history (manual entry)
- ✅ Reminders with priority levels
- ✅ Modifications tracker
- ✅ AI receipt scanner (paste text → Claude extracts)
- ✅ AI Advisor chat (Claude with vehicle context)
- ✅ Sell vehicle listing generator
- ✅ Deployed on Vercel

## Next Priorities
1. **File upload** — PDF/image upload with real OCR (not just paste)
2. **Mobile nav** — sidebar disappears on mobile with no replacement
3. **Health Score** — derive from records + reminders + mileage
4. **Timeline view** — chronological feed of all vehicle events
5. **Split Dashboard.jsx** — currently 500+ lines, needs component architecture
6. **Cost analytics** — charts by category, cost per mile
7. **Shareable report** — public URL with vehicle history

---

## Design Principles
- **Speed** — every interaction should feel instant
- **Trust** — data must feel permanent and reliable
- **Clarity** — complex vehicle data presented simply
- **Intelligence** — the app should feel like it knows your car
- **Mobile-first** — most users will be in a parking lot or garage

---

## Tech Stack
- React + Vite (frontend)
- Firebase Auth + Firestore (auth + database)
- Claude AI via Anthropic API (all AI features)
- Vercel (hosting, auto-deploy from GitHub)
- NHTSA API (VIN decode, free)

## Repo
- GitHub: garage-ai (main branch → auto-deploys to Vercel)
- Live: garage-ai-silk.vercel.app
