import clsx from 'clsx'
import type { CarouselLogoItem } from '../data/site'

type LogoCarouselProps = {
  items: CarouselLogoItem[]
  variant: 'products' | 'partners'
  className?: string
}

export function LogoCarousel({ items, variant, className }: LogoCarouselProps) {
  const repeatedItems = Array.from({ length: 8 }, () => items).flat()

  return (
    <div className={clsx('logo-marquee', `logo-marquee-${variant}`, className)} aria-label="Carrossel de logos">
      <div className="logo-marquee__track">
        {repeatedItems.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className={clsx('logo-marquee__item', variant === 'partners' && 'logo-marquee__item-partner')}
          >
            <span className="logo-marquee__logo">
              <img src={item.logo} alt="" loading="lazy" />
            </span>
            {variant === 'products' ? <span className="logo-marquee__name">{item.name}</span> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
