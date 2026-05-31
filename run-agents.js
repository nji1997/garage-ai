import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync } from 'fs'
import { config } from 'dotenv'

config()

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LIVE_URL = 'https://garage-ai-silk.vercel.app'
const DEMO_URL = `${LIVE_URL}/share/demo`
const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 2000

// ── Shared code context snippets (trimmed to what's relevant per agent) ──

const DEMO_DATA = `
// src/pages/demo-data.js (updated — all dates are now in the past, VIN added)
export const demoVehicle = { year:'2022', make:'Toyota', model:'Camry', trim:'XSE',
  engine:'2.5L 4-cyl · Gasoline', transmission:'Automatic', bodyClass:'sedan', mileage:38000,
  vin:'4T1BF1FK8NU123456' }  // fictional but structurally valid VIN

export const demoRecords = [
  { id:'r1', title:'Oil Change & Multi-Point Inspection', shop:'Jiffy Lube', date:'2023-03-18', category:'Maintenance', mileage:14200, cost:79.99 },
  { id:'r2', title:'Tire Rotation & Brake Inspection', shop:'Costco Tire Center', date:'2023-06-10', category:'Maintenance', mileage:16100, cost:35.00 },
  { id:'r3', title:'Windshield Chip Repair', shop:'Safelite AutoGlass', date:'2023-09-05', category:'Insurance', mileage:18400, cost:0 },
  { id:'r4', title:'Air Filter & Cabin Filter Replacement', shop:'Toyota Dealership', date:'2023-12-02', category:'Maintenance', mileage:20300, cost:89.95 },
  { id:'r5', title:'Dashcam & Hardwire Kit Installation', shop:'Best Buy Auto', date:'2024-02-17', category:'Upgrade', mileage:21500, cost:249.99 },
  { id:'r6', title:'Brake Pad Replacement (front)', shop:'Midas', date:'2024-05-11', category:'Repair', mileage:23800, cost:189.00 },
  { id:'r7', title:'Oil Change', shop:'Jiffy Lube', date:'2024-08-03', category:'Maintenance', mileage:26000, cost:64.99 },
  { id:'r8', title:'Battery Replacement', shop:'AutoZone', date:'2024-11-22', category:'Repair', mileage:28500, cost:149.99 },
  { id:'r9', title:'Tire Rotation & Wheel Balancing', shop:'Discount Tire', date:'2025-01-18', category:'Maintenance', mileage:29700, cost:49.00 },
  { id:'r10', title:'Oil Change & Full Inspection', shop:'Toyota Dealership', date:'2025-04-12', category:'Maintenance', mileage:31200, cost:129.95 },
  { id:'r11', title:'Wiper Blade Replacement', shop:'Toyota Dealership', date:'2025-04-12', category:'Maintenance', mileage:31200, cost:29.95 },
  { id:'r12', title:'Synthetic Oil Change', shop:'Jiffy Lube', date:'2025-10-12', category:'Maintenance', mileage:38000, cost:84.99 },
  // NOTE: r12 was 2026-02-08 (future date bug). Fixed to 2025-10-12.
]

export const demoMaintenance = [
  { id:'m1', service:'Oil Change', dueIn:'~2,000 mi', urgency:'yellow' },
  { id:'m2', service:'Tire Rotation', dueIn:'~4,000 mi', urgency:'green' },
  { id:'m3', service:'Cabin Air Filter', dueIn:'~7,000 mi', urgency:'green' },
  { id:'m4', service:'Brake Inspection', dueIn:'~12,000 mi', urgency:'green' },
  { id:'m5', service:'Transmission Fluid', dueIn:'~22,000 mi', urgency:'green' },
  { id:'m6', service:'Coolant Flush', dueIn:'~32,000 mi', urgency:'green' },
]
`

