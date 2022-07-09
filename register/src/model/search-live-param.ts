export type SearchLiveType = 'onair' | 'reserved' | 'past'

export interface SearchLiveParam {
  status?: SearchLiveType
  sortOrder?:
    | 'recentDesc'
    | 'recentAsc'
    | 'timeshiftCountDesc'
    | 'timeshiftCountAsc'
    | 'viewCountDesc'
    | 'viewCountAsc'
    | 'commentCountDesc'
    | 'commentCountAsc'
    | 'userLevelDesc'
    | 'userLevelAsc'
  providerTypes?: 'official' | 'channel' | 'community'
  isTagSearch?: boolean
  timeshiftIsAvailable?: boolean
  // disableGrouping: boolean // Unsupported
  hideMemberOnly?: boolean
}
