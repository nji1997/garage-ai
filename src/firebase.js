// ─────────────────────────────────────────────────────────────
//  STEP 1: Replace these values with your Firebase project config
//  Get them from: Firebase Console → Project Settings → Your Apps
// ─────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDrmSlMlE_45XhS55GrRWEvhrErevNmOZQ",
  authDomain: "mygarage-80dd3.firebaseapp.com",
  projectId: "mygarage-80dd3",
  storageBucket: "mygarage-80dd3.firebasestorage.app",
  messagingSenderId: "303935110153",
  appId: "1:303935110153:web:e96f6d91344f8aa0880cd8",
  measurementId: "G-P4SNR6JKPN",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
// Use localStorage only — avoids sessionStorage failures on Safari (ITP / private browsing)
setPersistence(auth, browserLocalPersistence).catch(() => {})
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
