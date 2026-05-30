function getType(bodyClass) {
  const b = (bodyClass || '').toLowerCase()
  if (b.includes('suv') || b.includes('utility') || b.includes('mpv')) return 'suv'
  if (b.includes('pickup') || b.includes('truck') || b.includes('chassis')) return 'pickup'
  if (b.includes('van') || b.includes('minivan')) return 'van'
  if (b.includes('coupe') || b.includes('convertible') || b.includes('cabriolet')) return 'coupe'
  if (b.includes('hatchback') || b.includes('liftback')) return 'hatchback'
  return 'sedan'
}

const W = 'white'
const WO = 0.32

const SHAPES = {
  sedan: (
    <>
      <circle cx="21" cy="30" r="7" />
      <circle cx="79" cy="30" r="7" />
      <rect x="5" y="19" width="90" height="12" rx="2" />
      <rect x="2" y="21" width="4" height="8" rx="1" />
      <rect x="94" y="21" width="4" height="8" rx="1" />
      <path d="M28,19 L33,8 L67,8 L72,19Z" />
      <path d="M35,19 L38,10 L62,10 L65,19Z" fill={W} opacity={WO} />
    </>
  ),
  suv: (
    <>
      <circle cx="21" cy="30" r="8" />
      <circle cx="79" cy="30" r="8" />
      <rect x="5" y="19" width="90" height="12" rx="2" />
      <rect x="2" y="21" width="4" height="8" rx="1" />
      <rect x="94" y="21" width="4" height="8" rx="1" />
      <path d="M13,19 L14,6 L86,6 L87,19Z" />
      <rect x="18" y="8" width="25" height="10" rx="1" fill={W} opacity={WO} />
      <rect x="52" y="8" width="25" height="10" rx="1" fill={W} opacity={WO} />
    </>
  ),
  pickup: (
    <>
      <circle cx="21" cy="30" r="7" />
      <circle cx="79" cy="30" r="7" />
      <rect x="5" y="19" width="49" height="12" rx="2" />
      <path d="M13,19 L15,8 L51,8 L51,19Z" />
      <rect x="2" y="21" width="4" height="8" rx="1" />
      <rect x="19" y="10" width="28" height="8" rx="1" fill={W} opacity={WO} />
      <rect x="55" y="24" width="41" height="7" rx="1" />
      <rect x="55" y="19" width="41" height="5" rx="1" />
      <rect x="93" y="19" width="4" height="12" rx="1" />
    </>
  ),
  van: (
    <>
      <circle cx="21" cy="30" r="8" />
      <circle cx="79" cy="30" r="8" />
      <rect x="5" y="19" width="90" height="12" rx="2" />
      <rect x="2" y="21" width="4" height="8" rx="1" />
      <rect x="94" y="21" width="4" height="8" rx="1" />
      <path d="M13,19 L13,5 L87,5 L87,19Z" />
      <rect x="17" y="7" width="22" height="11" rx="1" fill={W} opacity={WO} />
      <rect x="46" y="7" width="22" height="11" rx="1" fill={W} opacity={WO} />
    </>
  ),
  coupe: (
    <>
      <circle cx="22" cy="30" r="7" />
      <circle cx="78" cy="30" r="7" />
      <rect x="5" y="21" width="90" height="10" rx="2" />
      <rect x="2" y="23" width="4" height="7" rx="1" />
      <rect x="94" y="23" width="4" height="7" rx="1" />
      <path d="M24,21 L32,11 L70,11 L77,21Z" />
      <path d="M34,21 L38,13 L63,13 L67,21Z" fill={W} opacity={WO} />
    </>
  ),
  hatchback: (
    <>
      <circle cx="21" cy="30" r="7" />
      <circle cx="79" cy="30" r="7" />
      <rect x="5" y="19" width="90" height="12" rx="2" />
      <rect x="2" y="21" width="4" height="8" rx="1" />
      <rect x="94" y="21" width="4" height="8" rx="1" />
      <path d="M29,19 L33,8 L74,8 L79,19Z" />
      <path d="M36,19 L38,10 L70,10 L75,19Z" fill={W} opacity={WO} />
    </>
  ),
}

export default function VehicleSilhouette({ bodyClass = '', className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 100 38"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {SHAPES[getType(bodyClass)]}
    </svg>
  )
}