const DEMO_JSX_SUMMARY = `
// src/pages/DemoVehicle.jsx — key structure (refactored)
// Uses SharedVehicleShell (provides skip-to-content link, ShareNav, <main id="main-content">, container)
// Uses useNHTSARecalls hook (shared, encapsulates fetch + normalizeRecallLookup + loading/error state)
// Uses usePageMeta hook (shared)
// Uses getCategoryClass utility (single source of truth for category → CSS class)
//
// Page structure (top to bottom):
// - Skip link: <a href="#main-content" class="skip-link">Skip to main content</a> (visually hidden until focused)
// - ShareNav: sticky nav with aria-label="Site navigation", SVG icon has aria-hidden="true"
// - Hero section:
//   - Silhouette div with aria-hidden="true"
//   - Vehicle name + "Demo vehicle" badge
//   - Engine/transmission sub-line
//   - VIN: "4T1BF1FK8NU123456" (example — note says real pages show owner's VIN)
//   - Product explainer: "The maintenance logbook for your car, with smart reminders and live recall alerts."
// - Health summary card (new): shows $1,153 documented spend / 12 service records / recall count (async)
// - Stats row: 3 items (Service Records: 12, Current Mileage: 38,000 mi, Tracked: 2 yrs)
// - Service History section: records GROUPED BY YEAR (2025, 2024, 2023) with year divider labels
//   - r.cost === 0 && r.category === 'Insurance' renders as "Insurance covered" not "$0.00"
// - Suggested Maintenance section: urgency badges show text labels (Coming Up / Due Soon / Overdue)
// - Mid-page inline CTA: "Track your own car free →" (smaller, after maintenance section)
// - Recall Status section: aria-live="polite" aria-atomic="true"; shows loading text while fetching
// - Bottom CTA banner: "Your car's full history, always at your fingertips — free to start, takes 2 minutes"
//   + "Start tracking free →" button (arrow wrapped in aria-hidden span)
// - Route: /share/demo
`

const SHARED_JSX_SUMMARY = `
// src/pages/SharedVehicle.jsx — key structure (refactored)
// Uses same SharedVehicleShell, useNHTSARecalls, usePageMeta, getCategoryClass as DemoVehicle
//
// Page structure (top to bottom):
// - Skip link + ShareNav (via shell)
// - Hero: silhouette (aria-hidden="true"), vehicle name/trim, engine info
// - CTABanner (placed after hero, before stats): "Your car's full history, always at your fingertips..."
// - Stats grid: mileage, service record count, mod count
// - Service History section: shows only count + date range + category pills (NOT line items)
//   Note: "Owner-submitted records · Full details available to owner only"
// - Recall Status section: aria-live="polite" aria-atomic="true"; shows loading text while fetching
// - Route: /share/:shareId
`

const CSS_SUMMARY = `
// Shared CSS characteristics (refactored):
// - SharedVehicleShell.module.css owns: .page (max-width container, #f8fafc bg, font stack), .ctaBanner
// - ShareNav.module.css owns: sticky nav, logo, badge
// - index.css now has GLOBAL :focus-visible { outline: 3px solid #6366f1; outline-offset: 2px; border-radius: 4px; }
// - index.css now has .skip-link (visually hidden, revealed on :focus with top: 8px)
// - DemoVehicle.module.css adds: .yearDivider (year labels in record list), .healthCard (3-col summary),
//   .midCTA / .midCTABtn (inline CTA after maintenance), .productExplainer, .vin / .vinNote
// - Both page modules define identical category pill colors:
//   .catMaintenance { bg:#dcfce7; color:#166534 }  — WCAG AA compliant
//   .catUpgrade     { bg:#ede9fe; color:#5b21b6 }  — WCAG AA compliant
//   .catInsurance   { bg:#dbeafe; color:#1e40af }  — changed from yellow to blue (yellow failed contrast)
//   .catRepair      { bg:#ffedd5; color:#9a3412 }  — WCAG AA compliant
// - Responsive breakpoint: 560px; silhouette 210px → 160px on mobile
// - CTA banner stacks vertically on mobile; button goes full-width
// - On mobile (<400px), nav badge is hidden via ShareNav.module.css
`

const OUTPUT_FORMAT = `
Your response MUST follow this exact format:

**Summary**
[2-3 sentences from your persona's perspective]

**Observations**
- [observation]
- [observation]
- [more as needed]

**Suggestions**
1. [concrete, actionable suggestion]
2. [concrete, actionable suggestion]
3. [concrete, actionable suggestion]
`

// ── Agent definitions ──

