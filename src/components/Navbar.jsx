import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <i className="ti ti-car" />
        <span>Garage AI</span>
      </div>
      <div className={styles.legalLinks}>
        <Link to="/privacy">Privacy</Link>
        <span>·</span>
        <Link to="/tos">Terms</Link>
      </div>

      {user && (
        <div className={styles.right}>
          <div className={styles.userInfo}>
            {user.photoURL
              ? <img src={user.photoURL} alt="" className={styles.avatar} />
              : <div className={styles.avatarInitial}>{(user.displayName || user.email || 'U')[0].toUpperCase()}</div>
            }
            <span className={styles.userName}>{user.displayName || user.email}</span>
          </div>
          <button onClick={logout} className={styles.logoutBtn} title="Sign out">
            <i className="ti ti-logout" />
          </button>
        </div>
      )}
    </nav>
  )
}
