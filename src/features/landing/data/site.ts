import civicImage from '@assets/images/civic.jpg'
import dirtyCarImage from '@assets/images/sujo.jpg'
import horizontalLogo from '@assets/logos/zelo_horizontal_logo_png.png'
import iconLogo from '@assets/logos/zelo_icon_png.png'
import mainLogo from '@assets/logos/zelo_logo_png.png'
import omnyatechLogo from '@assets/parceiros/omnyatech.svg'
import skgLogo from '@assets/parceiros/skg.svg'
import vintexLogo from '@assets/produtos/vintex.png'
import vonixxLogo from '@assets/produtos/vonixx.png'

export const siteConfig = {
  horizontalLogo,
  iconLogo,
  mainLogo,
  instagramHandle: '@zelo_autoestetica',
  instagramLink: 'https://www.instagram.com/zelo_autoestetica/',
  instagramFeedEndpoint: import.meta.env.VITE_INSTAGRAM_FEED_ENDPOINT ?? '',
  instagramGraphUserId: import.meta.env.VITE_INSTAGRAM_GRAPH_USER_ID ?? '',
  instagramAccessToken: import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN ?? '',
  whatsappLink:
    'https://wa.me/556496161968?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20or%C3%A7amento%20para%20meu%20ve%C3%ADculo.',
}

export const heroCopy = {
  title: 'MAIS QUE LIMPEZA. CUIDADO.',
  description:
    'Estética automotiva premium para carros e motos. Técnica, produtos de alta performance e atenção a cada detalhe do seu veículo.',
}

export const sectionLinks = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Instagram', href: '#instagram' },
  { label: 'Localização', href: '#localizacao' },
]

