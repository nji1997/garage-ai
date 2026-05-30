// Set ANTHROPIC_API_KEY in Vercel: Project → Settings → Environment Variables
export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' })
  }

  const { system, userText, file } = req.body

  const userContent = file
    ? [
        file.mediaType === 'application/pdf'
          ? { type: 'document', source: { type: 'base64', media_type: file.mediaType, data: file.base64 } }
          : { type: 'image', source: { type: 'base64', media_type: file.mediaType, data: file.base64 } },
        { type: 'text', text: userText || 'Extract all service data from this receipt.' },
      ]
    : userText

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'pdfs-2024-09-25',
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: userContent }],
      }),
    })

    const data = await r.json()

    if (!r.ok) {
      return res.status(r.status).json({ error: data.error?.message || 'Claude API error' })
    }

    res.json({ text: data.content?.[0]?.text || '' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
