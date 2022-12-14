import axios, { AxiosInstance } from 'axios'
import cheerio from 'cheerio'
import TimeShiftReservationResult, {
  Reservation,
} from './model/timeshift-reservations'
import fs from 'fs'

export interface ProgramTime {
  startedAt: Date | null
  minutes: number
}

export default class NicoNico {
  public static readonly SESSIONFILE = '/data/session.txt'
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
     * タイムシフト視聴権利処理エンドポイント？ (PATCH)
     *
     * URL内に対象ライブ ID を指定
     */
    ACCEPT_WATCH_TS:
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

  public async useAcceptWatch(programId: string): Promise<boolean> {
    // いまいちわからんけど、PATCHでリクエストを出せば良いっぽい (#75)
    const response = await this.$axios.patch(
      NicoNico.ENDPOINTS.ACCEPT_WATCH_TS.replace('#{programId}', programId),
      {},
      {
        validateStatus: () => true,
      }
    )

    if (response.data.meta.status === 403) {
      console.log(response.data)
      return false
    }

    // {"meta":{"status":200}}
    if (response.data.meta.status !== 200) {
      console.log(response.data)
      return false
    }

    return true
  }
}
