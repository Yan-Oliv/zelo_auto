import { useEffect, useState } from 'react'

export function useActiveSection(sectionIds: string[], contentReady = true) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? '')

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (!elements.length) {
      return
    }

    let frame = 0
    const update = () => {
      frame = 0
      const header = document.querySelector('header')?.getBoundingClientRect().height ?? 100
      const line = header + 32
      let selected = elements[0].id
      let nearestTop = -Infinity
      for (const element of elements) {
        const top = element.getBoundingClientRect().top
        if (top <= line && top >= nearestTop) { selected = element.id; nearestTop = top }
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) {
        const target = elements.find(element => `#${element.id}` === window.location.hash)
        const bounds = target?.getBoundingClientRect()
        if (target && bounds && bounds.top < window.innerHeight && bounds.bottom > header) selected = target.id
      }
      setActiveSection(selected)
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    // Tall mobile sections cannot reach a fixed percentage intersection ratio.
    // Anchor position follows the content under the fixed header instead.
    const observer = new IntersectionObserver(schedule, { threshold: 0 })
    elements.forEach(element => observer.observe(element))
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('hashchange', schedule)
    update()
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('hashchange', schedule)
    }
  }, [sectionIds, contentReady])

  return activeSection
}
