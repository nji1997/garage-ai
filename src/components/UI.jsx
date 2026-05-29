import styles from './UI.module.css'

export function Btn({ children, variant = 'secondary', size = 'md', disabled, onClick, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '', onClick, selected }) {
  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function Badge({ children, color = 'purple' }) {
  return <span className={`${styles.badge} ${styles['badge-' + color]}`}>{children}</span>
}

export function Spinner() {
  return <div className={styles.spinner} />
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className={styles.empty}>
      <i className={`ti ti-${icon}`} />
      <strong>{title}</strong>
      {subtitle && <p>{subtitle}</p>}
      {action}
    </div>
  )
}

export function SectionHeader({ title, action }) {
  return (
    <div className={styles.sectionHeader}>
      <h3>{title}</h3>
      {action}
    </div>
  )
}
