import clsx from 'clsx'
import type { CarouselLogoItem } from '../data/site'

type LogoCarouselProps = {
  items: CarouselLogoItem[]
  variant: 'products' | 'partners'
  className?: string
}

export function LogoCarousel({ items, variant, className }: LogoCarouselProps) {
  const repeatCount = variant === 'partners' ? 8 : 6
  const repeatedItems = Array.from({ length: repeatCount }, () => items).flat()
  const showNames = variant === 'products'

  return (
    <div className={clsx('logo-marquee', `logo-marquee-${variant}`, className)} aria-label="Carrossel de logos">
      <div className="logo-marquee__track">
        {repeatedItems.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className={clsx('logo-marquee__item', variant === 'partners' && 'logo-marquee__item-partner')}
            aria-hidden={index >= items.length}
          >
            <span
              className={clsx(
                'logo-marquee__logo',
                item.style === 'partner' && 'logo-marquee__logo-partner',
                item.style === 'product' && 'logo-marquee__logo-product',
              )}
              data-brand={item.name.toLowerCase()}
            >
              <img src={item.logo} alt="" loading="lazy" decoding="async" />
            </span>
            {showNames ? <span className="logo-marquee__name">{item.name}</span> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
