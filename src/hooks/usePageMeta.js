import { useEffect } from 'react'

export function usePageMeta(title, description) {
  useEffect(() => {
    if (!title) return
    const prev = document.title
    document.title = title

    const tags = []
    function set(attr, key, val) {
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      let created = false
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); created = true }
      el.setAttribute('content', val)
      if (created) tags.push(el)
    }
    set('property', 'og:title', title)
    set('property', 'og:description', description)
    set('property', 'og:type', 'website')
    set('name', 'twitter:card', 'summary')
    set('name', 'twitter:title', title)
    set('name', 'twitter:description', description)

    return () => { document.title = prev; tags.forEach(el => el.remove()) }
  }, [title, description])
}
