import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getVehicleSilhouette } from '../vehicle-silhouettes'
import { demoVehicle, demoRecords, demoMaintenance } from './demo-data'
import { useNHTSARecalls } from '../hooks/useNHTSARecalls'
import { usePageMeta } from '../hooks/usePageMeta'
import { getCategoryClass } from '../utils/categoryColors'
import SharedVehicleShell, { CTABanner } from '../components/SharedVehicleShell'
import styles from './DemoVehicle.module.css'

function fmtDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

const URGENCY_LABEL = { green: 'Coming Up', yellow: 'Due Soon', red: 'Overdue' }

const totalSpend = demoRecords.reduce((sum, r) => sum + r.cost, 0)

export default function DemoVehicle() {
  usePageMeta(
    '2022 Toyota Camry XSE | Garage AI Demo',
    'See how Garage AI tracks service history, upcoming maintenance, and vehicle health — demo vehicle.'
  )

  const { count: recallCount, loading: recallLoading } = useNHTSARecalls(
    demoVehicle.year, demoVehicle.make, demoVehicle.model
  )

  const records = useMemo(
    () => [...demoRecords].sort((a, b) => new Date(b.date) - new Date(a.date)),
    []
  )

  // Group sorted records by year for a scannable timeline
  const recordsByYear = useMemo(() => {
    const groups = {}
    records.forEach(r => {
      const year = r.date
        ? new Date(r.date + 'T12:00:00').getFullYear().toString()
        : 'Unknown'
      if (!groups[year]) groups[year] = []
      groups[year].push(r)
    })
    return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a))
  }, [records])

  return (
    <SharedVehicleShell>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div
          className={styles.silhouette}
          aria-hidden="true"
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
        {demoVehicle.vin && (
          <p className={styles.vin}>
            VIN: <span className={styles.vinCode}>{demoVehicle.vin}</span>
            <span className={styles.vinNote}> (example — real pages show the owner's VIN)</span>
          </p>
        )}
        <p className={styles.productExplainer}>
          The maintenance logbook for your car, with smart reminders and live recall alerts.
        </p>
      </div>

      {/* ── Health summary card ── */}
      <div className={styles.healthCard} role="region" aria-label="Vehicle health summary">
        <div className={styles.healthItem}>
          <div className={styles.healthValue}>${Math.round(totalSpend).toLocaleString()}</div>
          <div className={styles.healthLabel}>Documented spend</div>
        </div>
        <div className={styles.healthItem}>
          <div className={styles.healthValue}>{demoRecords.length}</div>
          <div className={styles.healthLabel}>Service records</div>
        </div>
        <div className={styles.healthItem}>
          <div className={styles.healthValue}>
            {recallLoading || recallCount === null ? '—' : recallCount}
          </div>
          <div className={styles.healthLabel}>
            {recallLoading || recallCount === null
              ? 'Checking recalls…'
              : recallCount === 0
              ? 'No open recalls'
              : 'Open recall' + (recallCount !== 1 ? 's' : '')}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
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

      {/* ── Service History (grouped by year) ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Service History</h2>
        {recordsByYear.map(([year, yearRecords]) => (
          <div key={year}>
            <div className={styles.yearDivider} aria-label={`Records from ${year}`}>{year}</div>
            <ul className={styles.recordList}>
              {yearRecords.map(r => (
                <li key={r.id} className={styles.recordItem}>
                  <div className={styles.recordMain}>
                    <span className={styles.recordTitle}>{r.title}</span>
                    <span className={`${styles.categoryPill} ${styles[getCategoryClass(r.category)]}`}>
                      {r.category}
                    </span>
                  </div>
                  <div className={styles.recordMeta}>
                    <span className={styles.recordDate}>{fmtDate(r.date)}</span>
                    <span className={styles.recordSep}>·</span>
                    <span className={styles.recordShop}>{r.shop}</span>
                    {r.mileage > 0 && (
                      <><span className={styles.recordSep}>·</span>
                      <span className={styles.recordMileage}>{r.mileage.toLocaleString()} mi</span></>
                    )}
                    {r.cost > 0 && (
                      <><span className={styles.recordSep}>·</span>
                      <span className={styles.recordCost}>${r.cost.toFixed(2)}</span></>
                    )}
                    {r.cost === 0 && r.category === 'Insurance' && (
                      <><span className={styles.recordSep}>·</span>
                      <span className={styles.recordCost}>Insurance covered</span></>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* ── Suggested Maintenance ── */}
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

      {/* ── Mid-page CTA ── */}
      <div className={styles.midCTA}>
        <Link to="/" className={styles.midCTABtn}>
          Track your own car free <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* ── Recall Status ── */}
      <section className={styles.section} aria-live="polite" aria-atomic="true">
        <h2 className={styles.sectionHeading}>
          Recall Status
          <span className={styles.nhtsa}>via NHTSA</span>
        </h2>
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

      {/* ── Bottom CTA ── */}
      <CTABanner />

    </SharedVehicleShell>
  )
}
