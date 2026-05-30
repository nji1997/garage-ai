import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getVehicleSilhouette } from '../vehicle-silhouettes'
import styles from './SharedVehicle.module.css'

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

function fmtMonth(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function RecallStatus({ make, model, year }) {
  const [count, setCount] = useState(null)

  useEffect(() => {
    const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`
    fetch(url)
      .then(res => {
        if (res.status === 400) { setCount(0); return null }
        if (!res.ok) { setCount(-1); return null }
        return res.json()
      })
      .then(data => { if (data) setCount(data.results?.length || 0) })
      .catch(() => setCount(-1))
  }, [make, model, year])

  if (count === null || count === -1) return null

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeading}>Recall Status</h2>
      {count === 0 ? (
        <div className={styles.recallGood}>
          <span className={styles.recallIcon}>✓</span>
          No open recalls on file for this vehicle
        </div>
      ) : (
        <div className={styles.recallWarn}>
          <span className={styles.recallIcon}>⚠</span>
          {count} open recall{count !== 1 ? 's' : ''} — contact your dealer
        </div>
      )}
    </section>
  )
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
    vehicleName ? `Verified service history for this ${vehicleName} — tracked on Garage AI.` : ''
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
  const mods = vehicle.mods || []

  const latestMileage = [...records]
    .filter(r => r.date && r.mileage > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.mileage || vehicle.mileage || 0

  const datedRecords = records.filter(r => r.date).sort((a, b) => new Date(a.date) - new Date(b.date))
  const firstRecord = datedRecords[0]
  const lastRecord = datedRecords[datedRecords.length - 1]

  const categories = [...new Set(records.map(r => r.category || 'Maintenance'))].sort()

  const stats = [
    latestMileage > 0 ? { label: 'Mileage', value: Math.round(latestMileage).toLocaleString() + ' mi' } : null,
    { label: 'Service records', value: records.length },
    mods.length > 0 ? { label: 'Modifications', value: mods.length } : null,
  ].filter(Boolean)

  const dateRange = (() => {
    const first = fmtMonth(firstRecord?.date)
    const last = fmtMonth(lastRecord?.date)
    if (!first) return null
    if (first === last) return first
    return `${first} – ${last}`
  })()

  return (
    <div className={styles.page}>
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
        {/* Vehicle header */}
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

        {/* CTA — second thing a viewer sees */}
        <div className={styles.ctaBanner}>
          <p className={styles.ctaBannerText}>Know your car better than anyone.</p>
          <Link to="/" className={styles.ctaBannerBtn}>Start tracking free →</Link>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className={styles.statsGrid}>
            {stats.map(s => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Service summary — no line items */}
        {records.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Service History</h2>
            <div className={styles.summaryCount}>
              {records.length} service{records.length !== 1 ? 's' : ''} recorded
            </div>
            {dateRange && (
              <div className={styles.summaryRange}>{dateRange}</div>
            )}
            {categories.length > 0 && (
              <div className={styles.categoryRow}>
                {categories.map(cat => (
                  <span key={cat} className={`${styles.categoryPill} ${styles['cat' + cat]}`}>{cat}</span>
                ))}
              </div>
            )}
            <p className={styles.privateNote}>Full records available to owner</p>
          </section>
        )}

        {/* Recall status */}
        {vehicle.make && vehicle.model && vehicle.year && (
          <RecallStatus make={vehicle.make} model={vehicle.model} year={vehicle.year} />
        )}
      </div>
    </div>
  )
}
