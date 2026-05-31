import { useState, useRef, useEffect } from 'react'

function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}
import { useAuth } from '../hooks/useAuth'
import { useVehicles } from '../hooks/useVehicles'
import { Btn, Card, Badge, Spinner, EmptyState, SectionHeader } from '../components/UI'
import VinLookup from '../components/VinLookup'
import styles from './Dashboard.module.css'
import { callClaude, callClaudeWithFile } from '../lib/claude'
import { compressImage } from '../lib/image'
import MobileBar from '../components/MobileBar'
import { getVehicleSilhouette } from '../vehicle-silhouettes'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { ComposedChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TABS = ['Overview', 'Service History', 'Costs', 'Mileage', 'Recalls', 'AI Advisor', 'Sell Vehicle']

const CAT_COLOR = { Maintenance: 'teal', Upgrade: 'purple', Insurance: 'amber' }

function VehicleImage({ bodyClass, height = 180, width = '100%', style = {} }) {
  return (
    <div
      style={{ background: '#1e293b', borderRadius: 10, height, width, overflow: 'hidden', flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: getVehicleSilhouette(bodyClass) }}
    />
  )
}

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

        <div className={styles.sidebarFooter}>
          <a href="/privacy">Privacy</a>
          <span>·</span>
          <a href="/tos">Terms</a>
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
              <div className={styles.vehicleHeaderLeft}>
                <VehicleImage bodyClass={vehicle.bodyClass} height={72} width={130} style={{ flexShrink: 0 }} />
                <div className={styles.vehicleHeaderInfo}>
                  <h1 className={styles.vehicleName}>{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</h1>
                  <p className={styles.vehicleSub}>{vehicle.engine} · {vehicle.transmission}</p>
                </div>
              </div>
              <div className={styles.vehicleHeaderActions}>
                <Btn size="sm" onClick={handleShare} disabled={sharing}>
                  {sharing ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Sharing…</> : shareCopied ? <><i className="ti ti-check" /> Copied!</> : <><i className="ti ti-share" /> Share</>}
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
              {tab === 'Overview' && <OverviewTab vehicle={vehicle} updateVehicle={updateVehicle} deleteVehicle={deleteVehicle} />}
              {tab === 'Service History' && <ServiceHistoryTab vehicle={vehicle} updateVehicle={updateVehicle} />}
              {tab === 'Costs' && <CostsTab vehicle={vehicle} />}
              {tab === 'Mileage' && <MileageTab vehicle={vehicle} />}
              {tab === 'Recalls' && <RecallsTab vehicle={vehicle} />}
              {tab === 'AI Advisor' && <AIAdvisorTab vehicle={vehicle} />}

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
  const latestMileage = [...records]
    .filter(r => r.date && r.mileage > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.mileage || vehicle.mileage || 0
  const mileageLabel = Math.round(latestMileage / 1000) + 'k'
  return (
    <div className={`${styles.vehicleItem} ${selected ? styles.vehicleItemSelected : ''}`} onClick={onClick}>
      <div className={styles.vehicleItemTop}>
        <div className={styles.vehicleItemName}>{vehicle.year} {vehicle.make} {vehicle.model}</div>
        <VehicleImage bodyClass={vehicle.bodyClass} height={36} width={64} style={{ borderRadius: 6 }} />
      </div>
      <div className={styles.vehicleItemMeta}>
        <span><i className="ti ti-road" /> {mileageLabel}</span>
        <span><i className="ti ti-tool" /> {records.length}</span>
        {urgent > 0 && <Badge color="coral">{urgent} due</Badge>}
      </div>
    </div>
  )
}

/* ── OVERVIEW TAB ─────────────────────────────────────────── */
function OverviewTab({ vehicle, updateVehicle, deleteVehicle }) {
  const records = vehicle.records || []
  const reminders = vehicle.reminders || []
  const total = records.reduce((s, r) => s + (r.cost || 0), 0)
  const verified = records.filter(r => r.verified).length

  const sortedRecords = [...records].filter(r => r.date).sort((a, b) => new Date(b.date) - new Date(a.date))
  const latestRecord = sortedRecords[0]
  const displayMileage = latestRecord?.mileage || vehicle.mileage || 0
  const mileageDate = latestRecord?.date || null

  const catSpend = [
    { label: 'Maintenance', color: '#1D9E75', total: records.filter(r => !r.category || r.category === 'Maintenance').reduce((s, r) => s + (r.cost || 0), 0) },
    { label: 'Upgrade',     color: '#534AB7', total: records.filter(r => r.category === 'Upgrade').reduce((s, r) => s + (r.cost || 0), 0) },
    { label: 'Insurance',   color: '#BA7517', total: records.filter(r => r.category === 'Insurance').reduce((s, r) => s + (r.cost || 0), 0) },
  ].sort((a, b) => b.total - a.total)
  const maxCatSpend = Math.max(...catSpend.map(c => c.total), 1)

  return (
    <div className={styles.overviewGrid}>
      <VehicleImage bodyClass={vehicle.bodyClass} height={180} />
      <div className={styles.statsRow}>
        {[
          { label: 'Mileage', value: displayMileage.toLocaleString() + ' mi', icon: 'road', sub: mileageDate },
          { label: 'Total spent', value: '$' + Math.round(total).toLocaleString(), icon: 'coin' },
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
          <SectionHeader title="Spending by category" />
          {records.length === 0
            ? <p className={styles.muted}>No records yet.</p>
            : catSpend.map(({ label, color, total: catTotal }) => (
              <div key={label} className={styles.barRow}>
                <div className={styles.barLabel}>
                  <span>{label}</span><span>${Math.round(catTotal).toLocaleString()}</span>
                </div>
                <div className={styles.barBg}>
                  <div className={styles.barFill} style={{ width: `${(catTotal / maxCatSpend) * 100}%`, background: color }} />
                </div>
              </div>
            ))
          }
          {records.length > 0 && (
            <div className={styles.totalRow}>
              <span>Total</span><strong>${Math.round(total).toLocaleString()}</strong>
            </div>
          )}
        </Card>
      </div>

      <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
        <button className={styles.removeVehicleLink} onClick={() => { if (confirm('Remove this vehicle?')) deleteVehicle(vehicle.id) }}>
          Remove vehicle
        </button>
      </div>

    </div>
  )
}

/* ── SERVICE HISTORY TAB ──────────────────────────────────── */
const BLANK_FORM = { service: '', shop: '', date: '', mileage: '', cost: '', notes: '', verified: false, category: 'Maintenance' }
const RECEIPT_SYSTEM = 'You are a service receipt parser. Extract structured data from the receipt and respond ONLY with valid JSON (no markdown, no extra text): {"shop":"","date":"YYYY-MM-DD","service":"","parts":"","labor":0,"total":0,"mileage":0,"notes":""}'

function ServiceHistoryTab({ vehicle, updateVehicle }) {
  const allRecords = vehicle.records || []
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError] = useState('')
  const [editingCatId, setEditingCatId] = useState(null)
  const [filterCat, setFilterCat] = useState('All')
  const [filterYear, setFilterYear] = useState('All')
  const [sortBy, setSortBy] = useState('date-desc')
  const photoRef = useRef(null)

  const years = [...new Set(allRecords.filter(r => r.date).map(r => new Date(r.date).getFullYear()))].sort((a, b) => b - a)

  let records = [...allRecords]
  if (filterCat !== 'All') records = records.filter(r => (r.category || 'Maintenance') === filterCat)
  if (filterYear !== 'All') records = records.filter(r => r.date && new Date(r.date).getFullYear() === Number(filterYear))
  if (sortBy === 'date-desc') records.sort((a, b) => new Date(b.date) - new Date(a.date))
  else if (sortBy === 'date-asc') records.sort((a, b) => new Date(a.date) - new Date(b.date))
  else if (sortBy === 'cost-desc') records.sort((a, b) => (b.cost || 0) - (a.cost || 0))
  else if (sortBy === 'cost-asc') records.sort((a, b) => (a.cost || 0) - (b.cost || 0))

  function updateCategory(recordId, newCategory) {
    const updated = (vehicle.records || []).map(r =>
      r.id === recordId ? { ...r, category: newCategory } : r
    )
    updateVehicle(vehicle.id, { records: updated })
    setEditingCatId(null)
  }

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
        title={`${records.length}${records.length !== allRecords.length ? ` of ${allRecords.length}` : ''} service records`}
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
      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.catBtnRow}>
          {['All', 'Maintenance', 'Upgrade', 'Insurance'].map(c => (
            <button key={c} type="button"
              className={`${styles.catBtn} ${filterCat === c ? (c === 'All' ? styles.catBtnAll : styles['catBtn-' + c]) : ''}`}
              onClick={() => setFilterCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className={styles.filterRight}>
          {years.length > 1 && (
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className={styles.filterSelect}>
              <option value="All">All years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={styles.filterSelect}>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="cost-desc">Highest cost</option>
            <option value="cost-asc">Lowest cost</option>
          </select>
        </div>
      </div>

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
                {editingCatId !== r.id && (
                  <button className={styles.catBadgeBtn} onClick={() => setEditingCatId(r.id)} title="Edit category">
                    <Badge color={CAT_COLOR[r.category] || 'teal'}>{r.category || 'Maintenance'}</Badge>
                  </button>
                )}
                {r.verified && <Badge color="teal">✓ Verified</Badge>}
              </div>
              {editingCatId === r.id && (
                <div className={styles.inlineCatPicker}>
                  {['Maintenance', 'Upgrade', 'Insurance'].map(cat => (
                    <button key={cat} type="button"
                      className={`${styles.catBtn} ${(r.category || 'Maintenance') === cat ? styles['catBtn-' + cat] : ''}`}
                      onClick={() => updateCategory(r.id, cat)}>
                      {cat}
                    </button>
                  ))}
                  <button className={styles.removeBtn} onClick={() => setEditingCatId(null)} title="Cancel">
                    <i className="ti ti-x" />
                  </button>
                </div>
              )}
              {r.notes && <div className={styles.recordNotes}>{r.notes}</div>}
            </div>
            <div className={styles.recordRight}>
              <span className={styles.recordCost}>${(r.cost||0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
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
  const [selectedCell, setSelectedCell] = useState(null)

  if (records.length === 0) {
    return <EmptyState icon="coin" title="No cost records" subtitle="Add service records with costs to see the breakdown." />
  }

  function catMatch(r, cat) {
    return cat === 'Maintenance' ? (!r.category || r.category === 'Maintenance') : r.category === cat
  }
  function sumWhere(fn) {
    return records.filter(fn).reduce((s, r) => s + (r.cost || 0), 0)
  }
  function fmt(n) { return '$' + Math.round(n).toLocaleString() }

  const years = [...new Set(
    records.filter(r => r.date).map(r => new Date(r.date).getFullYear())
  )].sort((a, b) => b - a)

  const catTotals = CATS.map(cat => sumWhere(r => catMatch(r, cat)))
  const grandTotal = catTotals[0] + catTotals[1]

  const detailRecords = selectedCell
    ? records
        .filter(r => catMatch(r, selectedCell.cat) && r.date && new Date(r.date).getFullYear() === selectedCell.year)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : []

  return (
    <div className={styles.costsWrap}>
      <table className={styles.pivotTable}>
        <thead>
          <tr>
            <th className={styles.pivotCorner} />
            {CATS.map((cat, i) => (
              <th key={cat} className={styles.pivotTh}>
                <Badge color={CAT_COLOR[cat]}>{cat}</Badge>
                <div className={styles.pivotThTotal}>{fmt(catTotals[i])}</div>
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
                const active = selectedCell?.year === year && selectedCell?.cat === cat
                return (
                  <td
                    key={cat}
                    className={`${styles.pivotTd} ${val === 0 ? styles.pivotTdEmpty : styles.pivotTdClickable} ${active ? styles.pivotTdActive : ''}`}
                    onClick={() => val > 0 && setSelectedCell(active ? null : { year, cat })}
                  >
                    {val > 0 ? fmt(val) : '—'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCell ? (
        <div className={styles.cellDetail}>
          <div className={styles.cellDetailHeader}>
            <span><Badge color={CAT_COLOR[selectedCell.cat]}>{selectedCell.cat}</Badge>&nbsp;{selectedCell.year}</span>
            <button className={styles.removeBtn} onClick={() => setSelectedCell(null)}><i className="ti ti-x" /></button>
          </div>
          <table className={styles.detailTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Summary</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {detailRecords.map(r => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.service}</td>
                  <td>{fmt(r.cost || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.grandTotalRow}>
          <div>
            <div className={styles.grandTotalLabel}>Grand Total</div>
            <div className={styles.grandTotalSub}>Maintenance + Upgrades · Insurance excluded</div>
          </div>
          <div className={styles.grandTotalValue}>{fmt(grandTotal)}</div>
        </div>
      )}
    </div>
  )
}

/* ── MILEAGE TAB ──────────────────────────────────────────── */
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

  // Extrapolate current mileage (stat cards only — not charted)
  const today = new Date()
  const last = knownPoints[knownPoints.length - 1]
  const secondLast = knownPoints[knownPoints.length - 2]
  const ratePerDay = (last.mileage - secondLast.mileage) /
    Math.max(1, (last.date - secondLast.date) / 86400000)
  const currentMileage = Math.round(last.mileage + ratePerDay * Math.max(0, (today - last.date) / 86400000))
  const firstMileage = knownPoints[0].mileage
  const totalMiles = currentMileage - firstMileage
  const totalMonths = Math.max(1, (today - knownPoints[0].date) / (86400000 * 30.44))
  const avgPerMonth = Math.round(totalMiles / totalMonths)
  const avgPerYear = Math.round(avgPerMonth * 12)

  function fmtDate(d) {
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  // Line chart: one point per actual odometer reading
  const lineData = knownPoints.map(p => ({ label: fmtDate(p.date), mileage: p.mileage }))

  // Driving pace: one bar per interval between consecutive readings
  // inferred = gap > 2 months (interpolated average, not a single measured rate)
  const paceData = knownPoints.slice(1).map((p, i) => {
    const prev = knownPoints[i]
    const monthsBetween = (p.date - prev.date) / (86400000 * 30.44)
    const milesPerMonth = Math.round((p.mileage - prev.mileage) / Math.max(0.5, monthsBetween))
    return {
      label: `${fmtDate(prev.date)}–${fmtDate(p.date)}`,
      milesPerMonth,
      inferred: monthsBetween > 2,
    }
  })

  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 600

  const lineXAxisProps = isMobile
    ? { tick: { fontSize: 10 }, interval: 0, angle: -45, textAnchor: 'end', height: 52 }
    : { tick: { fontSize: 10 }, interval: 0 }

  const paceXAxisProps = isMobile
    ? { tick: { fontSize: 10 }, interval: 0, angle: -45, textAnchor: 'end', height: 52 }
    : { tick: { fontSize: 11 }, interval: 0 }

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
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 220}>
          <ComposedChart data={lineData} margin={{ top: 4, right: 8, bottom: isMobile ? 16 : 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" {...lineXAxisProps} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => (v / 1000).toFixed(0) + 'k'} width={36} />
            <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => v != null ? v.toLocaleString() + ' mi' : null} labelStyle={{ fontWeight: 600 }} />
            <Line
              dataKey="mileage" name="Odometer reading" stroke="#534AB7" strokeWidth={2}
              dot={{ r: 5, fill: '#534AB7', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className={styles.chartLegend}>
          <span><span className={styles.legendDot} />Odometer reading</span>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Driving pace" />
        <ResponsiveContainer width="100%" height={isMobile ? 210 : 180}>
          <BarChart data={paceData} margin={{ top: 4, right: 8, bottom: isMobile ? 16 : 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" {...paceXAxisProps} />
            <YAxis tick={{ fontSize: 10 }} width={36} />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(v, _name, props) => [`${v.toLocaleString()} mi/mo`, props.payload.inferred ? 'Inferred avg' : 'Avg']}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="milesPerMonth" maxBarSize={48}>
              {paceData.map((entry, i) => (
                <Cell key={i} fill={entry.inferred ? '#B3B0E8' : '#534AB7'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className={styles.chartLegend}>
          <span><span className={styles.legendBar} style={{ background: '#534AB7' }} />Measured pace</span>
          <span><span className={styles.legendBar} style={{ background: '#B3B0E8' }} />Inferred average</span>
        </div>
      </Card>
    </div>
  )
}

/* ── RECALLS TAB ─────────────────────────────────────────── */

// NHTSA recall DB uses specific trim names, not marketing series/class names.
// Confirmed mismatches from 100-vehicle stress test (RECALL_TEST_REPORT.md).
function normalizeRecallLookup(make, model) {
  const mk = (make || '').toUpperCase()
  const md = (model || '').toUpperCase()

  if (mk === 'BMW') {
    const map = { '3 SERIES': '330I', '4 SERIES': '430I', '5 SERIES': '530I', '6 SERIES': '640I', '7 SERIES': '740I', '8 SERIES': '840I', '2 SERIES': '230I' }
    if (map[md]) return { make, model: map[md] }
  }

  if (mk === 'MERCEDES-BENZ') {
    const map = { 'C-CLASS': 'C300', 'E-CLASS': 'E350', 'S-CLASS': 'S500', 'GLC': 'GLC300', 'GLE': 'GLE350', 'GLS': 'GLS450', 'CLA': 'CLA250', 'GLA': 'GLA250', 'GLB': 'GLB250' }
    if (map[md]) return { make, model: map[md] }
  }

  if (mk === 'FORD') {
    // NHTSA requires "F-250 SD" (space); VIN decoder sometimes returns "F-250SD"
    const map = { 'F-250SD': 'F-250 SD', 'F-350SD': 'F-350 SD', 'F-450SD': 'F-450 SD', 'F-550SD': 'F-550 SD' }
    if (map[md]) return { make, model: map[md] }
  }

  return { make, model }
}

function RecallsTab({ vehicle }) {
  const [recalls, setRecalls] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchRecalls() {
      setLoading(true)
      setError('')
      try {
        const { make: rawMake, model: rawModel, year } = vehicle
        const { make, model } = normalizeRecallLookup(rawMake, rawModel)
        const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`
        const res = await fetch(url)
        // NHTSA returns 400 when no recall records exist for this vehicle/year — treat as empty
        if (res.status === 400) { setRecalls([]); setLoading(false); return }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setRecalls(data.results || [])
      } catch (err) {
        console.error('NHTSA recall fetch error:', err)
        setError('Could not load recall data — check your connection and try again.')
      }
      setLoading(false)
    }
    fetchRecalls()
  }, [vehicle.id])

  function parseDate(raw) {
    return raw || ''
  }

  if (loading) return <div className={styles.center}><Spinner /></div>

  if (error) {
    return (
      <EmptyState icon="alert-triangle" title="Could not load recalls" subtitle={error} />
    )
  }

  if (recalls === null) return null

  if (recalls.length === 0) {
    return (
      <EmptyState
        icon="circle-check"
        title="No open recalls found"
        subtitle={`No NHTSA recalls on file for your ${vehicle.year} ${vehicle.make} ${vehicle.model}.`}
      />
    )
  }

  return (
    <div>
      <SectionHeader title={`${recalls.length} recall${recalls.length !== 1 ? 's' : ''} found`} />
      <p className={styles.muted} style={{ marginBottom: '1.25rem', fontSize: 13 }}>
        Source: NHTSA recall database. Contact your dealer to verify open status.
      </p>
      <div className={styles.recallList}>
        {recalls.map((r, i) => (
          <Card key={r.NHTSACampaignNumber || i} className={styles.recallCard}>
            <div className={styles.recallHeader}>
              <span className={styles.recallComponent}><i className="ti ti-tool" /> {r.Component}</span>
              <Badge color="coral">{r.NHTSACampaignNumber}</Badge>
            </div>
            {r.ReportReceivedDate && (
              <div className={styles.recallDate}>{parseDate(r.ReportReceivedDate)}</div>
            )}
            {r.Summary && (
              <p className={styles.recallText}><strong>Summary:</strong> {r.Summary}</p>
            )}
            {r.Consequence && (
              <p className={styles.recallText}><strong>Consequence:</strong> {r.Consequence}</p>
            )}
            {r.Remedy && (
              <p className={styles.recallText}><strong>What to do:</strong> {r.Remedy}</p>
            )}
            <div className={styles.recallFooter}>
              <a
                href={`https://www.nhtsa.gov/recalls?nhtsaId=${r.NHTSACampaignNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.recallLink}
              >
                View on NHTSA →
              </a>
            </div>
          </Card>
        ))}
      </div>
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

  const recordContext = (vehicle.records||[])
    .slice().sort((a,b) => new Date(b.date) - new Date(a.date))
    .map(r => [
      r.date,
      r.service,
      r.category || 'Maintenance',
      r.mileage > 0 ? `${r.mileage.toLocaleString()} mi` : null,
      r.cost > 0 ? `$${r.cost.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}` : null,
      r.notes || null,
      r.verified ? 'shop-verified' : 'DIY',
    ].filter(Boolean).join(' | ')).join('\n') || 'none yet'

  const systemPrompt = `You are a knowledgeable, friendly vehicle maintenance advisor. The user has a ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} with ${vehicle.engine} engine, ${(vehicle.mileage||0).toLocaleString()} miles.\n\nService history (date | service | category | mileage | cost | notes | source):\n${recordContext}\n\nGive concise, practical advice. Answer cost questions using the dollar amounts above. Keep answers under 200 words.`

  async function send(msgOverride) {
    const userMsg = (typeof msgOverride === 'string' ? msgOverride : input).trim()
    if (!userMsg || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)
    try {
      const reply = await callClaude(systemPrompt, userMsg)
      setMessages(m => [...m, { role: 'assistant', text: reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: 'Something went wrong — please try again.' }])
    }
    setLoading(false)
  }

  const suggestions = [
    'What maintenance is likely due?',
    'How much have I spent this year?',
    `What's my most expensive service?`,
    'Am I driving more or less than average?',
  ]

  return (
    <div className={styles.chatWrap}>
      <div className={styles.chatMessages}>
        {messages.length === 0 ? (
          <div className={styles.chatWelcome}>
            <div className={styles.chatWelcomeIcon}>🔧</div>
            <h3 className={styles.chatWelcomeTitle}>Ask anything about your vehicle</h3>
            <p className={styles.chatWelcomeSub}>{vehicle.year} {vehicle.make} {vehicle.model}</p>
            <div className={styles.suggestions}>
              {suggestions.map(s => (
                <button key={s} className={styles.suggestionBtn} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleAI}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className={`${styles.bubble} ${styles.bubbleAI} ${styles.bubbleLoading}`}>Thinking…</div>}
            <div ref={endRef} />
          </>
        )}
      </div>
      <div className={styles.chatInput}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about maintenance, costs, repairs…"
        />
        <Btn variant="primary" onClick={() => send()} disabled={loading || !input.trim()}>
          <i className="ti ti-send" />
        </Btn>
      </div>
    </div>
  )
}

/* ── SCAN RECEIPT TAB ─────────────────────────────────────── */

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
          ['Total maintenance spent', '$' + Math.round(totalSpent).toLocaleString(), 'coin'],
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
