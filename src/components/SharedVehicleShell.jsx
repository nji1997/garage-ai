import ShareNav from './ShareNav'
import styles from './SharedVehicleShell.module.css'

// CTABanner is exported so each page can place it wherever it needs to appear.
// DemoVehicle renders it at the bottom; SharedVehicle renders it after the hero.
export function CTABanner() {
  return (
    <div className={styles.ctaBanner}>
      <p className={styles.ctaBannerText}>
        Your car's full history, always at your fingertips — free to start, takes 2 minutes
      </p>
      <a href="/" className={styles.ctaBannerBtn}>
        Start tracking free <span aria-hidden="true">→</span>
      </a>
    </div>
  )
}

// Shell owns: skip link, nav, page background, main landmark, centered container.
export default function SharedVehicleShell({ children }) {
  return (
    <div className={styles.page}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <ShareNav />
      <main id="main-content">
        <div className={styles.container}>
          {children}
        </div>
      </main>
    </div>
  )
}
