import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getVehicleSilhouette } from '../vehicle-silhouettes'
import { demoVehicle, demoRecords, demoMaintenance } from './demo-data'
import styles from './DemoVehicle.module.css'

function usePageMeta(title, description) {
  useEffect(() => {
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

function fmtDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function normalizeRecallLookup(make, model) {
  return { make, model }
}

function RecallStatus({ make, model, year }) {
  const [count, setCount] = useState(null)
  useEffect(() => {
    const { make: nMake, model: nModel } = normalizeRecallLookup(make, model)
    const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(nMake)}&model=${encodeURIComponent(nModel)}&modelYear=${encodeURIComponent(year)}`
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
        <div className={styles.recallGood}><span className={styles.recallIcon}>✓</span>No open recalls on file for this vehicle</div>
      ) : (
        <div className={styles.recallWarn}><span className={styles.recallIcon}>⚠</span>{count} open recall{count !== 1 ? 's' : ''} — contact your dealer</div>
      )}
    </section>
  )
}

const URGENCY_LABEL = { green: 'Coming Up', yellow: 'Due Soon', red: 'Overdue' }

export default function DemoVehicle() {
  usePageMeta(
    '2022 Toyota Camry XSE | Garage AI Demo',
    'See how Garage AI tracks service history, upcoming maintenance, and vehicle health — demo vehicle.'
  )

  const records = [...demoRecords].sort((a, b) => new Date(b.date) - new Date(a.date))

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
        {/* Hero */}
        <div className={styles.hero}>
          <div
            className={styles.silhouette}
            dangerouslySetInnerHTML={{ __html: getVehicleSilhouette(demoVehicle.bodyClass) }}
          />
          <div className={styles.vehicleNameRow}>
            <h1 className={styles.vehicleName}>
              {demoVehicle.year} {demoVehicle.make} {demoVehicle.model}
              <span className={styles.vehicleTrim}> {demoVehicle.trim}</span>
            </h1>
            <span className={styles.demoBadge}>Demo vehicle</span>
          </div>
          <p className={styles.vehicleSub}>
            {demoVehicle.engine} · {demoVehicle.transmission}
          </p>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>12</div>
            <div className={styles.statLabel}>Service Records</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>38,000 mi</div>
            <div className={styles.statLabel}>Current Mileage</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>2 yrs</div>
            <div className={styles.statLabel}>Tracked</div>
          </div>
        </div>

        {/* Service History */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Service History</h2>
          <ul className={styles.recordList}>
            {records.map(r => (
              <li key={r.id} className={styles.recordItem}>
                <div className={styles.recordMain}>
                  <span className={styles.recordTitle}>{r.title}</span>
                  <span className={`${styles.categoryPill} ${styles['cat' + r.category]}`}>{r.category}</span>
                </div>
                <div className={styles.recordMeta}>
                  <span className={styles.recordDate}>{fmtDate(r.date)}</span>
                  <span className={styles.recordSep}>·</span>
                  <span className={styles.recordShop}>{r.shop}</span>
                  {r.mileage > 0 && (
                    <><span className={styles.recordSep}>·</span><span className={styles.recordMileage}>{r.mileage.toLocaleString()} mi</span></>
                  )}
                  {r.cost > 0 && (
                    <><span className={styles.recordSep}>·</span><span className={styles.recordCost}>${r.cost.toFixed(2)}</span></>
                  )}
                  {r.cost === 0 && r.category === 'Insurance' && (
                    <><span className={styles.recordSep}>·</span><span className={styles.recordCost}>Covered by insurance</span></>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Suggested Maintenance */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Suggested Maintenance</h2>
          <ul className={styles.maintenanceList}>
            {demoMaintenance.map(item => (
              <li key={item.id} className={styles.maintenanceItem}>
                <span className={styles.maintenanceName}>{item.service}</span>
                <span className={styles.maintenanceDue}>{item.dueIn}</span>
                <span className={`${styles.urgencyBadge} ${styles['urgency_' + item.urgency]}`}>
                  {URGENCY_LABEL[item.urgency]}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.maintenanceNote}>Estimates based on typical service intervals.</p>
        </section>

        {/* Recall Status */}
        <RecallStatus make={demoVehicle.make} model={demoVehicle.model} year={demoVehicle.year} />

        {/* CTA */}
        <div className={styles.ctaBanner}>
          <p className={styles.ctaBannerText}>Know your car better than anyone.</p>
          <Link to="/" className={styles.ctaBannerBtn}>Start tracking free →</Link>
        </div>
      </div>
    </div>
  )
}
