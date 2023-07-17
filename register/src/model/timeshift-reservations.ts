export interface TrackingParams {
  siteId: string
  pageId: string
  mode: string
}

export interface Account {
  loginPageUrl: string
  logoutPageUrl: string
  accountRegistrationPageUrl: string
  currentPageUrl: string
  premiumMemberRegistrationPageUrl: string
  contactsPageUrl: string
  verifyEmailsPageUrl: string
  profileRegistrationPageUrl: string
  trackingParams: TrackingParams
  premiumMeritPageUrl: string
  accountSystemBapiBaseUrl: string
}

export interface App {
  topPageUrl: string
}

export interface Channel {
  topPageUrl: string
  forOrganizationAndCompanyPageUrl: string
}

export interface Commons {
  topPageUrl: string
}

export interface Community {
  topPageUrl: string
}

export interface Dic {
  topPageUrl: string
}

export interface Gift {
  topPageUrl: string
}

export interface Help {
  liveHelpPageUrl: string
  systemRequirementsPageUrl: string
}

export interface Ichiba {
  topPageUrl: string
}

export interface News {
  topPageUrl: string
}

export interface Nicoad {
  topPageUrl: string
}

export interface Niconico {
  topPageUrl: string
  userPageBaseUrl: string
}

export interface Point {
  topPageUrl: string
  purchasePageUrl: string
}

export interface Seiga {
  topPageUrl: string
  seigaPageBaseUrl: string
  comicPageBaseUrl: string
}

export interface Site2 {
  salesAdvertisingPageUrl: string
  liveAppDownloadPageUrl: string
  videoPremiereIntroductionPageUrl: string
  premiumContentsPageUrl: string
  creatorMonetizationInformationPageUrl: string
}

export interface Solid {
  topPageUrl: string
}

export interface Video {
  topPageUrl: string
  myPageUrl: string
  uploadedVideoListPageUrl: string
  watchPageBaseUrl: string
  liveWatchHistoryPageUrl: string
  ownedTicketsPageUrl: string
  purchasedSerialsPageUrl: string
  timeshiftReservationsPageUrl: string
}

export interface Faq {
  pageUrl: string
}

export interface Bugreport {
  pageUrl: string
}

export interface RightsControlProgram {
  pageUrl: string
}

export interface LicenseSearch {
  pageUrl: string
}

export interface Info {
  warnForPhishingPageUrl: string
  nintendoGuidelinePageUrl: string
}

export interface Search {
  suggestionApiUrl: string
}

export interface Nicoex {
  apiBaseUrl: string
}

export interface Superichiba {
  apiBaseUrl: string
  launchApiBaseUrl: string
  oroshiuriIchibaBaseUrl: string
}

export interface NAir {
  topPageUrl: string
}

export interface Akashic {
  untrustedFrameUrl: string
}

export interface Emotion {
  baseUrl: string
}

export interface Nicokoken {
  topPageUrl: string
  helpPageUrl: string
}

export interface FamilyService {
  account: Account
  app: App
  channel: Channel
  commons: Commons
  community: Community
  dic: Dic
  gift: Gift
  help: Help
  ichiba: Ichiba
  news: News
  nicoad: Nicoad
  niconico: Niconico
  point: Point
  seiga: Seiga
  site: Site2
  solid: Solid
  video: Video
  faq: Faq
  bugreport: Bugreport
  rightsControlProgram: RightsControlProgram
  licenseSearch: LicenseSearch
  info: Info
  search: Search
  nicoex: Nicoex
  superichiba: Superichiba
  nAir: NAir
  akashic: Akashic
  emotion: Emotion
  nicokoken: Nicokoken
}

export interface Environments {
  runningMode: string
}

export interface Relive {
  apiBaseUrl: string
}

export interface Information {
  maintenanceInformationPageUrl: string
}

export interface Rule {
  agreementPageUrl: string
  guidelinePageUrl: string
}

export interface Spec {
  watchUsageAndDevicePageUrl: string
  broadcastUsageDevicePageUrl: string
  cruisePageUrl: string
}

export interface Ad {
  adsApiBaseUrl: string
}

export interface Timeshift {
  reservationDetailListApiUrl: string
}

export interface Nicobus {
  publicApiBaseUrl: string
}

export interface Gift2 {
  cantOpenPageCausedAdBlockHelpPageUrl: string
}

export interface CreatorPromotionProgram {
  registrationHelpPageUrl: string
}

export interface Stream {
  lowLatencyHelpPageUrl: string
}

export interface CommentRender {
  liteModeHelpPageUrl: string
}

export interface Performance {
  commentRender: CommentRender
}

export interface Nico {
  webPushNotificationReceiveSettingHelpPageUrl: string
}

