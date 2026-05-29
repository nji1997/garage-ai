import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useVehicles } from '../hooks/useVehicles'
import { Btn, Card, Badge, Spinner, EmptyState, SectionHeader } from '../components/UI'
import VinLookup from '../components/VinLookup'
import styles from './Dashboard.module.css'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'

async function callClaude(system, user) {
  const r = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: user }]
    })
  })
  const d = await r.json()
  return d.content?.[0]?.text || ''
}

const TABS = ['Overview', 'Service History', 'Reminders', 'Modifications', 'AI Advisor', 'Scan Receipt', 'Sell Vehicle']

export default function Dashboard() {
  const { user } = useAuth()
  const { vehicles, loading, addVehicle, updateVehicle, deleteVehicle } = useVehicles(user?.uid)
  const [selectedId, setSelectedId] = useState(null)
  const [tab, setTab] = useState('Overview')
  const [showAddVehicle, setShowAddVehicle] = useState(false)

  const vehicle = vehicles.find(v => v.id === selectedId) || vehicles[0]

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
              <Btn variant="danger" size="sm" onClick={() => { if (confirm('Remove this vehicle?')) deleteVehicle(vehicle.id) }}>
                <i className="ti ti-trash" /> Remove
              </Btn>
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
              {tab === 'Reminders' && <RemindersTab vehicle={vehicle} updateVehicle={updateVehicle} />}
              {tab === 'Modifications' && <ModsTab vehicle={vehicle} updateVehicle={updateVehicle} />}
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
  const total = records.reduce((s, r) => s + (r.cost || 0), 0)
  return (
    <div className={`${styles.vehicleItem} ${selected ? styles.vehicleItemSelected : ''}`} onClick={onClick}>
      <div className={styles.vehicleItemName}>{vehicle.year} {vehicle.make} {vehicle.model}</div>
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

  const byService = {}
  records.forEach(r => { byService[r.service] = (byService[r.service] || 0) + r.cost })
  const spending = Object.entries(byService).sort((a, b) => b[1] - a[1])
  const maxSpend = Math.max(...spending.map(e => e[1]), 1)
  const barColors = ['#7F77DD','#1D9E75','#D85A30','#BA7517','#378ADD','#D4537E']

  const [editMileage, setEditMileage] = useState(false)
  const [mi, setMi] = useState(vehicle.mileage || 0)

  return (
    <div className={styles.overviewGrid}>
      <div className={styles.statsRow}>
        {[
          { label: 'Mileage', value: (vehicle.mileage || 0).toLocaleString() + ' mi', icon: 'road' },
          { label: 'Total spent', value: '$' + total.toFixed(0), icon: 'coin' },
          { label: 'Records', value: records.length, icon: 'file-text' },
          { label: 'Verified', value: verified, icon: 'circle-check' },
        ].map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statLabel}><i className={`ti ti-${s.icon}`} /> {s.label}</div>
            <div className={styles.statValue}>{s.value}</div>
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
function ServiceHistoryTab({ vehicle, updateVehicle }) {
  const records = [...(vehicle.records || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ service: '', shop: '', date: '', mileage: '', cost: '', notes: '', verified: false })

  function save() {
    const rec = { ...form, id: 'r' + Date.now(), cost: parseFloat(form.cost) || 0, mileage: parseInt(form.mileage) || 0 }
    updateVehicle(vehicle.id, { records: [...(vehicle.records || []), rec] })
    setForm({ service: '', shop: '', date: '', mileage: '', cost: '', notes: '', verified: false })
    setShowForm(false)
  }

  function remove(id) {
    updateVehicle(vehicle.id, { records: (vehicle.records || []).filter(r => r.id !== id) })
  }

  return (
    <div>
      <SectionHeader title={`${records.length} service records`}
        action={<Btn size="sm" variant="primary" onClick={() => setShowForm(s => !s)}><i className="ti ti-plus" /> Add record</Btn>} />

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

/* ── REMINDERS TAB ────────────────────────────────────────── */
function RemindersTab({ vehicle, updateVehicle }) {
  const reminders = vehicle.reminders || []
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ service: '', dueMileage: '', dueDate: '', priority: 'medium' })

  function save() {
    const rem = { ...form, id: 'rem' + Date.now(), dueMileage: parseInt(form.dueMileage) || 0 }
    updateVehicle(vehicle.id, { reminders: [...reminders, rem] })
    setForm({ service: '', dueMileage: '', dueDate: '', priority: 'medium' })
    setShowForm(false)
  }

  function remove(id) {
    updateVehicle(vehicle.id, { reminders: reminders.filter(r => r.id !== id) })
  }

  return (
    <div>
      <SectionHeader title={`${reminders.length} reminders`}
        action={<Btn size="sm" variant="primary" onClick={() => setShowForm(s => !s)}><i className="ti ti-plus" /> Add reminder</Btn>} />

      {showForm && (
        <Card className={styles.formCard}>
          <div className={styles.formGrid}>
            <div><label className={styles.label}>Service</label><input value={form.service} onChange={e => setForm(f=>({...f,service:e.target.value}))} /></div>
            <div><label className={styles.label}>Due mileage</label><input type="number" value={form.dueMileage} onChange={e => setForm(f=>({...f,dueMileage:e.target.value}))} /></div>
            <div><label className={styles.label}>Due date</label><input type="date" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))} /></div>
            <div>
              <label className={styles.label}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <Btn variant="primary" size="sm" onClick={save} disabled={!form.service}>Save reminder</Btn>
            <Btn size="sm" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {reminders.length === 0 && !showForm
        ? <EmptyState icon="bell-off" title="No reminders" subtitle="Add service reminders to stay ahead of maintenance." />
        : reminders.map(r => (
          <div key={r.id} className={styles.recordRow}>
            <div className={styles.recordLeft}>
              <div className={styles.recordService}>{r.service}</div>
              <div className={styles.recordMeta}>
                {r.dueMileage > 0 && <span>Due at {r.dueMileage.toLocaleString()} mi</span>}
                {r.dueDate && <span>{r.dueDate}</span>}
              </div>
            </div>
            <div className={styles.recordRight}>
              <Badge color={r.priority === 'high' ? 'coral' : r.priority === 'medium' ? 'amber' : 'teal'}>{r.priority}</Badge>
              <button className={styles.removeBtn} onClick={() => remove(r.id)}><i className="ti ti-x" /></button>
            </div>
          </div>
        ))
      }
    </div>
  )
}

/* ── MODIFICATIONS TAB ────────────────────────────────────── */
function ModsTab({ vehicle, updateVehicle }) {
  const mods = vehicle.mods || []
  const [input, setInput] = useState('')

  function add() {
    if (!input.trim()) return
    updateVehicle(vehicle.id, { mods: [...mods, input.trim()] })
    setInput('')
  }

  function remove(i) {
    updateVehicle(vehicle.id, { mods: mods.filter((_, idx) => idx !== i) })
  }

  return (
    <div>
      <SectionHeader title="Aftermarket modifications" />
      <div style={{display:'flex',gap:8,marginBottom:'1rem'}}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&add()} placeholder="e.g. Cold air intake, tinted windows…" />
        <Btn variant="primary" onClick={add} disabled={!input.trim()}><i className="ti ti-plus" /> Add</Btn>
      </div>
      {mods.length === 0
        ? <EmptyState icon="tool" title="No modifications logged" subtitle="Track aftermarket parts and upgrades here." />
        : <div className={styles.modList}>
            {mods.map((m, i) => (
              <div key={i} className={styles.modItem}>
                <i className="ti ti-bolt" style={{color:'var(--purple)',fontSize:15}} />
                <span>{m}</span>
                <button className={styles.removeBtn} onClick={() => remove(i)}><i className="ti ti-x" /></button>
              </div>
            ))}
          </div>
      }
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
function ScanReceiptTab({ vehicle, updateVehicle }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(false)

  async function analyze() {
    setLoading(true); setResult(null); setSaved(false)
    const reply = await callClaude(
      'You are a service receipt parser. Extract structured data from the receipt and respond ONLY with valid JSON (no markdown, no extra text): {"shop":"","date":"YYYY-MM-DD","service":"","parts":"","labor":0,"total":0,"mileage":0,"notes":""}',
      text
    )
    try {
      setResult(JSON.parse(reply.replace(/```json|```/g, '').trim()))
    } catch {
      setResult({ error: 'Could not parse — try pasting more of the receipt text.' })
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
      <SectionHeader title="AI receipt analyzer" />
      <p className={styles.muted} style={{marginBottom:'1rem'}}>Paste any service receipt text below — AI will extract all the details automatically.</p>
      <textarea rows={6} value={text} onChange={e => setText(e.target.value)}
        placeholder="Paste receipt text here… e.g. 'Jiffy Lube - Oil Change $67.99, air filter $18. Total: $85.99. Mileage: 34,500. Date: Nov 15 2024'" />
      <div style={{marginTop:10}}>
        <Btn variant="primary" onClick={analyze} disabled={loading || !text.trim()}>
          {loading ? 'Analyzing…' : <><i className="ti ti-sparkles" /> Analyze Receipt</>}
        </Btn>
      </div>

      {result && !result.error && (
        <Card className={styles.receiptResult}>
          <div className={styles.formGrid}>
            {[['Shop', result.shop], ['Date', result.date], ['Service', result.service], ['Total', result.total ? '$' + result.total : '—'], ['Mileage', result.mileage ? result.mileage.toLocaleString() + ' mi' : '—'], ['Notes', result.notes]].filter(([,v]) => v).map(([k,v]) => (
              <div key={k}><span className={styles.label}>{k}</span><div style={{fontSize:14}}>{v}</div></div>
            ))}
          </div>
          {saved
            ? <Badge color="teal">✓ Saved to service history</Badge>
            : <Btn variant="primary" size="sm" onClick={saveRecord} style={{marginTop:12}}><i className="ti ti-plus" /> Add to service history</Btn>
          }
        </Card>
      )}
      {result?.error && <p style={{color:'#993C1D',fontSize:13,marginTop:10}}>{result.error}</p>}
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
