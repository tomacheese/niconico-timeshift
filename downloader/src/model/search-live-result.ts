import { ProgramTime } from '@/niconico'
import NicoNicoUser from './niconico-user'

export interface LiveData {
  time: ProgramTime | null
  visitors: number | null
  comments: number | null
  timeshift: number | null
}

export type ProgramType = 'LIVE' | 'FUTURE' | 'TIMESHIFT' | 'CLOSED' | 'UNKNOWN'

export interface SearchLiveItem {
  programId: string
  title: string
  description: string
  programType: ProgramType
  thumbnailUrl: string
  data: LiveData
  user: NicoNicoUser
}

export default interface SearchLiveResult {
  items: SearchLiveItem[]
  pagination: {
    prev: boolean
    next: boolean
  }
}
