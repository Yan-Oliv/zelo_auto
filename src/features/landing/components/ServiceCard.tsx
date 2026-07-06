import { motion } from 'framer-motion'
import { Armchair, Droplets, Sparkles, SprayCan, Waves } from 'lucide-react'
import type { ServiceItem } from '../data/site'
import { useMotionSettings } from '@shared/motion/MotionSettings'

const iconMap = {
  wash: Droplets,
  interior: SprayCan,
  seats: Armchair,
  carpet: Waves,
} as const

export function ServiceCard({
  service,
  index,
  focus = 0,
  focused = false,
}: {
  service: ServiceItem
  index: number
  focus?: number
  focused?: boolean
}) {
  const Icon = iconMap[service.icon]
  const { reducedMotion } = useMotionSettings()
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1440
  const focusScale = viewportWidth < 768
    ? 0.96 + focus * 0.1
    : viewportWidth < 1280
      ? 0.94 + focus * 0.16
      : 0.94 + focus * 0.22
  const focusOpacity = 0.72 + focus * 0.28
  const focusBorder = 0.2 + focus * 0.52
  const focusGlow = focus * 0.22
  const cleaningSweep = `${-28 + focus * 118}%`
  const residueOpacity = reducedMotion ? 0.08 : 0.2 * (1 - focus)
  const foamOpacity = reducedMotion ? 0 : focus * 0.46
  const sparkleOpacity = reducedMotion ? 0 : focus * 0.34

  return (
    <motion.article
      initial={reducedMotion ? false : { y: 24 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.72, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reducedMotion ? undefined : { y: -3 }}
      className="service-card group"
      data-service={service.icon}
      data-focused={focused}
      animate={{
        scale: reducedMotion ? 1 : focusScale,
        opacity: focusOpacity,
        borderColor: `rgba(212, 175, 55, ${focusBorder})`,
        boxShadow: `0 22px 54px rgba(212, 175, 55, ${focusGlow})`,
      }}
      style={{ zIndex: focused ? 2 : 1 }}
    >
      <motion.span
        className="service-card-residue"
        animate={{ opacity: residueOpacity }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className="service-card-clean-sweep"
        animate={{
          x: cleaningSweep,
          opacity: foamOpacity,
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className="service-card-spark"
        animate={{
          opacity: sparkleOpacity,
          scale: 0.86 + focus * 0.42,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="service-icon-wrap">
        <Icon size={24} className="relative z-10" />
        <motion.span
          key={`${service.icon}-${focused ? 'focused' : 'idle'}`}
          className="service-icon-sheen"
          animate={
            reducedMotion || !focused
              ? undefined
              : service.icon === 'wash'
                ? { y: ['-45%', '120%'], opacity: [0, 0.45, 0] }
                : service.icon === 'interior'
                  ? { x: ['-120%', '130%'], opacity: [0, 0.4, 0] }
                  : service.icon === 'seats'
                    ? { scale: [0.55, 1.12, 0.8], opacity: [0, 0.42, 0] }
                    : { rotate: [0, 12, -8, 0], opacity: [0.08, 0.36, 0.18, 0.08] }
          }
          transition={{
            duration: service.icon === 'carpet' ? 1.7 : 1.45,
            repeat: 0,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </div>

      <div className="mt-7 flex items-center gap-2 text-brand-gold">
        <Sparkles size={12} />
        <span className="font-['Eurostile_Extended','Montserrat',sans-serif] text-[10px] uppercase tracking-[0.28em]">
          {service.eyebrow}
        </span>
      </div>

      <h3 className="mt-4 font-['Eurostile_Extended','Montserrat',sans-serif] text-[1.2rem] uppercase tracking-[0.12em] text-brand-white">
        {service.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-brand-silver">{service.description}</p>
    </motion.article>
  )
}
