export {}
declare global {
  interface Window {
    __ZELO_HERO_BOOTSTRAP__?: { state: 'waiting' | 'playing' | 'settled'; startedAt: number; artwork: { backdrop?: boolean; car?: boolean } }
  }
}
