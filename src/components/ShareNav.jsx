import { Link } from 'react-router-dom'
import styles from './ShareNav.module.css'

export default function ShareNav() {
  return (
    <nav className={styles.nav} aria-label="Site navigation">
      <Link to="/" className={styles.navLogo}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2"/>
          <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
        </svg>
        Garage AI
      </Link>
      <span className={styles.trackedBadge}>Tracked with Garage AI</span>
    </nav>
  )
}
