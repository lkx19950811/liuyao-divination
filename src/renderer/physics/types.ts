export interface CoinPhysicsOptions {
  containerWidth: number
  containerHeight: number
  coinRadius: number
  gravity: { x: number; y: number }
  friction: number
  restitution: number
  onLog?: (msg: string) => void
}

export interface CoinState {
  id: number
  position: { x: number; y: number }
  rotation: number
  isHeads: boolean
  velocity: { x: number; y: number }
  angularVelocity: number
  isStable: boolean
}

export interface ShakeMetadata {
  timestamp: number
  force: { x: number; y: number }
  duration: number
}

export interface TossResult {
  coins: CoinState[]
  yaoType: 'yin' | 'yang' | 'oldYin' | 'oldYang'
  isStable: boolean
}

export type PhysicsEvent = 'coinLanded' | 'allStable' | 'tossComplete'

export interface PhysicsEventDataMap {
  coinLanded: { coin: CoinState }
  allStable: { coins: CoinState[] }
  tossComplete: { result: TossResult }
}