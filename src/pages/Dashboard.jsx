import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useVehicles } from '../hooks/useVehicles'
import { Btn, Card, Badge, Spinner, EmptyState, SectionHeader } from '../components/UI'
import VinLookup from '../components/VinLookup'
import styles from './Dashboard.module.css'
import { callClaude, callClaudeWithFile } from '../lib/claude'
import { compressImage } from '../lib/image'
import MobileBar from '../components/MobileBar'
import VehicleSilhouette from '../components/VehicleSilhouette'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { ComposedChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TABS = ['Overview', 'Service History', 'Costs', 'Mileage', 'AI Advisor', 'Scan Receipt', 'Sell Vehicle']

const CAT_COLOR = { Maintenance: 'teal', Upgrade: 'purple', Insurance: 'amber' }

export default function Dashboard() {
  const { user } = useAuth()
  const { vehicles, loading, addVehicle, updateVehicle, deleteVehicle } = useVehicles(user?.uid)
  const [selectedId, setSelectedId] = useState(null)
  const [tab, setTab] = useState('Overview')
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const vehicle = vehicles.find(v => v.id === selectedId) || vehicles[0]

  async function handleShare() {
    if (!vehicle) return
    setSharing(true)
    try {
      let shareId = vehicle.shareId
      if (!shareId) {
        shareId = Math.random().toString(36).slice(2, 11)
        await setDoc(doc(db, 'publicShares', shareId), {
          shareId,
          year: vehicle.year, make: vehicle.make, model: vehicle.model, trim: vehicle.trim || '',
          engine: vehicle.engine || '', transmission: vehicle.transmission || '',
          bodyClass: vehicle.bodyClass || '', color: vehicle.color || '', vin: vehicle.vin || '',
          mileage: vehicle.mileage || 0, aiImageUrl: vehicle.aiImageUrl || null,
          records: vehicle.records || [], mods: vehicle.mods || [],
          sharedAt: Date.now(),
        })
        await updateVehicle(vehicle.id, { shareId })
      }
      const url = `${window.location.origin}/share/${shareId}`
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2500)
    } catch (err) {
      alert('Share failed: ' + err.message)
    }
    setSharing(false)
  }

  useEffect(() => {
    if (!selectedId && vehicles.length > 0) setSelectedId(vehicles[0].id)
  }, [vehicles, selectedId])

  async function handleAddVehicle(data) {
    await addVehicle(data)
    setShowAddVehicle(false)
  }

  if (loading) return <div className={styles.center}><Spinner /></div>

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>My Garage</span>
          <Btn size="sm" onClick={() => setShowAddVehicle(s => !s)}>
            <i className="ti ti-plus" /> Add
          </Btn>
        </div>

        {showAddVehicle && (
          <Card className={styles.addVehicleCard}>
            <p className={styles.sectionLabel}>Decode a VIN to add your vehicle</p>
            <VinLookup onAdd={handleAddVehicle} onCancel={() => setShowAddVehicle(false)} />
          </Card>
        )}

        {vehicles.length === 0 && !showAddVehicle && (
          <EmptyState icon="car" title="No vehicles yet" subtitle="Add your first vehicle to get started." />
        )}

        <div className={styles.vehicleList}>
          {vehicles.map(v => (
            <VehicleListItem
              key={v.id}
              vehicle={v}
              selected={v.id === (vehicle?.id)}
              onClick={() => { setSelectedId(v.id); setTab('Overview') }}
            />
          ))}
        </div>
      </aside>

      <MobileBar
        vehicles={vehicles}
        vehicle={vehicle}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        addVehicle={addVehicle}
        setTab={setTab}
      />

      {/* Main content */}
      <main className={styles.main}>
        {!vehicle ? (
          <div className={styles.center}>
            <EmptyState icon="car-garage" title="Select or add a vehicle" subtitle="Your vehicle details will appear here." />
          </div>
        ) : (
          <>
            {/* Vehicle header */}
            <div className={styles.vehicleHeader}>
              <div>
                <h1 className={styles.vehicleName}>{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</h1>
                <p className={styles.vehicleSub}>{vehicle.engine} · {vehicle.transmission} · {(vehicle.mileage || 0).toLocaleString()} mi</p>
              </div>
              <VehicleSilhouette bodyClass={vehicle.bodyClass} className={styles.headerSilhouette} />
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn size="sm" onClick={handleShare} disabled={sharing}>
                  {sharing ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Sharing…</> : shareCopied ? <><i className="ti ti-check" /> Copied!</> : <><i className="ti ti-share" /> Share</>}
                </Btn>
                <Btn variant="danger" size="sm" onClick={() => { if (confirm('Remove this vehicle?')) deleteVehicle(vehicle.id) }}>
                  <i className="ti ti-trash" /> Remove
                </Btn>
              </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabBar}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} className={`${styles.tab} ${tab === t ? styles.activeTab : ''}`}>{t}</button>
              ))}
            </div>

            {/* Tab content */}
            <div className={styles.tabContent}>
              {tab === 'Overview' && <OverviewTab vehicle={vehicle} updateVehicle={updateVehicle} />}
              {tab === 'Service History' && <ServiceHistoryTab vehicle={vehicle} updateVehicle={updateVehicle} />}
              {tab === 'Costs' && <CostsTab vehicle={vehicle} />}
              {tab === 'Mileage' && <MileageTab vehicle={vehicle} />}
              {tab === 'AI Advisor' && <AIAdvisorTab vehicle={vehicle} />}
              {tab === 'Scan Receipt' && <ScanReceiptTab vehicle={vehicle} updateVehicle={updateVehicle} />}
              {tab === 'Sell Vehicle' && <SellTab vehicle={vehicle} updateVehicle={updateVehicle} />}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function VehicleListItem({ vehicle, selected, onClick }) {
  const records = vehicle.records || []
  const reminders = vehicle.reminders || []
  const urgent = reminders.filter(r => r.priority === 'high').length
  return (
    <div className={`${styles.vehicleItem} ${selected ? styles.vehicleItemSelected : ''}`} onClick={onClick}>
      <div className={styles.vehicleItemTop}>
        <div className={styles.vehicleItemName}>{vehicle.year} {vehicle.make} {vehicle.model}</div>
        <VehicleSilhouette bodyClass={vehicle.bodyClass} className={styles.itemSilhouette} />
      </div>
      <div className={styles.vehicleItemMeta}>
        <span><i className="ti ti-road" /> {(vehicle.mileage || 0).toLocaleString()} mi</span>
        <span><i className="ti ti-tool" /> {records.length}</span>
        {urgent > 0 && <Badge color="coral">{urgent} due</Badge>}
      </div>
    </div>
  )
}

