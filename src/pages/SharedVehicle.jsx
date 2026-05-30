import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getVehicleSilhouette } from '../vehicle-silhouettes'
import styles from './SharedVehicle.module.css'

const CAT = {
  Maintenance: { bg: '#dcfce7', color: '#166534', border: '#86efac' },
  Upgrade:     { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
  Insurance:   { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
}

function usePageMeta(title, description) {
  useEffect(() => {
    if (!title) return
    const prev = document.title
    document.title = title

    const tags = []
    function set(attr, key, val) {
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      let created = false
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); created = true }
      el.setAttribute('content', val)
      if (created) tags.push(el)
    }
    set('property', 'og:title', title)
    set('property', 'og:description', description)
    set('property', 'og:type', 'website')
    set('name', 'twitter:card', 'summary')
    set('name', 'twitter:title', title)
    set('name', 'twitter:description', description)

    return () => { document.title = prev; tags.forEach(el => el.remove()) }
  }, [title, description])
}

function fmt(n) {
  return '$' + Math.round(n || 0).toLocaleString()
}

export default function SharedVehicle() {
  const { shareId } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDoc(doc(db, 'publicShares', shareId)).then(snap => {
      if (!snap.exists()) setError('This share link is no longer active.')
      else setVehicle(snap.data())
    }).catch(err => {
      setError(err.code === 'permission-denied'
        ? 'Public sharing is not yet enabled — the owner needs to update their Firestore security rules.'
        : 'Could not load vehicle: ' + err.message)
    }).finally(() => setLoading(false))
  }, [shareId])

  const vehicleName = vehicle
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}`
    : null
  usePageMeta(
    vehicleName ? `${vehicleName} | Garage AI` : 'Garage AI',
    vehicleName ? `Full service history for this ${vehicleName} — tracked on Garage AI.` : ''
  )

  if (loading) return (
    <div className={styles.fullCenter}>
      <div className={styles.spinner} />
    </div>
  )

  if (error) return (
    <div className={styles.fullCenter}>
      <div className={styles.errorBox}>
        <div className={styles.errorEmoji}>🚗</div>
        <p>{error}</p>
        <Link to="/" className={styles.errorCta}>Open Garage AI</Link>
      </div>
    </div>
  )

  const records = vehicle.records || []
  const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date))
  const upgrades = sorted.filter(r => r.category === 'Upgrade')

  const maintenanceSpend = records
    .filter(r => r.category !== 'Insurance')
    .reduce((s, r) => s + (r.cost || 0), 0)

  const latestMileage = [...records]
    .filter(r => r.date && r.mileage > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.mileage || vehicle.mileage || 0

  const oldest = [...records].filter(r => r.date).sort((a, b) => new Date(a.date) - new Date(b.date))[0]
  const yearsTracked = oldest
    ? Math.max(1, Math.round((Date.now() - new Date(oldest.date)) / (365.25 * 864e5)))
    : null

  const stats = [
    { label: 'Service records', value: records.length },
    { label: 'Total spent', value: fmt(maintenanceSpend) },
    { label: 'Current mileage', value: Math.round(latestMileage / 1000) + 'k mi' },
    yearsTracked ? { label: 'Years tracked', value: yearsTracked + (yearsTracked === 1 ? ' yr' : ' yrs') } : null,
  ].filter(Boolean)

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2"/>
            <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
          </svg>
          Garage AI
        </Link>
        <span className={styles.trackedBadge}>Tracked with Garage AI</span>
      </nav>

      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          <div
            className={styles.silhouette}
            dangerouslySetInnerHTML={{ __html: getVehicleSilhouette(vehicle.bodyClass) }}
          />
          <h1 className={styles.vehicleName}>
            {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.trim && <span className={styles.vehicleTrim}> {vehicle.trim}</span>}
          </h1>
          {(vehicle.engine || vehicle.transmission) && (
            <p className={styles.vehicleSub}>
              {[vehicle.engine, vehicle.transmission, vehicle.color].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {stats.map(s => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Service history */}
        {sorted.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Service History</h2>
            <div className={styles.timeline}>
              {sorted.map((r, i) => {
                const cat = r.category || 'Maintenance'
                const c = CAT[cat] || CAT.Maintenance
                return (
                  <div key={r.id || i} className={styles.timelineRow}>
                    <div className={styles.timelineLeft}>
                      <div className={styles.recDate}>{r.date}</div>
                      <div className={styles.recService}>{r.service}</div>
                      {r.shop && <div className={styles.recShop}>{r.shop}</div>}
                    </div>
                    <div className={styles.timelineRight}>
                      <span className={styles.catBadge} style={{ background: c.bg, color: c.color, borderColor: c.border }}>
                        {cat}
                      </span>
                      <div className={styles.recCost}>{fmt(r.cost)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Upgrades */}
        {upgrades.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Upgrades & Modifications</h2>
            <div className={styles.upgradeGrid}>
              {upgrades.map((r, i) => (
                <div key={r.id || i} className={styles.upgradeCard}>
                  <div className={styles.upgradeName}>{r.service}</div>
                  {r.date && <div className={styles.upgradeDate}>{r.date}</div>}
                  <div className={styles.upgradeCost}>{fmt(r.cost)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className={styles.cta}>
          <h2 className={styles.ctaHeadline}>Know your car better than anyone.</h2>
          <p className={styles.ctaBody}>Track service history, costs, and mileage — free.</p>
          <Link to="/" className={styles.ctaBtn}>Start Tracking Free</Link>
          <p className={styles.ctaDomain}>garage-ai-silk.vercel.app</p>
        </div>
      </div>
    </div>
  )
}
