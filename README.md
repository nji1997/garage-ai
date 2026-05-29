# Garage AI 🚗

An AI-powered vehicle maintenance tracker with Firebase authentication, Firestore database, and Claude AI — built with React + Vite.

---

## Features

- **Google + email/password login** via Firebase Auth
- **VIN decoder** using the free NHTSA database (no API key needed)
- **Service history** with verified/DIY records stored per user in Firestore
- **AI receipt scanner** — paste receipt text, Claude extracts all details
- **AI advisor** — chat with Claude about your specific vehicle
- **Maintenance reminders** with priority levels
- **Modifications tracker**
- **Sell vehicle listing generator** powered by Claude

---

## Setup (5 steps)

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** and follow the steps
3. In your project, go to **Build → Authentication → Get started**
   - Enable **Email/Password** provider
   - Enable **Google** provider
4. Go to **Build → Firestore Database → Create database**
   - Choose **Start in production mode**
   - Pick a region close to your users
5. Go to **Project Settings** (gear icon) → **Your apps** → click **</>** (web)
   - Register your app and copy the config object

### 3. Add your Firebase config

Open `src/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
}
```

### 4. Deploy Firestore security rules

In Firebase Console → Firestore → Rules, paste the contents of `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/vehicles/{vehicleId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **Publish**.

### 5. Add your Anthropic API key

The app calls the Anthropic API directly from the browser. To make this work securely in production, add your API key to your hosting environment:

**For Vercel** (recommended):
- Go to your Vercel project → Settings → Environment Variables
- Add `VITE_ANTHROPIC_API_KEY` = your key from [console.anthropic.com](https://console.anthropic.com)

Then update `src/pages/Dashboard.jsx` — replace the fetch headers:

```js
headers: {
  'Content-Type': 'application/json',
  'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
},
```

> **Note:** For a production app with many users, you should proxy API calls through your own backend to keep the API key secret and control costs.

---

## Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## Deploy to Vercel

```bash
# Install Vercel CLI (one time)
npm i -g vercel

# Deploy
vercel

# Follow the prompts — it auto-detects Vite
# Set your environment variables in the Vercel dashboard
```

Or connect your GitHub repo to Vercel for automatic deployments on every push.

---

## Deploy to Netlify

```bash
npm run build
# Drag the `dist/` folder to netlify.com/drop
```

The `vercel.json` handles SPA routing on Vercel. For Netlify, add a `public/_redirects` file:
```
/*  /index.html  200
```

---

## Project structure

```
src/
  firebase.js          ← Firebase config (fill in your values)
  App.jsx              ← Routing + auth guard
  main.jsx             ← Entry point
  index.css            ← Global styles
  hooks/
    useAuth.jsx        ← Auth context (login/logout/user state)
    useVehicles.js     ← Firestore CRUD for vehicles
  components/
    Navbar.jsx         ← Top navigation bar
    UI.jsx             ← Shared components (Button, Card, Badge…)
    VinLookup.jsx      ← NHTSA VIN decoder
  pages/
    Login.jsx          ← Login/signup/reset page
    Dashboard.jsx      ← Main app with all tabs + AI features
```
