import { useState } from 'react'
import { Btn } from './UI'
import styles from './VinLookup.module.css'

export default function VinLookup({ onAdd, onCancel }) {
  const [vin, setVin] = useState('')
  const [mileage, setMileage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function decode() {
    setError(''); setResult(null); setLoading(true)
    try {
      const r = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin.trim()}?format=json`)
      const d = await r.json()
      const v = d.Results?.[0]
      if (v?.Make && v.Make !== 'null') {
        setResult({
          vin: vin.trim().toUpperCase(),
          year: parseInt(v.ModelYear) || new Date().getFullYear(),
          make: v.Make,
          model: v.Model,
          trim: v.Trim || '',
          engine: [
            v.DisplacementL ? parseFloat(v.DisplacementL).toFixed(1) + 'L' : '',
            v.EngineCylinders ? v.EngineCylinders + '-cyl' : '',
            v.FuelTypePrimary ? `(${v.FuelTypePrimary})` : '',
          ].filter(Boolean).join(' '),
          transmission: v.TransmissionStyle || 'Automatic',
          bodyClass: v.BodyClass || '',
          driveType: v.DriveType || '',
        })
      } else {
        setError('VIN not found in NHTSA database. Please check the number.')
      }
    } catch {
      setError('Could not reach NHTSA — check your connection and try again.')
    }
    setLoading(false)
  }

  function handleAdd() {
    if (!result) return
    onAdd({ ...result, mileage: parseInt(mileage) || 0 })
  }

  return (
    <div>
      <div className={styles.inputRow}>
        <input
          value={vin}
          onChange={e => setVin(e.target.value.toUpperCase())}
          placeholder="17-character VIN"
          maxLength={17}
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
        />
        <Btn variant="primary" onClick={decode} disabled={loading || vin.length < 11}>
          {loading ? 'Decoding…' : <><i className="ti ti-search" /> Decode VIN</>}
        </Btn>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.result}>
          <div className={styles.vehicleTitle}>
            {result.year} {result.make} {result.model} {result.trim}
          </div>
          <div className={styles.specs}>
            {[['Engine', result.engine], ['Trans', result.transmission], ['Body', result.bodyClass], ['Drive', result.driveType]].filter(([,v]) => v).map(([k, v]) => (
              <div key={k} className={styles.spec}><span>{k}</span>{v}</div>
            ))}
          </div>
          <div className={styles.mileageRow}>
            <input
              type="number"
              value={mileage}
              onChange={e => setMileage(e.target.value)}
              placeholder="Current mileage"
              style={{ maxWidth: 200 }}
            />
            <Btn variant="primary" onClick={handleAdd}>
              <i className="ti ti-plus" /> Add to Garage
            </Btn>
            {onCancel && <Btn onClick={onCancel}>Cancel</Btn>}
          </div>
        </div>
      )}
    </div>
  )
}
