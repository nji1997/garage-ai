import { useState } from 'react'
import VinLookup from './VinLookup'
import { Badge } from './UI'
import styles from './MobileBar.module.css'

export default function MobileBar({ vehicles, vehicle, selectedId, setSelectedId, addVehicle, setTab }) {
  const [sheet, setSheet] = useState(null) // null | 'vehicles' | 'add'

  function closeSheet() { setSheet(null) }

  async function handleAdd(data) {
    await addVehicle(data)
    closeSheet()
  }

  function switchVehicle(id) {
    setSelectedId(id)
    setTab('Overview')
    closeSheet()
  }

  const urgentCount = vehicles.reduce((n, v) => {
    return n + (v.reminders || []).filter(r => r.priority === 'high').length
  }, 0)

  return (
    <>
      <div className={styles.bar}>
        <button className={styles.vehicleBtn} onClick={() => setSheet('vehicles')}>
          <i className="ti ti-car" />
          <span className={styles.vehicleName}>
            {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'My Garage'}
          </span>
          {urgentCount > 0 && <Badge color="coral">{urgentCount}</Badge>}
          <i className="ti ti-chevron-up" style={{ fontSize: 13, marginLeft: 'auto' }} />
        </button>
        <button className={styles.addBtn} onClick={() => setSheet('add')} aria-label="Add vehicle">
          <i className="ti ti-plus" />
        </button>
      </div>

      {sheet && (
        <div className={styles.overlay} onClick={closeSheet}>
          <div className={styles.sheetWrap} onClick={e => e.stopPropagation()}>
            <div className={styles.handle} />

            {sheet === 'vehicles' && (
              <>
                <div className={styles.sheetTitle}>My Garage</div>
                {vehicles.length === 0 && (
                  <p className={styles.sheetEmpty}>No vehicles yet. Tap + to add one.</p>
                )}
                {vehicles.map(v => {
                  const urgent = (v.reminders || []).filter(r => r.priority === 'high').length
                  return (
                    <button
                      key={v.id}
                      className={`${styles.vehicleOption} ${v.id === selectedId ? styles.vehicleOptionActive : ''}`}
                      onClick={() => switchVehicle(v.id)}
                    >
                      <div className={styles.vehicleOptionName}>
                        {v.year} {v.make} {v.model} {v.trim}
                      </div>
                      <div className={styles.vehicleOptionMeta}>
                        {(v.mileage || 0).toLocaleString()} mi · {(v.records || []).length} records
                        {urgent > 0 && <Badge color="coral" style={{ marginLeft: 6 }}>{urgent} due</Badge>}
                      </div>
                    </button>
                  )
                })}
                <button className={styles.addOption} onClick={() => setSheet('add')}>
                  <i className="ti ti-plus" /> Add vehicle
                </button>
              </>
            )}

            {sheet === 'add' && (
              <>
                <div className={styles.sheetTitle}>Add Vehicle</div>
                <p className={styles.sheetSub}>Scan or enter a VIN to add your vehicle</p>
                <VinLookup onAdd={handleAdd} onCancel={closeSheet} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
