import { useState, useRef } from 'react'
import { Btn } from './UI'
import { callClaudeWithFile } from '../lib/claude'
import styles from './VinLookup.module.css'

const VIN_SYSTEM = 'You are a VIN extraction assistant. Find the 17-character Vehicle Identification Number in this image. It may appear on a dashboard plate, door jamb sticker, title, registration, or insurance card. Respond with ONLY the 17-character VIN in uppercase — no spaces, no punctuation, nothing else. If no VIN is clearly visible, respond with exactly: NOT_FOUND'

export default function VinLookup({ onAdd, onCancel }) {
  const [vin, setVin] = useState('')
  const [mileage, setMileage] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const photoRef = useRef(null)

  async function scanPhoto(file) {
    if (!file) return
    setScanning(true); setError(''); setResult(null)
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const extracted = await callClaudeWithFile(VIN_SYSTEM, 'Extract the VIN from this image.', base64, file.type)
      const cleaned = extracted.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
      if (cleaned.length === 17) {
        setVin(cleaned)
        setScanning(false)
        await decode(cleaned)
      } else {
        setError('No VIN found in that photo. Try a clearer shot or type it below.')
        setScanning(false)
      }
    } catch {
      setError('Photo scan failed. Please type the VIN manually.')
      setScanning(false)
    }
  }

  async function decode(vinOverride) {
    const target = (vinOverride || vin).trim()
    setError(''); setResult(null); setLoading(true)
    try {
      const r = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${target}?format=json`)
      const d = await r.json()
      const v = d.Results?.[0]
      if (v?.Make && v.Make !== 'null') {
        setResult({
          vin: target.toUpperCase(),
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
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => { scanPhoto(e.target.files[0]); e.target.value = '' }}
      />

      <Btn
        className={styles.scanBtn}
        onClick={() => photoRef.current?.click()}
        disabled={scanning || loading}
      >
        {scanning
          ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Extracting VIN…</>
          : <><i className="ti ti-camera" /> Scan from photo</>
        }
      </Btn>

      <div className={styles.divider}><span>or enter manually</span></div>

      <div className={styles.inputRow}>
        <input
          value={vin}
          onChange={e => setVin(e.target.value.toUpperCase())}
          placeholder="17-character VIN"
          maxLength={17}
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
        />
        <Btn variant="primary" onClick={() => decode()} disabled={loading || scanning || vin.length < 11}>
          {loading ? 'Decoding…' : <><i className="ti ti-search" /> Decode</>}
        </Btn>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.result}>
          <div className={styles.vehicleTitle}>
            {result.year} {result.make} {result.model} {result.trim}
          </div>
          <div className={styles.specs}>
            {[['Engine', result.engine], ['Trans', result.transmission], ['Body', result.bodyClass], ['Drive', result.driveType]].filter(([, v]) => v).map(([k, v]) => (
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
