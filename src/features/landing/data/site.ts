import horizontalLogo from '@assets/logos/zelo_horizontal_logo_png_optimized.png'
import iconLogo from '@assets/logos/zelo_icon_png_optimized.png'
import mainLogo from '@assets/logos/zelo_logo_png_optimized.png'
import omnyatechLogo from '@assets/parceiros/omnyatech.png'
import skgLogo from '@assets/parceiros/skg.svg'
import vintexLogo from '@assets/produtos/vintex-official-wordmark.webp'
import vonixxLogo from '@assets/produtos/vonixx.png'
import zacsLogo from '@assets/produtos/zacs.jpg'


export const siteConfig = {
  horizontalLogo,
  iconLogo,
  mainLogo,
  instagramHandle: '@zelo_autoestetica',
  instagramLink: 'https://www.instagram.com/zelo_autoestetica/',
  whatsappLink:
    'https://wa.me/5564996161968?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20or%C3%A7amento%20para%20meu%20ve%C3%ADculo.',
}

export const heroCopy = {
  titleLines: ['Seu carro merece', 'mais que um balde', 'e uma esponja'],
  description:
    'Seu carro conta uma hist\u00f3ria sobre voc\u00ea antes mesmo de voc\u00ea abrir a boca. Est\u00e9tica automotiva premium para carros e motos - t\u00e9cnica de showroom, produtos de alta performance, e o tipo de acabamento que faz as pessoas olharem duas vezes.',
}

export const instagramCopy = {
  description:
    'Antes e depois n\u00e3o \u00e9 s\u00f3 marketing - \u00e9 o que a gente faz todo dia. Veja de perto o que a t\u00e9cnica certa \u00e9 capaz de fazer.',
}

export const contactSectionCopy = {
  headline: 'SEU CARRO J\u00c1 SABE QUE PRECISA DISSO.',
  description:
    'Poucos minutos separam o carro que voc\u00ea tem do carro que voc\u00ea queria ter. Fale com a gente agora.',
}

export const sectionLinks = [
  { label: 'Servi\u00e7os', href: '#servicos' },
  { label: 'Instagram', href: '#instagram' },
  { label: 'Localiza\u00e7\u00e3o', href: '#localizacao' },
]

export const footerLinks = [
  { label: 'In\u00edcio', href: '#hero' },
  { label: 'Servi\u00e7os', href: '#servicos' },
  { label: 'Instagram', href: '#instagram' },
  { label: 'Localiza\u00e7\u00e3o', href: '#localizacao' },
]

export type ServiceItem = {
  title: string
  description: string
  icon: 'wash' | 'interior' | 'seats' | 'carpet'
  eyebrow: string
}

const serviceWhatsappMessages: Record<ServiceItem['icon'], string> = {
  wash: 'Olá! Gostaria de um orçamento para a Lavagem Completa do meu veículo. Quais horários estão disponíveis?',
  interior: 'Olá! Tenho interesse na Limpeza Interna do meu veículo. Podem informar o orçamento e os cuidados incluídos para o interior?',
  seats: 'Olá! Preciso de Higienização de Bancos. Gostaria de avaliar a limpeza do material e de possíveis manchas. Podem me passar um orçamento?',
  carpet: 'Olá! Tenho interesse na Higienização de Carpete do meu veículo. Podem orientar sobre a limpeza e o tratamento de odores, além do orçamento?',
}

export function serviceWhatsappLink(service: Pick<ServiceItem, 'icon'>) {
  const url = new URL(siteConfig.whatsappLink)
  url.searchParams.set('text', serviceWhatsappMessages[service.icon])
  return url.toString()
}

export const services: ServiceItem[] = [
  {
    title: 'Lavagem Completa',
    description:
      'Remo\u00e7\u00e3o profunda de contaminantes e poeira, sem agredir a pintura, preservando o verniz original.',
    icon: 'wash',
    eyebrow: 'Lavagem',
  },
  {
    title: 'Limpeza Interna',
    description:
      'Higieniza\u00e7\u00e3o completa do interior, do painel aos detalhes que ningu\u00e9m v\u00ea.',
    icon: 'interior',
    eyebrow: 'Interior',
  },
  {
    title: 'Higieniza\u00e7\u00e3o de Bancos',
    description:
      'Remo\u00e7\u00e3o de manchas e odores, com produtos bactericidas e reidrata\u00e7\u00e3o do couro/tecido.',
    icon: 'seats',
    eyebrow: 'Bancos',
  },
  {
    title: 'Higieniza\u00e7\u00e3o de Carpete',
    description:
      'Extra\u00e7\u00e3o profunda que restaura as fibras e elimina odores na base do ve\u00edculo.',
    icon: 'carpet',
    eyebrow: 'Carpete',
  },
]

export type CarouselLogoItem = {
  name: string
  logo: string
  style?: 'product' | 'partner'
  href?: string
}

export const productBrands: (CarouselLogoItem & { href: string })[] = [
  { name: 'Vonixx', logo: vonixxLogo, style: 'product', href: 'https://www.vonixx.com.br/' },
  { name: 'Vintex', logo: vintexLogo, style: 'product', href: 'https://vintex.com.br/' },
  { name: 'Zacs', logo: zacsLogo, style: 'product', href: 'https://zacs.com.br/' },
]

export const partnerLogos: CarouselLogoItem[] = [
  { name: 'OmnyaTech', logo: omnyatechLogo, style: 'partner' },
  { name: 'SKG', logo: skgLogo, style: 'partner', href: 'https://www.instagram.com/skgclub.lamartine/' },
]

export const locationInfo = {
  address: 'R. Ant\u00f4nio Hor\u00e1cio Pereira, 1485 - Lot. Ipanema, Catal\u00e3o - GO, 75705-150',
  phoneLabel: 'WhatsApp: (64) 99616-1968',
  mapsLink: 'https://maps.app.goo.gl/9twSEgWic6k4YYyf7',
  embedUrl:
    'https://www.google.com/maps?q=R.%20Ant%C3%B4nio%20Hor%C3%A1cio%20Pereira%2C%201485%20-%20Lot.%20Ipanema%2C%20Catal%C3%A3o%20-%20GO%2C%2075705-150&z=16&output=embed',
}

type ScheduleRow = {
  key: 'weekdays' | 'saturday' | 'sunday'
  label: string
  hours: string
  hoursRange: { start: number; end: number } | null
  closed?: boolean
}

export const scheduleRows: ScheduleRow[] = [
  {
    key: 'weekdays',
    label: 'Segunda - Sexta',
    hours: '08:00 - 18:00',
    hoursRange: { start: 8 * 60, end: 18 * 60 },
  },
  {
    key: 'saturday',
    label: 'S\u00e1bado',
    hours: '08:00 - 14:00',
    hoursRange: { start: 8 * 60, end: 14 * 60 },
  },
  {
    key: 'sunday',
    label: 'Domingo',
    hours: 'Fechado',
    hoursRange: null,
    closed: true,
  },
]

export const contactCards = [
  {
    type: 'whatsapp',
    title: 'WhatsApp',
    description: 'Sem enrola\u00e7\u00e3o: resposta r\u00e1pida, hor\u00e1rio marcado, or\u00e7amento claro.',
    buttonLabel: 'Fa\u00e7a um or\u00e7amento',
    href: siteConfig.whatsappLink,
  },
  {
    type: 'instagram',
    title: 'Instagram',
    description: 'Quer ver o trabalho antes de decidir? Nosso perfil \u00e9 a prova.',
    buttonLabel: 'Ir para o perfil',
    href: siteConfig.instagramLink,
  },
] as const
