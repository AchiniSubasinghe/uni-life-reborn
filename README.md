# UniLife — Campus Services Platform for Sri Lankan Universities

> **Hackathon Submission** · _Design and develop a responsive web-based application that solves a real and meaningful problem faced by university students._

---

## The Problem

Every year, thousands of first-year students arrive at Sri Lankan universities and immediately face the same set of obstacles:

- **Where do I find safe, affordable accommodation** near campus?
- **Where can I eat on a budget** without wandering unfamiliar streets?
- **Where is the nearest pharmacy, supermarket, or laundry** when I need it?

There is no centralised, verified, student-focused resource for any of this. Students rely on word-of-mouth, outdated Facebook groups, and trial and error — wasting time, money, and mental energy during an already stressful transition.

---

## The Solution: UniLife

UniLife is a **full-stack web platform** that connects university students with verified local businesses and services near their campus:

- **Students** browse and search a verified directory of nearby businesses — filtered by category, price range, and rating.
- **Business owners** list their services through a provider portal with a guided onboarding flow, reaching thousands of students for free.
- **Administrators** approve listings to maintain quality, moderating reviews and managing the platform.
- **UniBot** — an AI-powered campus guide (Groq / Llama 3.3 70b) — answers student questions in natural language.

---

## Target Users

| User                      | Need                                           |
| ------------------------- | ---------------------------------------------- |
| **University students**   | Discover trusted, nearby services quickly      |
| **Local business owners** | Reach the university student market at no cost |

**Universities served:** NSBM Green University · University of Colombo · University of Sri Jayewardenepura

---

## Key Features

### For Students

- 🔍 **Browse & search** — full-text search + filters (category, price range, star rating)
- ❤️ **Favorites** — save and revisit businesses you love
- ⭐ **Reviews** — read and write student reviews with star ratings
- 🤖 **UniBot** — AI chat assistant for instant campus guidance

### For Business Providers

- 🧭 **Guided onboarding** — 3-step wizard after signup
- 🏢 **Business listings** — photos, hours, amenities, pricing, contact info
- 📊 **Provider dashboard** — track listing status and reviews

### For Admins

- 📋 **Approval queue** — review and approve/reject business submissions
- 📈 **Dashboard analytics** — total users, businesses, pending items, reported reviews

---

## Tech Stack

| Layer           | Technology                               |
| --------------- | ---------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack)       |
| Language        | TypeScript                               |
| UI              | React 19, Tailwind CSS v4, Framer Motion |
| Components      | shadcn/ui, Lucide Icons                  |
| Auth & Database | Firebase Authentication + Firestore      |
| AI              | Groq SDK · Llama 3.3 70b Versatile       |
| Package Manager | Bun                                      |

---

## Getting Started

```bash
bun install
bun dev
```

Open http://localhost:3000

### Environment Variables

Rename `.env.example` to `.env` and fill in your credentials:

```env
# Firebase (https://console.firebase.google.com)
NEXT_PUBLIC_API_KEY=
NEXT_PUBLIC_AUTH_DOMAIN=
NEXT_PUBLIC_PROJECT_ID=
NEXT_PUBLIC_STORAGE_BUCKET=
NEXT_PUBLIC_MESSAGING_SENDER_ID=
NEXT_PUBLIC_APP_ID=

# Groq — free tier at https://console.groq.com
GROQ_API_KEY=
# Google Maps API Key(use for maps,location services and geocoding)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## Problem Validation

1. Facebook groups like "NSBM New Students" get hundreds of _"where to find X"_ posts from freshers every semester.
2. Hostel and boarding scams are common when students use unverified classifieds.
3. University websites do not list or endorse off-campus services.
4. No existing platform targets Sri Lankan university students for this need.

UniLife addresses all of these with a **verified, free, student-first** platform.
