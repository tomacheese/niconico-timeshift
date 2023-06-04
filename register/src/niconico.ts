import axios, { AxiosInstance } from 'axios'
import cheerio from 'cheerio'
import TimeShiftReservationResult, {
  Reservation,
} from './model/timeshift-reservations'
import NicoNicoUser from './model/niconico-user'
import SearchLiveResult, {
  LiveData,
  ProgramType,
  SearchLiveItem,
} from './model/search-live-result'
import { SearchLiveParam, SearchLiveType } from './model/search-live-param'
import ReservationResult from './model/reservation-result'
import fs from 'fs'

export interface ProgramTime {
  startedAt: Date | null
  minutes: number
}

export default class NicoNico {
  private static readonly SESSIONFILE = '/data/session.txt'
  private static readonly ENDPOINTS = {
    /**
     * ログインエンドポイント (POST)
     *
     * @param site niconico
     */
    LOGIN: 'https://secure.nicovideo.jp/secure/login?site=niconico',
    /**
     * タイムシフト一覧エンドポイント (GET)
     */
    GET_TS_RESERVATIONS:
      'https://live.nicovideo.jp/embed/timeshift-reservations',
    /**
     * タイムシフト予約エンドポイント (POST)
     *
     * URL内に対象ライブ ID を指定
     */
    RESERVE_TS:
      'https://live2.nicovideo.jp/api/v2/programs/#{programId}/timeshift/reservation',
    /**
     * タイムシフト削除エンドポイント (DELETE)
     *
     * @param programId プログラムID
     */
    DELETE_TS:
      'https://live2.nicovideo.jp/api/v2/timeshift/reservations?programIds=#{programId}',
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(private $axios: AxiosInstance) {}

  /**
   * ログイン処理を行う
   *
   * @param username ユーザー名
   * @param password パスワード
   * @returns NicoNico オブジェクト
   */
  public static async login(
    username: string,
    password: string
  ): Promise<NicoNico> {
    // Cache
    if (fs.existsSync(NicoNico.SESSIONFILE)) {
      const tempUserSession = fs.readFileSync(NicoNico.SESSIONFILE).toString()
      if (await NicoNico.isLogined(tempUserSession)) {
        return new NicoNico(
          axios.create({
            headers: {
              cookie: `user_session=${tempUserSession}`,
            },
            validateStatus: () => true,
          })
        )
      }
    }

    const params = new URLSearchParams()
    params.append('next_url', '')
    params.append('mail', username)
    params.append('password', password)
    params.append('submit', '')
    const response = await axios.post(this.ENDPOINTS.LOGIN, params, {
      maxRedirects: 0,
      validateStatus: () => true,
    })
    if (response.status !== 302) {
      throw new Error('login failed')
    }
    const cookies = response.headers['set-cookie']
    if (!cookies) {
      throw new Error('login failed')
    }
    const regex = /^user_session=([a-z0-9_]+)/
    const sessionCookie = cookies.reverse().find((cookie) => {
      return regex.test(cookie)
    })
    if (!sessionCookie) {
      throw new Error('login failed (session cookie not found)')
    }
    const match = sessionCookie.match(regex)
    if (!match) {
      throw new Error('login failed (match error)')
    }
    const userSession = match[1]
    if (!(await NicoNico.isLogined(userSession))) {
      throw new Error('login failed (check login error)')
    }
    fs.writeFileSync(NicoNico.SESSIONFILE, userSession)
    return new NicoNico(
      axios.create({
        headers: {
          cookie: `user_session=${userSession}`,
        },
        validateStatus: () => true,
      })
    )
  }

  private static async isLogined(userSession: string): Promise<boolean> {
    const response = await axios
      .create({
        headers: {
          cookie: `user_session=${userSession}`,
        },
        validateStatus: () => true,
        maxRedirects: 0,
      })
      .get('https://www.nicovideo.jp/my/')
    return response.status === 200
  }

  public async isLogined(): Promise<boolean> {
    const response = await this.$axios.get('https://www.nicovideo.jp/my/', {
      maxRedirects: 0,
    })
    return response.status === 200
  }

  /**
   * タイムシフト一覧を取得する
   *
   * @returns タイムシフト一覧
   */
  public async getTimeshiftReservation(): Promise<Reservation[]> {
    const response = await this.$axios.get(
      NicoNico.ENDPOINTS.GET_TS_RESERVATIONS
    )
    if (response.status !== 200) {
      throw new Error(
        'getTimeshiftReservation failed (resCode: ' + response.status + ')'
      )
    }
    const html = response.data
    const $ = cheerio.load(html)

    const propJson = $('script#embedded-data').attr('data-props') as string
    const props: TimeShiftReservationResult = JSON.parse(propJson)

    return props.reservations.reservations
  }

  /**
   * タイムシフトを予約する
   *
   * @param programId プログラムID
   */
  public async reserveTimeshift(programId: string): Promise<ReservationResult> {
    const response = await this.$axios.post(
      NicoNico.ENDPOINTS.RESERVE_TS.replace('#{programId}', programId)
    )
    if (response.status !== 200 && response.status !== 403) {
      throw new Error(
        'reserveTimeshift failed (resCode: ' + response.status + ')'
      )
    }
    const data = response.data
    return {
      status: response.status === 200,
      errorCode: data.meta.errorCode ?? undefined,
      expiryTime: data.data.expiryTime,
    }
  }

  /**
   * タイムシフトを削除する
   */
  public async deleteTimeshift(programId: string): Promise<void> {
    const response = await this.$axios.delete(
      NicoNico.ENDPOINTS.DELETE_TS.replace('#{programId}', programId)
    )
    if (response.status !== 200) {
      throw new Error(
        'deleteTimeshift failed (resCode: ' + response.status + ')'
      )
    }
  }

  /**
   * ニコ生検索ボックスから検索を行う
   *
   * @param word 検索ワード
   * @param page ページ
   * @param params パラメーター
   * @returns 検索結果
   */
  public static async searchLive(
    word: string,
    page = 1,
    params: SearchLiveParam = {
      status: 'reserved',
      sortOrder: 'recentDesc',
      providerTypes: 'official',
      isTagSearch: false,
      timeshiftIsAvailable: true,
      hideMemberOnly: false,
    }
  ): Promise<SearchLiveResult> {
    const url = 'https://live.nicovideo.jp/search'
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
        Referer: 'https://www.nicovideo.jp/',
      },
      params: {
        q: word,
        page,
        disableGrouping: true,
        ...params,
      },
      validateStatus: () => true,
    })
    if (response.status !== 200) {
      throw new Error('searchLive failed (resCode: ' + response.status + ')')
    }

    const html = response.data
    const $ = cheerio.load(html)
    const programList = $('ul[class^="___program-card-list___"]:first')
    if (programList.length === 0) {
      throw new Error('searchLive failed (programList not found)')
    }
    const programs = programList.find('li[class^="___program-card___"]')
    const items: SearchLiveItem[] = []
    for (const program of programs) {
      const statusLabelElement = $(program).find(
        'div[class^="___status-label-"]'
      )
      const statusLabel = statusLabelElement.text() // LIVE | 放送予定 | タイムシフト | 公開終了
      const programType: ProgramType =
        statusLabel === 'LIVE'
          ? 'LIVE'
          : statusLabel === '放送予定'
          ? 'FUTURE'
          : statusLabel === 'タイムシフト'
          ? 'TIMESHIFT'
          : statusLabel === '公開終了'
          ? 'CLOSED'
          : 'UNKNOWN'
      const thumbnailUrl = $(program)
        .find('img[class^="___program-card-thumbnail-image___"]')
        .attr('src') as string
      const titleElement = $(program).find(
        'a[class^="___program-card-title-anchor___"]'
      )
      const title = titleElement.text().trim()
      const url = titleElement.attr('href')
      const programId = url?.substring(url.lastIndexOf('/') + 1) as string
      const description = $(program)
        .find('p[class^="___program-card-description___"]')
        .text()
        .trim()

      const data = NicoNico.parseProgramData($, params.status, program)
      const user = NicoNico.parseProgramUser($, program)

      items.push({
        programId,
        title,
        description,
        programType,
        thumbnailUrl,
        data,
        user,
      })
    }

    const prev =
      $('button[class^="___page-selector___"][data-name="prev"]').length > 0
    const next =
      $('button[class^="___page-selector___"][data-name="next"]').length > 0

    return {
      items,
      pagination: {
        prev,
        next,
      },
    }
  }

  private static parseProgramData(
    $: cheerio.Root,
    type: SearchLiveType | undefined,
    program: cheerio.Element
  ): LiveData {
    const dataElements = $(program).find(
      'ul[class^="___program-card-statistics___"] > li[class^="___program-card-statistics-item___"]'
    )

    let time: ProgramTime | null = null
    let visitors: number | null = null
    let comments: number | null = null
    let timeshift: number | null = null

    const regex = /^___program-card-statistics-icon-(.+)___$/
    for (const dataElement of dataElements) {
      const element = $(dataElement)
      const iconElement = element.find(
        'span[class^="___program-card-statistics-icon-"]'
      )
      if (iconElement.length === 0) {
        time = type ? this.parseProgramTime(type, element.text().trim()) : null
        continue
      }

      const iconType = iconElement.attr('class')
      if (!iconType) {
        continue
      }
      const match = iconType.match(regex)
      if (!match) {
        continue
      }
      const iconTypeName = match[1]
      switch (iconTypeName) {
        case 'visitors':
          visitors = parseInt(element.text())
          break
        case 'comment':
          comments = parseInt(element.text())
          break
        case 'timeshift':
          timeshift = parseInt(element.text())
          break
      }
    }

    return {
      time,
      visitors,
      comments,
      timeshift,
    }
  }

  private static parseProgramTime(
    type: SearchLiveType,
    str: string
  ): ProgramTime {
    const hourRegex = '(\\d+)時間'
    const minuteRegex = '(\\d+)分'
    const dateRegex = '(\\d+)/(\\d+)/(\\d+) (\\d+):(\\d+)'

    let minutes = 0
    if (type === 'onair' || type === 'past') {
      const hourMatch = str.match(hourRegex)
      if (hourMatch) {
        minutes += parseInt(hourMatch[1]) * 60
      }
      const minuteMatch = str.match(minuteRegex)
      if (minuteMatch) {
        minutes += parseInt(minuteMatch[1])
      }
    }

    let startedAt: Date | null = null
    if (type === 'reserved' || type === 'past') {
      const dateMatch = str.match(dateRegex)
      if (dateMatch) {
        const year = parseInt(dateMatch[1])
        const month = parseInt(dateMatch[2]) - 1
        const day = parseInt(dateMatch[3])
        const hour = parseInt(dateMatch[4])
        const minute = parseInt(dateMatch[5])
        startedAt = new Date(year, month, day, hour, minute)
      }
    }

    return {
      minutes,
      startedAt,
    }
  }

  private static parseProgramUser(
    $: cheerio.Root,
    program: cheerio.Element
  ): NicoNicoUser {
    const userElement = $(program).find(
      'div[class^="___program-card-provider___"]'
    )
    const username = userElement
      .find('p[class^="___program-card-provider-name___"]')
      .text()
      .trim()
    const userUrl = userElement
      .find(
        'p[class^="___program-card-provider-name___"] > a[class^="___program-card-provider-name-link___"]'
      )
      .attr('href')
    if (!userUrl) {
      throw new Error('parseProgramUser failed')
    }
    const userId = userUrl.substring(userUrl.lastIndexOf('/') + 1)
    const iconUrl = userElement
      .find('img[class^="___program-card-provider-icon-image___"]')
      .attr('src')

    if (!iconUrl) {
      throw new Error('parseProgramUser failed')
    }

    return {
      username,
      userId,
      iconUrl,
    }
  }
}
