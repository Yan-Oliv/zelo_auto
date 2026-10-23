import { useEffect } from 'react'
import { siteConfig, locationInfo } from '../../features/landing/data/site'
import { getConsent, subscribeConsent, track, type Location, type Service } from './analytics'

export function useCommercialAnalytics() {
  useEffect(() => {
    let comparisonTimer: number | undefined
    function source(anchor: HTMLElement): Location {
      if (anchor.closest('footer')) return 'footer'
      if (anchor.closest('header, #zelo-mobile-menu')) return 'header'
      if (anchor.closest('#servicos')) return 'services'
      if (anchor.closest('#resultados')) return 'results'
      if (anchor.closest('#instagram')) return 'instagram_grid'
      if (anchor.closest('#avaliacoes')) return 'reviews'
      return 'location'
    }
    function click(event: MouseEvent) {
      if (!(event.target instanceof Element)) return
      const anchor = event.target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || !anchor.closest('.ze4-page')) return
      const href = anchor.getAttribute('href')
      const cta_location = source(anchor)
      const service_context = anchor.dataset.analyticsService as Service | undefined
      if (href === siteConfig.whatsappLink) {
        if (service_context) track('select_service', { service_name: service_context })
        if (anchor.hasAttribute('data-analytics-quote')) track('quote_click', { cta_location, service_context })
        track('whatsapp_click', { cta_location, service_context })
      } else if (anchor.hasAttribute('data-analytics-review')) track('google_reviews_click', { cta_location })
      else if (href === locationInfo.mapsLink) track('directions_click', { cta_location })
      else {
        try {
          const url = new URL(anchor.href)
          if (url.hostname === 'www.instagram.com' || url.hostname === 'instagram.com') {
            track('instagram_click', { cta_location, link_type: /^\/(p|reel|tv)\//.test(url.pathname) ? 'post' : 'profile' })
          }
        } catch { /* Relative navigation is not an outbound event. */ }
      }
    }
    function input(event: Event) {
      if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'range') return
      const comparator_id = event.target.dataset.analyticsComparator
      if (!comparator_id) return
      window.clearTimeout(comparisonTimer)
      if (getConsent() !== 'granted') return
      comparisonTimer = window.setTimeout(() => {
        comparisonTimer = undefined
        if (event.target instanceof Node && event.target.isConnected) track('before_after_interaction', { comparator_id })
      }, 500)
    }
    const unsubscribe = subscribeConsent(() => { window.clearTimeout(comparisonTimer) })
    document.addEventListener('click', click)
    document.addEventListener('input', input)
    return () => {
      document.removeEventListener('click', click)
      document.removeEventListener('input', input)
      window.clearTimeout(comparisonTimer)
      unsubscribe()
    }
  }, [])
}