export interface Akashic2 {
  switchRenderHelpPageUrl: string
}

export interface Device {
  watchOnPlayStation4HelpPageUrl: string
  safariCantWatchHelpPageUrl: string
}

export interface Authony {
  apiBaseUrl: string
}

export interface Payment {
  eventPageBaseUrl: string
  productPageBaseUrl: string
}

export interface ExternalWatch {
  baseUrl: string
}

export interface ChannelRegistration {
  multiSubscriptionWithPremiumBenefitHelpPageUrl: string
}

export interface BroadcastRequest {
  apiBaseUrl: string
}

export interface KonomiTag {
  usageHelpPageUrl: string
}

export interface Site {
  locale: string
  serverTime: number
  apiBaseUrl: string
  pollingApiBaseUrl: string
  staticResourceBaseUrl: string
  topPageUrl: string
  programCreatePageUrl: string
  programEditPageUrl: string
  myPageUrl: string
  rankingPageUrl: string
  searchPageUrl: string
  focusPageUrl: string
  followedProgramsPageUrl: string
  timetablePageUrl: string
  programWatchPageUrl: string
  recentPageUrl: string
  namaGamePageUrl: string
  familyService: FamilyService
  environments: Environments
  relive: Relive
  information: Information
  rule: Rule
  spec: Spec
  ad: Ad
  timeshift: Timeshift
  nicobus: Nicobus
  frontendId: number
  frontendVersion: string
  party1staticBaseUrl: string
  party1binBaseUrl: string
  party2binBaseUrl: string
  gift: Gift2
  creatorPromotionProgram: CreatorPromotionProgram
  stream: Stream
  performance: Performance
  nico: Nico
  akashic: Akashic2
  device: Device
  frontendPublicApiUrl: string
  nicoCommonHeaderResourceBaseUrl: string
  authony: Authony
  payment: Payment
  externalWatch: ExternalWatch
  channelRegistration: ChannelRegistration
  broadcastRequest: BroadcastRequest
  konomiTag: KonomiTag
}

export interface Assets {
  [key: string]: string
}

export interface Superichiba2 {
  deletable: boolean
  hasBroadcasterRole: boolean
}

export interface User {
  id: string
  nickname: string
  isLoggedIn: boolean
  accountType: string
  isOperator: boolean
  isBroadcaster: boolean
  premiumOrigin: string
  permissions: unknown[]
  isMailRegistered: boolean
  isProfileRegistered: boolean
  isMobileMailAddressRegistered: boolean
  isExplicitlyLoginable: boolean
  superichiba: Superichiba2
  iconUrl: string
}

export interface Recommend {
  recommendFrame: string
}

export interface Header {
  sortType: string
  filter: unknown
}

export interface ProgramListSection {
  header: Header
}

export interface ResultInformation {
  informationCode: string
}

export interface View {
  programListSection: ProgramListSection
  resultInformation: ResultInformation
}

export interface Features {
  enabled: string[]
}

export interface Schedule {
  status: string
  openTime: string
  beginTime: string
  endTime: string
}

export interface Program {
  title: string
  description: string
  provider: string
  schedule: Schedule
}

export interface ProgramProvider {
  name: string
  profileUrl: string
  type: string
}

export interface SocialGroup {
  companyName: string
  description: string
  isFollowed: boolean
  isPayChannel: boolean
  name: string
  socialGroupId: string
  thumbnail: string
  thumbnailSmall: string
  type: string
  isClosed?: boolean
  isDeleted?: boolean
  isJoined?: boolean
}

export interface Statistics {
  comments: number
  id: string
  timeshiftReservations: number
  viewers: number
}

export interface Huge {
  s1280x720: string
  s1920x1080: string
  s352x198: string
  s640x360: string
}

export interface Thumbnail {
  large: string
  small: string
  huge: Huge
}

export interface TimeshiftSetting {
  watchLimit: string
  requirement: string
  status: string
  endTime?: string
  reservationDeadline: string
}

export interface TimeshiftTicket {
  expireTime?: string
  reserveTime: string
}

export interface Reservation {
  features: Features
  isActive: boolean
  program: Program
  programId: string
  programProvider: ProgramProvider
  socialGroup: SocialGroup
  statistics: Statistics
  thumbnail: Thumbnail
  timeshiftSetting?: TimeshiftSetting
  timeshiftTicket: TimeshiftTicket
}

export interface Reservations {
  reservations: Reservation[]
}

export interface Restriction {
  developmentFeatures: unknown[]
}

export default interface TimeShiftReservationResult {
  site: Site
  assets: Assets
  user: User
  recommend: Recommend
  view: View
  reservations: Reservations
  restriction: Restriction
}
