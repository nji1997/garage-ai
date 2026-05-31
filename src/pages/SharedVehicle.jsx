import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getVehicleSilhouette } from '../vehicle-silhouettes'
import { useNHTSARecalls } from '../hooks/useNHTSARecalls'
import { usePageMeta } from '../hooks/usePageMeta'
import { getCategoryClass } from '../utils/categoryColors'
import SharedVehicleShell, { CTABanner } from '../components/SharedVehicleShell'
import styles from './SharedVehicle.module.css'

function fmtMonth(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
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

  const { count: recallCount, loading: recallLoading } = useNHTSARecalls(
    vehicle?.year, vehicle?.make, vehicle?.model
  )

  if (loading) return (
    <div className={styles.fullCenter}>
      <div className={styles.spinner} aria-label="Loading vehicle data" />
    </div>
  )

  if (error) return (
    <div className={styles.fullCenter}>
      <div className={styles.errorBox}>
        <div className={styles.errorEmoji} aria-hidden="true">🚗</div>
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
    <SharedVehicleShell>

      {/* ── Vehicle header ── */}
      <div className={styles.hero}>
        <div
          className={styles.silhouette}
          aria-hidden="true"
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

      {/* ── CTA after hero, before stats ── */}
      <CTABanner />

      {/* ── Stats ── */}
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

      {/* ── Service summary — line items private ── */}
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
                <span key={cat} className={`${styles.categoryPill} ${styles[getCategoryClass(cat)]}`}>{cat}</span>
              ))}
            </div>
          )}
          <p className={styles.ownerNote}>
            Owner-submitted records · Full details available to owner only
          </p>
        </section>
      )}

      {/* ── Recall status ── */}
      {vehicle.make && vehicle.model && vehicle.year && (
        <section className={styles.section} aria-live="polite" aria-atomic="true">
          <h2 className={styles.sectionHeading}>Recall Status</h2>
          {recallLoading || recallCount === null ? (
            <p className={styles.recallLoading}>Checking recall database…</p>
          ) : recallCount === 0 ? (
            <div className={styles.recallGood}>
              <span className={styles.recallIcon} aria-hidden="true">✓</span>
              No open recalls on file for this vehicle
            </div>
          ) : (
            <div className={styles.recallWarn}>
              <span className={styles.recallIcon} aria-hidden="true">⚠</span>
              {recallCount} open recall{recallCount !== 1 ? 's' : ''} — contact your dealer
            </div>
          )}
        </section>
      )}

    </SharedVehicleShell>
  )
}
