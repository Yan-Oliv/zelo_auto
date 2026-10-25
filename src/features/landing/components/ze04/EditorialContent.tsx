import { LazyMotion, domAnimation } from 'framer-motion'
import { useEffect } from 'react'
import { ServicesSection, ResultsSection, ProcessSection, QualitySection } from './CommercialSections'
import { CommunitySection, LocationSection, PremiumFooter } from './CommunityContact'

export default function EditorialContent({ onReady }: { onReady: () => void }) {
  // Module resolution precedes the Suspense commit. Observers and initial
  // anchors may only run after their actual target elements are mounted.
  useEffect(onReady, [onReady])
  return <LazyMotion features={domAnimation} strict><ServicesSection /><ResultsSection /><ProcessSection /><QualitySection /><CommunitySection /><LocationSection /></LazyMotion>
}
export { PremiumFooter }
