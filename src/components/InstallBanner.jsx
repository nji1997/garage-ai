import { useState, useEffect } from 'react'
import styles from './InstallBanner.module.css'

const DISMISSED_KEY = 'garageai_install_dismissed'

export default function InstallBanner() {
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [prompt, setPrompt] = useState(null)

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    if (isStandalone) return

    // Don't show if dismissed before
    if (localStorage.getItem(DISMISSED_KEY)) return

    // Desktop — don't show
    if (window.innerWidth > 768) return

    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)

    if (ios) {
      setVisible(true)
    } else {
      const handler = (e) => {
        e.preventDefault()
        setPrompt(e)
        setVisible(true)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
    setShowTip(false)
  }

  async function handleAdd() {
    if (isIOS) {
      setShowTip(true)
      return
    }
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') dismiss()
      setPrompt(null)
    }
  }

  if (!visible) return null

  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        <img src="/car.svg" className={styles.icon} alt="" />
        <p className={styles.text}>
          {showTip
            ? <>Tap <strong>Share</strong> <span className={styles.shareIcon}>⬆</span> then <strong>"Add to Home Screen"</strong></>
            : 'Add to your home screen for the best experience'}
        </p>
        <div className={styles.actions}>
          {!showTip && (
            <button className={styles.addBtn} onClick={handleAdd}>Add</button>
          )}
          <button className={styles.dismissBtn} onClick={dismiss}>
            {showTip ? 'Got it' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  )
}
