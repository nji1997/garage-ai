import { useState, useEffect } from 'react'

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
    const map = { 'F-250SD': 'F-250 SD', 'F-350SD': 'F-350 SD', 'F-450SD': 'F-450 SD', 'F-550SD': 'F-550 SD' }
    if (map[md]) return { make, model: map[md] }
  }
  return { make, model }
}

export function useNHTSARecalls(year, make, model) {
  const [count, setCount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!make || !model || !year) return
    setLoading(true)
    setCount(null)
    setError(null)
    const { make: nMake, model: nModel } = normalizeRecallLookup(make, model)
    const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(nMake)}&model=${encodeURIComponent(nModel)}&modelYear=${encodeURIComponent(year)}`
    fetch(url)
      .then(res => {
        if (res.status === 400) { setCount(0); return null }
        if (!res.ok) { setCount(-1); return null }
        return res.json()
      })
      .then(data => { if (data) setCount(data.results?.length ?? 0) })
      .catch(() => { setCount(-1); setError('Failed to load recall data') })
      .finally(() => setLoading(false))
  }, [make, model, year])

  return { count, loading, error }
}