const agents = [
  {
    name: 'First-time visitor',
    context: DEMO_JSX_SUMMARY + DEMO_DATA,
    instruction: `You are a first-time visitor who has never heard of this app. Someone shared ${DEMO_URL} with you.
You don't know what Garage AI is. Evaluate: Does the page clearly communicate what the app does and why you'd want it?
What's confusing on first glance? What would make you sign up vs. close the tab?
Focus on clarity, value proposition, and first impressions.`,
  },
  {
    name: 'Used car buyer',
    context: DEMO_JSX_SUMMARY + DEMO_DATA,
    instruction: `You are a used car buyer. Someone selling you a car sent you ${DEMO_URL} as proof of maintenance history.
Is the history trustworthy and easy to read? Does it answer the questions you'd have before handing over money?
What's missing that you'd want to see (receipts, photos, VIN verification, mileage consistency, etc.)?`,
  },
  {
    name: 'UX critic',
    context: DEMO_JSX_SUMMARY + CSS_SUMMARY + DEMO_DATA,
    instruction: `You are a professional UX designer critiquing ${DEMO_URL}.
Review the layout, visual hierarchy, typography, spacing, and component design based on the code.
What works well? What feels off, crowded, inconsistent, or confusing? Focus on design quality and usability.`,
  },
  {
    name: 'Mobile user',
    context: DEMO_JSX_SUMMARY + CSS_SUMMARY + DEMO_DATA,
    instruction: `You are a user viewing ${DEMO_URL} on a phone (375px wide screen).
Based on the CSS and JSX, identify what would break, feel cramped, or be hard to use on mobile.
Consider: tap targets, text sizes, overflow, stacked elements, scrolling, the stats row, record list, etc.`,
  },
  {
    name: 'Skeptic',
    context: DEMO_JSX_SUMMARY + SHARED_JSX_SUMMARY + DEMO_DATA,
    instruction: `You are a skeptical user who doesn't trust apps that claim to track things for you.
Visit ${DEMO_URL} with suspicion. What raises red flags? What feels unconvincing, unverifiable, or like it could be faked?
What would the app need to show or do to earn your trust?`,
  },
  {
    name: 'Car enthusiast',
    context: DEMO_JSX_SUMMARY + DEMO_DATA,
    instruction: `You are a serious car enthusiast who tracks everything about their vehicles.
Visit ${DEMO_URL} as someone who cares deeply about vehicle data.
Is the information useful and accurate enough? What data is missing that real car people would want
(OBD data, part numbers, fluid specs, tire specs, photos, receipts, VIN decode, etc.)?`,
  },
  {
    name: 'Conversion optimizer',
    context: DEMO_JSX_SUMMARY + SHARED_JSX_SUMMARY + CSS_SUMMARY,
    instruction: `You are a growth/conversion specialist. Your job is to maximize signups from ${DEMO_URL}.
Critique the CTA placement, copy, funnel flow, and overall conversion experience.
The CTA is "Know your car better than anyone. Start tracking free →" — where it appears and how it reads.
What would you change to drive more signups?`,
  },
  {
    name: 'Accessibility reviewer',
    context: DEMO_JSX_SUMMARY + SHARED_JSX_SUMMARY + CSS_SUMMARY,
    instruction: `You are an accessibility expert doing a WCAG audit of ${DEMO_URL}.
Review the code for: missing alt text on SVG icons, contrast ratios (using the hex colors provided),
keyboard navigation, semantic HTML structure, ARIA labels, focus management, and screen reader support.
Be specific about what's missing and what passes.`,
  },
  {
    name: 'Developer',
    context: DEMO_JSX_SUMMARY + SHARED_JSX_SUMMARY + CSS_SUMMARY + DEMO_DATA,
    instruction: `You are a senior frontend developer doing a code review of the share page and demo page.
Based on the code structure, comment on: code quality, maintainability, potential bugs,
duplication (e.g. usePageMeta and normalizeRecallLookup are duplicated across both files),
technical debt, and anything that looks like a future bug or maintenance problem.`,
  },
  {
    name: 'Competitor analyst',
    context: DEMO_JSX_SUMMARY + DEMO_DATA,
    instruction: `You are a product analyst comparing ${DEMO_URL} to apps like Carfax, AutoTrader, and similar vehicle history services.
Where does Garage AI feel stronger? Where does it feel weaker or less polished?
What features or trust signals do competitors have that this app lacks?`,
  },
]

async function runAgent(index, agent) {
  const agentNum = index + 1
  console.log(`  Agent ${agentNum} (${agent.name}) starting...`)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: `You are a product evaluator. You will be given context about a web app's source code and asked to evaluate it from a specific perspective. Be honest, specific, and constructive. Keep your response focused and concise.`,
    messages: [
      {
        role: 'user',
        content: `${agent.instruction}

Here is the relevant source code and context:

${agent.context}

${OUTPUT_FORMAT}`,
      },
    ],
  })

  const text = response.content.find(b => b.type === 'text')?.text || ''
  console.log(`  Agent ${agentNum} (${agent.name}) done.`)
  return { name: agent.name, text }
}

async function main() {
  console.log(`Running ${agents.length} agents in parallel against ${LIVE_URL}...\n`)

  const results = await Promise.all(agents.map((agent, i) => runAgent(i, agent)))

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'

  const lines = [
    '# Agent QA Report',
    '',
    `Generated: ${timestamp}`,
    `App: ${LIVE_URL}`,
    `Demo: ${DEMO_URL}`,
    '',
    '---',
    '',
  ]

  for (let i = 0; i < results.length; i++) {
    const { name, text } = results[i]
    lines.push(`## Agent ${i + 1} — ${name}`)
    lines.push('')
    lines.push(text.trim())
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  const report = lines.join('\n')
  writeFileSync('agent-report.md', report, 'utf8')
  console.log(`\nReport written to agent-report.md`)
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
