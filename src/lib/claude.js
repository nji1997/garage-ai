export async function callClaude(system, userText) {
  const r = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, userText }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(d.error || 'Claude API error')
  return d.text
}

export async function callClaudeWithFile(system, userText, base64, mediaType) {
  const r = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, userText, file: { base64, mediaType } }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(d.error || 'Claude API error')
  return d.text
}
