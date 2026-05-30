// ANTHROPIC_API_KEY must be set in Vercel: Project → Settings → Environment Variables
export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
}

export default async function handler(req, res) {
  // Health check — GET /api/claude
  if (req.method === 'GET') {
    return res.json({ status: 'ok', hasKey: !!process.env.ANTHROPIC_API_KEY })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('[claude] ANTHROPIC_API_KEY is not set in environment')
      return res.status(500).json({
        error: 'ANTHROPIC_API_KEY is not configured. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.',
      })
    }

    const body = req.body
    if (!body || typeof body !== 'object') {
      console.error('[claude] Request body missing or unparsed. Content-Type:', req.headers['content-type'])
      return res.status(400).json({ error: 'Request body is missing or could not be parsed' })
    }

    const { system, userText, file } = body

    const userContent = file
      ? [
          file.mediaType === 'application/pdf'
            ? { type: 'document', source: { type: 'base64', media_type: file.mediaType, data: file.base64 } }
            : { type: 'image', source: { type: 'base64', media_type: file.mediaType, data: file.base64 } },
          { type: 'text', text: userText || 'Extract all the details from this document.' },
        ]
      : userText

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: userContent }],
      }),
    })

    const data = await anthropicRes.json()

    if (!anthropicRes.ok) {
      const errMsg = data?.error?.message || JSON.stringify(data?.error) || `Anthropic ${anthropicRes.status}`
      console.error('[claude] Anthropic API error:', anthropicRes.status, errMsg)
      return res.status(anthropicRes.status).json({ error: errMsg, code: anthropicRes.status })
    }

    return res.json({ text: data.content?.[0]?.text || '' })
  } catch (err) {
    console.error('[claude] Unhandled exception:', err)
    return res.status(500).json({ error: err?.message || 'Internal server error', code: err?.status || err?.code || null })
  }
}