/* ── OVERVIEW TAB ─────────────────────────────────────────── */
function OverviewTab({ vehicle, updateVehicle }) {
  const records = vehicle.records || []
  const reminders = vehicle.reminders || []
  const total = records.reduce((s, r) => s + (r.cost || 0), 0)
  const verified = records.filter(r => r.verified).length

  const sortedRecords = [...records].filter(r => r.date).sort((a, b) => new Date(b.date) - new Date(a.date))
  const latestRecord = sortedRecords[0]
  const displayMileage = latestRecord?.mileage || vehicle.mileage || 0
  const mileageDate = latestRecord?.date || null

  const byService = {}
  records.forEach(r => { byService[r.service] = (byService[r.service] || 0) + r.cost })
  const spending = Object.entries(byService).sort((a, b) => b[1] - a[1])
  const maxSpend = Math.max(...spending.map(e => e[1]), 1)
  const barColors = ['#7F77DD','#1D9E75','#D85A30','#BA7517','#378ADD','#D4537E']

  const [editMileage, setEditMileage] = useState(false)
  const [mi, setMi] = useState(vehicle.mileage || 0)
  const [imgGenerating, setImgGenerating] = useState(false)
  const [imgError, setImgError] = useState('')
  const [imgBroken, setImgBroken] = useState(false)

  async function generateAiImage() {
    setImgGenerating(true); setImgError(''); setImgBroken(false)
    try {
      const colorStr = vehicle.color ? `${vehicle.color} ` : ''
      const trimStr = vehicle.trim ? ` ${vehicle.trim}` : ''
      const prompt = `Professional automotive photography, ${vehicle.year} ${colorStr}${vehicle.make} ${vehicle.model}${trimStr}, 3/4 front angle, white studio background, photorealistic, high detail`
      const seed = vehicle.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 99999
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1792&height=1024&nologo=true&seed=${seed}&model=flux`
      await updateVehicle(vehicle.id, { aiImageUrl: url })
    } catch (err) {
      setImgError(err.message)
    }
    setImgGenerating(false)
  }

  return (
    <div className={styles.overviewGrid}>
      <div className={styles.aiImageWrap}>
        {vehicle.aiImageUrl && !imgBroken ? (
          <>
            <img
              src={vehicle.aiImageUrl}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className={styles.aiCarImage}
              onError={() => setImgBroken(true)}
            />
            <Btn size="sm" className={styles.regenBtn} onClick={generateAiImage} disabled={imgGenerating}>
              {imgGenerating ? 'Generating…' : <><i className="ti ti-refresh" /> Regenerate</>}
            </Btn>
          </>
        ) : (
          <div className={styles.generateImageBox}>
            <Btn size="sm" variant="primary" onClick={generateAiImage} disabled={imgGenerating}>
              {imgGenerating
                ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Generating AI photo…</>
                : <><i className="ti ti-sparkles" /> Generate AI photo</>}
            </Btn>
            {imgBroken && <span className={styles.imgExpiredNote}>Previous image expired</span>}
            {imgError && <span className={styles.imgErrorNote}>{imgError}</span>}
          </div>
        )}
      </div>
      <div className={styles.statsRow}>
        {[
          { label: 'Mileage', value: displayMileage.toLocaleString() + ' mi', icon: 'road', sub: mileageDate },
          { label: 'Total spent', value: '$' + total.toFixed(0), icon: 'coin' },
          { label: 'Records', value: records.length, icon: 'file-text' },
          { label: 'Verified', value: verified, icon: 'circle-check' },
        ].map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statLabel}><i className={`ti ti-${s.icon}`} /> {s.label}</div>
            <div className={styles.statValue}>{s.value}</div>
            {s.sub && <div className={styles.statSub}>{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className={styles.overviewCols}>
        <Card>
          <SectionHeader title="Upcoming reminders" />
          {reminders.length === 0
            ? <p className={styles.muted}>No reminders set.</p>
            : reminders.slice(0, 4).map(r => (
              <div key={r.id} className={styles.reminderRow}>
                <div>
                  <div className={styles.reminderName}>{r.service}</div>
                  <div className={styles.muted} style={{fontSize:12}}>Due at {(r.dueMileage||0).toLocaleString()} mi · {r.dueDate}</div>
                </div>
                <Badge color={r.priority === 'high' ? 'coral' : r.priority === 'medium' ? 'amber' : 'teal'}>{r.priority}</Badge>
              </div>
            ))}
        </Card>

        <Card>
          <SectionHeader title="Spending by service" />
          {spending.length === 0
            ? <p className={styles.muted}>No records yet.</p>
            : spending.map(([svc, cost], i) => (
              <div key={svc} className={styles.barRow}>
                <div className={styles.barLabel}>
                  <span>{svc}</span><span>${cost.toFixed(0)}</span>
                </div>
                <div className={styles.barBg}>
                  <div className={styles.barFill} style={{ width: `${(cost/maxSpend)*100}%`, background: barColors[i % barColors.length] }} />
                </div>
              </div>
            ))
          }
          {spending.length > 0 && (
            <div className={styles.totalRow}>
              <span>Total</span><strong>${total.toFixed(2)}</strong>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <SectionHeader title="Update mileage" />
        {editMileage
          ? <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input type="number" value={mi} onChange={e => setMi(e.target.value)} style={{maxWidth:180}} />
              <Btn variant="primary" size="sm" onClick={() => { updateVehicle(vehicle.id, { mileage: parseInt(mi)||0 }); setEditMileage(false) }}>Save</Btn>
              <Btn size="sm" onClick={() => setEditMileage(false)}>Cancel</Btn>
            </div>
          : <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:15,fontWeight:500}}>{(vehicle.mileage||0).toLocaleString()} mi</span>
              <Btn size="sm" onClick={() => setEditMileage(true)}><i className="ti ti-edit" /> Update</Btn>
            </div>
        }
      </Card>
    </div>
  )
}

/* ── SERVICE HISTORY TAB ──────────────────────────────────── */
const BLANK_FORM = { service: '', shop: '', date: '', mileage: '', cost: '', notes: '', verified: false, category: 'Maintenance' }

function ServiceHistoryTab({ vehicle, updateVehicle }) {
  const records = [...(vehicle.records || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError] = useState('')
  const photoRef = useRef(null)

  async function scanReceipt(file) {
    if (!file) return
    setScanLoading(true); setScanError('')
    try {
      const base64 = await compressImage(file)
      const reply = await callClaudeWithFile(RECEIPT_SYSTEM, 'Extract all service data from this receipt.', base64, 'image/jpeg')
      const data = JSON.parse(reply.replace(/```json|```/g, '').trim())
      setForm({
        service: data.service || '',
        shop: data.shop || '',
        date: data.date || '',
        mileage: data.mileage ? String(data.mileage) : '',
        cost: data.total ? String(data.total) : '',
        notes: data.notes || '',
        verified: false,
        category: 'Maintenance',
      })
      setShowForm(true)
    } catch (err) {
      setScanError('Could not read receipt — fill in the details below.')
      setForm(BLANK_FORM)
      setShowForm(true)
    }
    setScanLoading(false)
  }

  function save() {
    const rec = { ...form, id: 'r' + Date.now(), cost: parseFloat(form.cost) || 0, mileage: parseInt(form.mileage) || 0 }
    updateVehicle(vehicle.id, { records: [...(vehicle.records || []), rec] })
    setForm(BLANK_FORM)
    setShowForm(false); setScanError('')
  }

  function remove(id) {
    updateVehicle(vehicle.id, { records: (vehicle.records || []).filter(r => r.id !== id) })
  }

  return (
    <div>
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { scanReceipt(e.target.files[0]); e.target.value = '' }}
      />
      <SectionHeader
        title={`${records.length} service records`}
        action={
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn size="sm" onClick={() => photoRef.current?.click()} disabled={scanLoading}>
              {scanLoading
                ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Scanning…</>
                : <><i className="ti ti-camera" /> Scan</>}
            </Btn>
            <Btn size="sm" variant="primary" onClick={() => { setShowForm(s => !s); setScanError('') }}>
              <i className="ti ti-plus" /> Add
            </Btn>
          </div>
        }
      />
      {scanError && (
        <p className={styles.scanError}>{scanError}</p>
      )}

      {showForm && (
        <Card className={styles.formCard}>
          <div className={styles.formGrid}>
            {[['service','Service type','text'],['shop','Shop / location','text'],['date','Date','date'],['mileage','Mileage','number'],['cost','Cost ($)','number']].map(([k,p,t]) => (
              <div key={k}>
                <label className={styles.label}>{p}</label>
                <input type={t} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} />
              </div>
            ))}
            <div style={{gridColumn:'1/-1'}}>
              <label className={styles.label}>Category</label>
              <div className={styles.catBtnRow}>
                {['Maintenance','Upgrade','Insurance'].map(cat => (
                  <button key={cat} type="button"
                    className={`${styles.catBtn} ${form.category === cat ? styles['catBtn-' + cat] : ''}`}
                    onClick={() => setForm(f => ({...f, category: cat}))}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div style={{gridColumn:'1/-1'}}>
              <label className={styles.label}>Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({...f,notes:e.target.value}))} />
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <input type="checkbox" id="verified" checked={form.verified} onChange={e => setForm(f => ({...f,verified:e.target.checked}))} style={{width:'auto'}} />
              <label htmlFor="verified" style={{fontSize:13}}>Shop-verified record</label>
            </div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <Btn variant="primary" size="sm" onClick={save} disabled={!form.service || !form.date}>Save record</Btn>
            <Btn size="sm" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {records.length === 0 && !showForm
        ? <EmptyState icon="file-off" title="No records yet" subtitle="Add records manually or use the Receipt Scanner." />
        : records.map(r => (
          <div key={r.id} className={styles.recordRow}>
            <div className={styles.recordLeft}>
              <div className={styles.recordService}>{r.service}</div>
              <div className={styles.recordMeta}>
                {r.date && <span>{r.date}</span>}
                {r.shop && <span>{r.shop}</span>}
                {r.mileage > 0 && <span>{r.mileage.toLocaleString()} mi</span>}
                <Badge color={CAT_COLOR[r.category] || 'teal'}>{r.category || 'Maintenance'}</Badge>
                <Badge color={r.verified ? 'teal' : 'gray'}>{r.verified ? '✓ Verified' : 'DIY'}</Badge>
              </div>
              {r.notes && <div className={styles.recordNotes}>{r.notes}</div>}
            </div>
            <div className={styles.recordRight}>
              <span className={styles.recordCost}>${(r.cost||0).toFixed(2)}</span>
              <button className={styles.removeBtn} onClick={() => remove(r.id)} title="Remove"><i className="ti ti-x" /></button>
            </div>
          </div>
        ))
      }
    </div>
  )
}

/* ── COSTS TAB ────────────────────────────────────────────── */
const CATS = ['Maintenance', 'Upgrade', 'Insurance']

function CostsTab({ vehicle }) {
  const records = vehicle.records || []

  if (records.length === 0) {
    return <EmptyState icon="coin" title="No cost records" subtitle="Add service records with costs to see the breakdown." />
  }

  function catMatch(r, cat) {
    return cat === 'Maintenance' ? (!r.category || r.category === 'Maintenance') : r.category === cat
  }
  function sumWhere(fn) {
    return records.filter(fn).reduce((s, r) => s + (r.cost || 0), 0)
  }

  const years = [...new Set(
    records.filter(r => r.date).map(r => new Date(r.date).getFullYear())
  )].sort((a, b) => b - a)

  const catTotals = CATS.map(cat => sumWhere(r => catMatch(r, cat)))
  const grandTotal = catTotals[0] + catTotals[1]

  return (
    <div className={styles.costsWrap}>
      <table className={styles.pivotTable}>
        <thead>
          <tr>
            <th className={styles.pivotCorner} />
            {CATS.map((cat, i) => (
              <th key={cat} className={styles.pivotTh}>
                <Badge color={CAT_COLOR[cat]}>{cat}</Badge>
                <div className={styles.pivotThTotal}>${catTotals[i].toFixed(0)}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map(year => (
            <tr key={year} className={styles.pivotBodyRow}>
              <td className={styles.pivotYearCell}>{year}</td>
              {CATS.map(cat => {
                const val = sumWhere(r => catMatch(r, cat) && r.date && new Date(r.date).getFullYear() === year)
                return (
                  <td key={cat} className={`${styles.pivotTd} ${val === 0 ? styles.pivotTdEmpty : ''}`}>
                    {val > 0 ? `$${val.toFixed(0)}` : '—'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.grandTotalRow}>
        <div>
          <div className={styles.grandTotalLabel}>Grand Total</div>
          <div className={styles.grandTotalSub}>Maintenance + Upgrades · Insurance excluded</div>
        </div>
        <div className={styles.grandTotalValue}>${grandTotal.toFixed(2)}</div>
      </div>
    </div>
  )
}

/* ── MILEAGE TAB ──────────────────────────────────────────── */
function buildMileageData(knownPoints) {
  const today = new Date()
  const last = knownPoints[knownPoints.length - 1]
  const secondLast = knownPoints[knownPoints.length - 2]
  const extrapolationRatePerDay = (last.mileage - secondLast.mileage) /
    Math.max(1, (last.date - secondLast.date) / 86400000)

  function mileageAt(date) {
    if (date <= knownPoints[0].date) return knownPoints[0].mileage
    if (date >= last.date) {
      return Math.round(last.mileage + extrapolationRatePerDay * (date - last.date) / 86400000)
    }
    for (let i = 0; i < knownPoints.length - 1; i++) {
      if (date >= knownPoints[i].date && date <= knownPoints[i + 1].date) {
        const t = (date - knownPoints[i].date) / (knownPoints[i + 1].date - knownPoints[i].date)
        return Math.round(knownPoints[i].mileage + t * (knownPoints[i + 1].mileage - knownPoints[i].mileage))
      }
    }
    return last.mileage
  }

  const rows = []
  const cursor = new Date(knownPoints[0].date.getFullYear(), knownPoints[0].date.getMonth(), 1)
  const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  while (cursor < endMonth) {
    const mid = new Date(cursor.getFullYear(), cursor.getMonth(), 15)
    const estimated = mid > last.date
    const known = knownPoints.some(p =>
      p.date.getFullYear() === cursor.getFullYear() && p.date.getMonth() === cursor.getMonth()
    )
    rows.push({
      month: cursor.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      mileage: mileageAt(mid),
      estimated,
      known,
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return { rows, mileageAt }
}

function MileageTab({ vehicle }) {
  const records = vehicle.records || []
  const knownPoints = records
    .filter(r => r.date && r.mileage > 0)
    .map(r => ({ date: new Date(r.date + 'T12:00:00'), mileage: r.mileage }))
    .sort((a, b) => a.date - b.date)

  if (knownPoints.length < 2) {
    return (
      <EmptyState
        icon="road"
        title="Not enough mileage data"
        subtitle="Add at least 2 service records with both a date and mileage to see charts."
      />
    )
  }

  const { rows, mileageAt } = buildMileageData(knownPoints)
  const today = new Date()
  const currentMileage = mileageAt(today)
  const firstMileage = knownPoints[0].mileage
  const totalMiles = currentMileage - firstMileage
  const totalMonths = Math.max(1, (today - knownPoints[0].date) / (86400000 * 30.44))
  const avgPerMonth = Math.round(totalMiles / totalMonths)
  const avgPerYear = Math.round(avgPerMonth * 12)

  // Last known month index (for solid/dashed split)
  const lastKnownIdx = rows.reduce((li, p, i) => p.known ? i : li, 0)
  const lineData = rows.map((p, i) => ({
    ...p,
    solidMileage: i <= lastKnownIdx ? p.mileage : null,
    dashedMileage: i >= lastKnownIdx ? p.mileage : null,
  }))

  // Miles per month bar data
  const barData = rows.slice(1).map((p, i) => ({
    ...p,
    miles: Math.max(0, p.mileage - rows[i].mileage),
  }))

  // Reduce x-axis labels when many months
  const tickInterval = rows.length > 36 ? 5 : rows.length > 18 ? 2 : 1

  const chartTooltipStyle = { fontSize: 12, borderRadius: 6, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }

  return (
    <div className={styles.overviewGrid}>
      <div className={styles.statsRow}>
        {[
          { label: 'Est. current mileage', value: currentMileage.toLocaleString() + ' mi', icon: 'road' },
          { label: 'Avg / month', value: avgPerMonth.toLocaleString() + ' mi', icon: 'calendar' },
          { label: 'Avg / year', value: avgPerYear.toLocaleString() + ' mi', icon: 'chart-bar' },
          { label: 'Total tracked miles', value: totalMiles.toLocaleString() + ' mi', icon: 'flag' },
        ].map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statLabel}><i className={`ti ti-${s.icon}`} /> {s.label}</div>
            <div className={styles.statValue}>{s.value}</div>
          </div>
        ))}
      </div>

      <Card>
        <SectionHeader title="Mileage over time" />
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={lineData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={tickInterval - 1} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => (v / 1000).toFixed(0) + 'k'} width={36} />
            <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => v != null ? v.toLocaleString() + ' mi' : null} labelStyle={{ fontWeight: 600 }} />
            <Line
              dataKey="solidMileage" name="Recorded" stroke="#534AB7" strokeWidth={2}
              connectNulls dot={(props) => {
                if (!props.payload.known) return <g key={props.index} />
                return <circle key={props.index} cx={props.cx} cy={props.cy} r={5} fill="#534AB7" stroke="#fff" strokeWidth={2} />
              }}
            />
            <Line
              dataKey="dashedMileage" name="Estimated" stroke="#534AB7" strokeWidth={2}
              strokeDasharray="6 4" opacity={0.45} dot={false} connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className={styles.chartLegend}>
          <span><span className={styles.legendDot} />Known data point</span>
          <span><span className={styles.legendLine} />Recorded</span>
          <span><span className={styles.legendDashed} />Estimated</span>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Miles per month" />
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={tickInterval - 1} />
            <YAxis tick={{ fontSize: 10 }} width={36} />
            <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => v.toLocaleString() + ' mi'} labelStyle={{ fontWeight: 600 }} />
            <Bar dataKey="miles" name="Miles" maxBarSize={32}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.estimated ? '#B3B0E8' : '#534AB7'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className={styles.chartLegend}>
          <span><span className={styles.legendBar} style={{ background: '#534AB7' }} />Recorded</span>
          <span><span className={styles.legendBar} style={{ background: '#B3B0E8' }} />Estimated</span>
        </div>
      </Card>
    </div>
  )
}

/* ── AI ADVISOR TAB ───────────────────────────────────────── */
function AIAdvisorTab({ vehicle }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const systemPrompt = `You are a knowledgeable, friendly vehicle maintenance advisor. The user has a ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} with ${vehicle.engine} engine, ${(vehicle.mileage||0).toLocaleString()} miles. Service history: ${(vehicle.records||[]).map(r=>`${r.service} at ${r.mileage?.toLocaleString()||'?'} mi on ${r.date}`).join('; ') || 'none yet'}. Upcoming reminders: ${(vehicle.reminders||[]).map(r=>`${r.service} due at ${(r.dueMileage||0).toLocaleString()} mi`).join('; ') || 'none'}. Give concise, practical advice. Keep answers under 200 words.`

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)
    const reply = await callClaude(systemPrompt, userMsg)
    setMessages(m => [...m, { role: 'assistant', text: reply }])
    setLoading(false)
  }

  const suggestions = [
    'What maintenance is due soon?',
    'Is my mileage normal for this car?',
    'How much should I expect to spend on repairs?',
    'What should I watch out for on this vehicle?',
  ]

  return (
    <div className={styles.chatWrap}>
      <div className={styles.chatMessages}>
        {messages.length === 0 && (
          <div className={styles.chatEmpty}>
            <i className="ti ti-robot" style={{fontSize:32,color:'var(--purple-mid)'}} />
            <p>Ask anything about your {vehicle.year} {vehicle.make} {vehicle.model}</p>
            <div className={styles.suggestions}>
              {suggestions.map(s => (
                <button key={s} className={styles.suggestionBtn} onClick={() => setInput(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleAI}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className={`${styles.bubble} ${styles.bubbleAI} ${styles.bubbleLoading}`}>Thinking…</div>}
        <div ref={endRef} />
      </div>
      <div className={styles.chatInput}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&send()} placeholder="Ask about maintenance, costs, repairs…" />
        <Btn variant="primary" onClick={send} disabled={loading || !input.trim()}><i className="ti ti-send" /></Btn>
      </div>
    </div>
  )
}

/* ── SCAN RECEIPT TAB ─────────────────────────────────────── */
const RECEIPT_SYSTEM = 'You are a service receipt parser. Extract structured data from the receipt and respond ONLY with valid JSON (no markdown, no extra text): {"shop":"","date":"YYYY-MM-DD","service":"","parts":"","labor":0,"total":0,"mileage":0,"notes":""}'

function ScanReceiptTab({ vehicle, updateVehicle }) {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef(null)

  function resetScanner() {
    setFile(null); setText(''); setResult(null); setSaved(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']

  async function loadFile(f) {
    if (!f) return
    if (!ALLOWED.includes(f.type)) {
      alert('Please upload a PDF or image file (JPEG, PNG, WebP)')
      return
    }
    try {
      if (f.type === 'application/pdf') {
        const reader = new FileReader()
        reader.onload = e => {
          setFile({ name: f.name, base64: e.target.result.split(',')[1], mediaType: f.type })
          setResult(null); setSaved(false)
        }
        reader.readAsDataURL(f)
      } else {
        const base64 = await compressImage(f)
        setFile({ name: f.name, base64, mediaType: 'image/jpeg' })
        setResult(null); setSaved(false)
      }
    } catch {
      alert('Could not load file. Please try again.')
    }
  }

  function clearFile(e) {
    e.stopPropagation()
    setFile(null); setResult(null); setSaved(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function onDrop(e) {
    e.preventDefault(); setDragOver(false)
    loadFile(e.dataTransfer.files[0])
  }

  async function analyze() {
    setLoading(true); setResult(null); setSaved(false)
    try {
      let reply
      if (file) {
        reply = await callClaudeWithFile(RECEIPT_SYSTEM, 'Extract all service data from this receipt.', file.base64, file.mediaType)
      } else {
        reply = await callClaude(RECEIPT_SYSTEM, text)
      }
      setResult(JSON.parse(reply.replace(/```json|```/g, '').trim()))
    } catch {
      setResult({ error: 'Could not parse — try a clearer image or paste the text instead.' })
    }
    setLoading(false)
  }

  function saveRecord() {
    if (!result || result.error) return
    const rec = {
      id: 'r' + Date.now(), date: result.date || '', shop: result.shop || '',
      service: result.service || 'Service', cost: parseFloat(result.total) || 0,
      mileage: parseInt(result.mileage) || vehicle.mileage || 0,
      notes: result.notes || '', verified: false,
    }
    updateVehicle(vehicle.id, { records: [...(vehicle.records || []), rec] })
    setSaved(true)
  }

  return (
    <div>
      <SectionHeader title="AI receipt scanner" />
      <p className={styles.muted} style={{ marginBottom: '1rem' }}>
        Upload a photo or PDF of any service receipt — AI extracts all the details automatically.
      </p>

      <div
        className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''} ${file ? styles.dropZoneHasFile : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          style={{ display: 'none' }}
          onChange={e => loadFile(e.target.files[0])}
        />
        {file ? (
          <div className={styles.fileInfo}>
            <i className="ti ti-file-check" style={{ color: 'var(--teal)', fontSize: 20 }} />
            <span>{file.name}</span>
            <button className={styles.removeBtn} onClick={clearFile}><i className="ti ti-x" /></button>
          </div>
        ) : (
          <div className={styles.dropZoneContent}>
            <i className="ti ti-cloud-upload" style={{ fontSize: 28, color: 'var(--purple-mid)' }} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Drop a receipt here</div>
              <div className={styles.muted} style={{ fontSize: 12, marginTop: 2 }}>
                or click to browse — PDF, JPEG, PNG, WebP
              </div>
            </div>
          </div>
        )}
      </div>

      {!file && (
        <div style={{ marginTop: '1rem' }}>
          <label className={styles.label} style={{ marginBottom: 6 }}>Or paste receipt text</label>
          <textarea
            rows={4}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. Jiffy Lube - Oil Change $67.99, Total: $85.99, Mileage: 34,500, Date: Nov 15 2024"
          />
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <Btn variant="primary" onClick={analyze} disabled={loading || (!file && !text.trim())}>
          {loading ? 'Analyzing…' : <><i className="ti ti-sparkles" /> Analyze Receipt</>}
        </Btn>
      </div>

      {result && !result.error && (
        <Card className={styles.receiptResult}>
          <div className={styles.formGrid}>
            {[
              ['Shop', result.shop], ['Date', result.date], ['Service', result.service],
              ['Total', result.total ? '$' + result.total : ''], ['Mileage', result.mileage ? result.mileage.toLocaleString() + ' mi' : ''], ['Notes', result.notes],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k}><span className={styles.label}>{k}</span><div style={{ fontSize: 14 }}>{v}</div></div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {saved
              ? <Badge color="teal">✓ Saved to service history</Badge>
              : <Btn variant="primary" size="sm" onClick={saveRecord}>
                  <i className="ti ti-plus" /> Add to service history
                </Btn>
            }
            <Btn size="sm" onClick={resetScanner}>
              <i className="ti ti-refresh" /> Analyze another
            </Btn>
          </div>
        </Card>
      )}
      {result?.error && <p style={{ color: '#993C1D', fontSize: 13, marginTop: 10 }}>{result.error}</p>}
    </div>
  )
}

/* ── SELL VEHICLE TAB ─────────────────────────────────────── */
function SellTab({ vehicle }) {
  const [listing, setListing] = useState('')
  const [loading, setLoading] = useState(false)
  const records = vehicle.records || []

  async function generate() {
    setLoading(true); setListing('')
    const history = records.map(r => `${r.date}: ${r.service} at ${(r.mileage||0).toLocaleString()} mi ($${r.cost}) ${r.verified ? '(verified)' : '(DIY)'}`).join('\n') || 'No service records'
    const listing = await callClaude(
      'You are an expert car listing copywriter for private sellers. Write a compelling, honest, detailed vehicle listing that highlights the maintenance history and condition. Use a friendly, trustworthy tone. Keep it under 250 words.',
      `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}\nEngine: ${vehicle.engine}\nTransmission: ${vehicle.transmission}\nMileage: ${(vehicle.mileage||0).toLocaleString()}\nColor: ${vehicle.color || 'unspecified'}\nMods: ${(vehicle.mods||[]).join(', ') || 'Stock'}\n\nService History:\n${history}`
    )
    setListing(listing)
    setLoading(false)
  }

  const totalSpent = records.reduce((s, r) => s + (r.cost || 0), 0)
  const verified = records.filter(r => r.verified).length

  return (
    <div>
      <SectionHeader title="Prepare your vehicle for sale" />
      <div className={styles.sellStats}>
        {[
          ['Total records', records.length, 'file-text'],
          ['Verified records', verified, 'circle-check'],
          ['Total maintenance spent', '$' + totalSpent.toFixed(0), 'coin'],
          ['Modifications', (vehicle.mods||[]).length, 'bolt'],
        ].map(([label, value, icon]) => (
          <div key={label} className={styles.statCard}>
            <div className={styles.statLabel}><i className={`ti ti-${icon}`} /> {label}</div>
            <div className={styles.statValue}>{value}</div>
          </div>
        ))}
      </div>
      <Btn variant="primary" onClick={generate} disabled={loading}>
        {loading ? 'Generating listing…' : <><i className="ti ti-sparkles" /> Generate Vehicle Listing</>}
      </Btn>
      {listing && (
        <Card className={styles.listingCard}>
          <div className={styles.listingText}>{listing}</div>
          <Btn size="sm" onClick={() => navigator.clipboard.writeText(listing)} style={{marginTop:12}}>
            <i className="ti ti-copy" /> Copy listing
          </Btn>
        </Card>
      )}
    </div>
  )
}
