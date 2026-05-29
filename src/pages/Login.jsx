import { useState } from 'react'
import {
  signInWithPopup, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, sendPasswordResetEmail
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import styles from './Login.module.css'

export default function Login() {
  const [mode, setMode] = useState('signin') // signin | signup | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    setError(''); setLoading(true)
    try { await signInWithPopup(auth, googleProvider) }
    catch (e) { setError(friendlyError(e.code)) }
    finally { setLoading(false) }
  }

  async function handleEmail(e) {
    e.preventDefault(); setError(''); setInfo(''); setLoading(true)
    try {
      if (mode === 'signin') await signInWithEmailAndPassword(auth, email, password)
      else if (mode === 'signup') await createUserWithEmailAndPassword(auth, email, password)
      else {
        await sendPasswordResetEmail(auth, email)
        setInfo('Reset email sent — check your inbox.')
        setLoading(false); return
      }
    } catch (e) { setError(friendlyError(e.code)) }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <i className="ti ti-car" />
          <span>Garage AI</span>
        </div>
        <p className={styles.tagline}>Track, manage, and sell your vehicles with AI</p>

        <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className={styles.divider}><span>or</span></div>

        <form onSubmit={handleEmail} className={styles.form}>
          <input type="email" placeholder="Email address" value={email}
            onChange={e => setEmail(e.target.value)} required />
          {mode !== 'reset' && (
            <input type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)} required minLength={6} />
          )}
          {error && <p className={styles.error}>{error}</p>}
          {info && <p className={styles.info}>{info}</p>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset email'}
          </button>
        </form>

        <div className={styles.links}>
          {mode === 'signin' && <>
            <button onClick={() => { setMode('signup'); setError('') }}>Create account</button>
            <span>·</span>
            <button onClick={() => { setMode('reset'); setError('') }}>Forgot password?</button>
          </>}
          {mode !== 'signin' && (
            <button onClick={() => { setMode('signin'); setError(''); setInfo('') }}>← Back to sign in</button>
          )}
        </div>
      </div>
    </div>
  )
}

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/network-request-failed': 'Network error — please try again.',
  }
  return map[code] || 'Something went wrong. Please try again.'
}
