import { useState, useEffect, useRef } from 'react'
import styles from './InstallBanner.module.css'

const DISMISSED_KEY = 'garageai_install_dismissed'
const DISMISS_TTL = 7 * 24 * 60 * 60 * 1000

// Capture beforeinstallprompt at module load, before any React render.
// React state re-renders can lose the event object; a module-level variable
// persists across renders and is safe to call .prompt() on later.
let _deferredPrompt = null
const _promptCallbacks = new Set()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    _deferredPrompt = e
    _promptCallbacks.forEach((cb) => cb(e))
  })
}

export default function InstallBanner() {
  const promptRef = useRef(_deferredPrompt)
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showTip, setShowTip] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    if (isStandalone) return

    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed) {
      const age = Date.now() - parseInt(dismissed, 10)
      if (age < DISMISS_TTL) return
      localStorage.removeItem(DISMISSED_KEY)
    }

    if (window.innerWidth > 768) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())
    setIsIOS(ios)

    if (ios) {
      // iOS never fires beforeinstallprompt — show tip immediately
      setShowTip(true)
      setVisible(true)
      return
    }

    // Non-iOS: show if prompt already captured (event fired before mount)
    if (_deferredPrompt) {
      promptRef.current = _deferredPrompt
      setVisible(true)
    }

    // Also subscribe in case the event fires after mount
    const handler = (e) => {
      promptRef.current = e
      setVisible(true)
    }
    _promptCallbacks.add(handler)
    return () => _promptCallbacks.delete(handler)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setVisible(false)
    setShowTip(false)
  }

  async function handleAdd() {
    const p = promptRef.current
    if (!p) return
    p.prompt()
    const { outcome } = await p.userChoice
    promptRef.current = null
    _deferredPrompt = null
    if (outcome === 'accepted') {
      setVisible(false)
    } else {
      dismiss()
    }
  }

  if (!visible) return null

  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        <img src="/apple-touch-icon.png" className={styles.icon} alt="" />
        <p className={styles.text}>
          {showTip ? (
            <>Tap <strong>Share</strong> <span className={styles.shareIcon}>⬆</span> then <strong>"Add to Home Screen"</strong></>
          ) : (
            'Add Garage AI to your home screen'
          )}
        </p>
        <div className={styles.actions}>
          {!showTip && (
            <button className={styles.addBtn} onClick={handleAdd}>Add</button>
          )}
          <button className={styles.dismissBtn} onClick={dismiss}>
            {showTip ? 'Got it' : '✕'}
          </button>
        </div>
      </div>
    </div>
  )
}