export const footerLinks = [
  { label: 'Início', href: '#hero' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Instagram', href: '#instagram' },
  { label: 'Localização', href: '#localizacao' },
]

export type ServiceItem = {
  title: string
  description: string
  icon: 'wash' | 'interior' | 'seats' | 'carpet'
  eyebrow: string
}

export const services: ServiceItem[] = [
  {
    title: 'Lavagem Completa',
    description:
      'Remoção profunda de contaminantes e poeira, sem agredir a pintura, preservando o verniz original.',
    icon: 'wash',
    eyebrow: 'Lavagem',
  },
  {
    title: 'Limpeza Interna',
    description:
      'Higienização completa do interior, do painel aos detalhes que ninguém vê.',
    icon: 'interior',
    eyebrow: 'Interior',
  },
  {
    title: 'Higienização de Bancos',
    description:
      'Remoção de manchas e odores, com produtos bactericidas e reidratação do couro/tecido.',
    icon: 'seats',
    eyebrow: 'Bancos',
  },
  {
    title: 'Higienização de Carpete',
    description:
      'Extração profunda que restaura as fibras e elimina odores na base do veículo.',
    icon: 'carpet',
    eyebrow: 'Carpete',
  },
]

export type CarouselLogoItem = {
  name: string
  logo: string
}

export const productBrands: CarouselLogoItem[] = [
  { name: 'Vonixx', logo: vonixxLogo },
  { name: 'Vintex', logo: vintexLogo },
]

export const partnerLogos: CarouselLogoItem[] = [
  { name: 'OmnyaTech', logo: omnyatechLogo },
  { name: 'SKG', logo: skgLogo },
]

export const instagramPosts = [
  {
    id: '1',
    image: dirtyCarImage,
    alt: 'Veículo coberto por barro passando por processo de lavagem detalhada.',
    postUrl: siteConfig.instagramLink,
    className: 'object-center',
  },
  {
    id: '2',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1HTNZKOKjt0KDg5Dwausnlxr8ksomaohZ6yZbgTk-34b0uA78a_cKKQgpcjSVxMwRabnlZ3QXlm08MlbfrNhoxxsLNGmM-6KB3as0MS-KTO9iLOwf3Su0gFJBk-60bnUTH-boIDyi0-wT5VGSCishbKai--gyLdm0eA2cfPmUVGdC3U99NV9EJwR_B4-UuqyYgcAHxh20ix1C-n7GKK3TOfXQmD8qXpfj1IBwTu7fRDcOgxXVBbNy',
    alt: 'Capô com reflexos intensos de estúdio, evidenciando acabamento premium.',
    postUrl: siteConfig.instagramLink,
    className: '',
  },
  {
    id: '3',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDztBSxGjlhXIkkhz59RmnBdp0i4hPEJBvS0WqE387G22d-FJpIH8fP1Jlt13nHwusSCiUYkCWAPfeqkJpChico6TjyuQgifv3PfW8vkhQd1LxjYbZHaUUW2Tsiy3LMm8BVNLu0mqX-mOYoCWFOA-KDQkTGK4HxULQfj0NLCqQCIxI-Vp9UL-RUx-OQTWwSAyYZ4cYhz_hNaF6RT4Ek0eMuHR72pkfPiUgsIQqh7LPNk7ojDidD92jp',
    alt: 'Interior limpo com foco em bancos e painel revitalizados.',
    postUrl: siteConfig.instagramLink,
    className: '',
  },
  {
    id: '4',
    image: civicImage,
    alt: 'Honda Civic preto com acabamento brilhante visto de cima.',
    postUrl: siteConfig.instagramLink,
    className: 'object-top',
  },
  {
    id: '5',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDPQZhI285JZ7CTdD8udbP3mYvCT2FtlBacmbdvC19hQ2-aEK5lTRXIHtjSLMKTWcwh6zOiiJpg8C596zGB8cU4Ax4TczeiGTsxraHmXMoYLqry-n3ZbiGA0znq_ZN2LAg0MYXhRIxHV3V7zSf6WL4UZylzzYngCTy7w3QKdmht6pQuldp64be3GMQsDs3OYYgkQ99ycE673QTk_Hws0uUEuxjew7XQfWCtzkiN_2WKhEby7rWjIITN',
    alt: 'Roda metálica detalhada com acabamento limpo e contraste alto.',
    postUrl: siteConfig.instagramLink,
    className: '',
  },
  {
    id: '6',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_V3G6ehvDBm0uIZ8RUtOOL9iLyz_XdlcUK8cCmYmwN2I5fFFrZzwU2Bb2fUWcyGyMAcK8BtTgSJ3UNU0o0PsFZoVEPHK3QVfMWXIwwrHopDLqdNje7OuZI840IsnytwHkIf3gVVYrPNCv_6L4nPQ06LYK21vA0s14xzPHKpR8Uosz7RQlSNJ3eZ6W7gyVaW28GFL4cxdmfkksF3xQNNmRAus-Ubp8RxitaQNOzc3g-w_6FIK2X8EZ',
    alt: 'Produtos de estética automotiva organizados em bancada premium.',
    postUrl: siteConfig.instagramLink,
    className: '',
  },
  {
    id: '7',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3iRQJDqfbBxBAbBhAnL-i5xxsPGNObgoVZ1o_4W1odulUeCZuPQbQp8_76nogUXZMzVK5h26Nkoci-MR45mrVvr-xZtBl771qNKam8PLxQkozUzSrqyMKHD8lLo7a5cTPnNCW8KTPxjI2-yRAgBe34FqIpOZW4-Wj1LtIuCncYcmJ8X1EehCcuFvSaqtu7-bhIpGEYA93uEnsdzNnkdPMhmKWuVBCHJpt2h9h9nJPjM8eOSHH87rF',
    alt: 'Lavagem técnica de carro clássico em ambiente escuro e controlado.',
    postUrl: siteConfig.instagramLink,
    className: '',
  },
  {
    id: '8',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAGaVGiUPz11VGe2kkbd_IK_zXuxMPSsYrWU-GuINiWdW_iEhOkRzev0U_NkwRcWPwOKOOg50_Fmo5BmnHnt3mlRoJQClFWK_mq9yhvZznKHTwB2otwrFuq-qrg3ZqNOOJqQ9PV4zB8LRnyxNVwQwoONwr-Nmzw3tj00C0BQJdmEsOU7R_MOKfxRup5m-rQ94aqUfU1JqctxjvOwhpoVnSoXlCehQAYGJ3sbosoQCVfRIzdVxvi7RWn',
    alt: 'Carro azul com pintura refletiva e sem marcas de swirl.',
    postUrl: siteConfig.instagramLink,
    className: '',
  },
  {
    id: '9',
    image: civicImage,
    alt: 'Carro com acabamento refinado em enquadramento superior.',
    postUrl: siteConfig.instagramLink,
    className: 'object-center',
  },
]

export const locationInfo = {
  address: 'Atendimento com agendamento prévio. Use o mapa para abrir a rota da Zelo Estética Automotiva.',
  phoneLabel: 'WhatsApp: +55 64 9616-1968',
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=Zelo%20Est%C3%A9tica%20Automotiva',
  embedUrl:
    'https://www.google.com/maps?q=Zelo%20Est%C3%A9tica%20Automotiva&z=14&output=embed',
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
    label: 'Sábado',
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
    description: 'Resposta imediata e agendamento rápido.',
    buttonLabel: 'Faça um orçamento',
    href: siteConfig.whatsappLink,
  },
  {
    type: 'instagram',
    title: 'Instagram',
    description: 'Veja nosso portfólio completo e tire suas dúvidas.',
    buttonLabel: 'Ir para o perfil',
    href: siteConfig.instagramLink,
  },
] as const
