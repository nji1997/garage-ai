import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Badge, Spinner } from '../components/UI'
import styles from './SharedVehicle.module.css'

export default function SharedVehicle() {
  const { shareId } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'publicShares', shareId))
        if (!snap.exists()) { setError('This share link is no longer active.'); setLoading(false); return }
        setVehicle(snap.data())
      } catch (err) {
        if (err.code === 'permission-denied') {
          setError('Public sharing is not yet enabled. The owner needs to update their Firestore security rules.')
        } else {
          setError('Could not load vehicle — ' + err.message)
        }
      }
      setLoading(false)
    }
    load()
  }, [shareId])

  if (loading) return (
    <div className={styles.center}>
      <Spinner />
    </div>
  )

  if (error) return (
    <div className={styles.center}>
      <div className={styles.errorBox}>
        <i className="ti ti-alert-circle" style={{ fontSize: 28, color: 'var(--coral)' }} />
        <p>{error}</p>
        <Link to="/" className={styles.homeLink}>Open Garage AI</Link>
      </div>
    </div>
  )

  const records = vehicle.records || []
  const mods = vehicle.mods || []
  const total = records.reduce((s, r) => s + (r.cost || 0), 0)
  const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</h1>
            <p className={styles.sub}>
              {[vehicle.engine, vehicle.transmission, vehicle.color].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        {/* AI photo */}
        {vehicle.aiImageUrl && (
          <img
            src={vehicle.aiImageUrl}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className={styles.carImage}
          />
        )}

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { label: 'Mileage', value: (vehicle.mileage || 0).toLocaleString() + ' mi', icon: 'road' },
            { label: 'Service records', value: records.length, icon: 'file-text' },
            { label: 'Total maintenance', value: '$' + total.toFixed(0), icon: 'coin' },
            { label: 'Modifications', value: mods.length, icon: 'bolt' },
          ].map(s => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statLabel}><i className={`ti ti-${s.icon}`} /> {s.label}</div>
              <div className={styles.statValue}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Service history */}
        {sortedRecords.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Service history</h2>
            {sortedRecords.map(r => (
              <div key={r.id} className={styles.recordRow}>
                <div className={styles.recordLeft}>
                  <div className={styles.recordService}>{r.service}</div>
                  <div className={styles.recordMeta}>
                    {r.date && <span>{r.date}</span>}
                    {r.shop && <span>{r.shop}</span>}
                    {r.mileage > 0 && <span>{r.mileage.toLocaleString()} mi</span>}
                    <Badge color={r.verified ? 'teal' : 'gray'}>{r.verified ? '✓ Verified' : 'DIY'}</Badge>
                  </div>
                  {r.notes && <div className={styles.recordNotes}>{r.notes}</div>}
                </div>
                <div className={styles.recordCost}>${(r.cost || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Modifications */}
        {mods.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Modifications</h2>
            <div className={styles.modList}>
              {mods.map((m, i) => (
                <div key={i} className={styles.modItem}>
                  <i className="ti ti-bolt" style={{ color: 'var(--purple)', fontSize: 14 }} />
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <Link to="/" className={styles.footerLink}>
            <i className="ti ti-car" /> Manage your vehicles with Garage AI
          </Link>
        </div>
      </div>
    </div>
  )
}
