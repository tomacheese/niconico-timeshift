import niconicoClass from './niconico'
import fs from 'fs'
import axios from 'axios'
import { Reservation } from './model/timeshift-reservations'
import { SearchLiveItem } from './model/search-live-result'

const FILE_PATH = {
  CONFIG: '/app/config.json',
  SEARCHWORDS: '/data/searchWords.json',
}

interface Config {
  username: string
  password: string
}

interface SearchWordsModel {
  official: string[]
  channel: string[]
}

async function main() {
  console.log('main()')
  const config: Config = JSON.parse(fs.readFileSync(FILE_PATH.CONFIG, 'utf8'))
  const niconico = await niconicoClass.login(config.username, config.password)

  // 予約済み一覧を取得
  const reserveds = await niconico.getTimeshiftReservation()
  console.log('reserved: ' + reserveds.length + ' / 10')

  // 検索ワードをもとに検索し、予約予定一覧を作成
  const searchWords: SearchWordsModel = JSON.parse(
    fs.readFileSync(FILE_PATH.SEARCHWORDS, 'utf8')
  )

  const preReserved = [
    ...(await getSearchLives(reserveds, 'official', searchWords.official)),
    ...(await getSearchLives(reserveds, 'channel', searchWords.channel)),
  ].sort((a, b) => {
    if (
      a.data.time &&
      b.data.time &&
      a.data.time.startedAt &&
      b.data.time.startedAt
    ) {
      return a.data.time.startedAt.getTime() - b.data.time.startedAt.getTime()
    }
    return 0
  })

  // 既に視聴不能になったタイムシフトを削除
  let deletedCount = 0
  for (const item of reserveds.filter((item) => {
    if (item.timeshiftTicket.expireTime) {
      const expireTime = new Date(item.timeshiftTicket.expireTime)
      if (expireTime.getTime() < Date.now()) {
        // 期限切れの場合は削除
        return true
      }
    }
    if (item.timeshiftSetting.status === 'CLOSED') {
      // タイムシフト終了済みの場合は削除
      return true
    }
    return false
  })) {
    console.log('delete: ' + item.programId)
    await niconico.deleteTimeshift(item.programId)
    deletedCount++
  }
  console.log('preReserved: ' + preReserved.length)

  // 予約可能数を計算
  const reservableCount = 10 - reserveds.length - deletedCount

  // 予約処理
  // 予約可能枠がある場合はそのまま予約、枠がない場合は削除可能なものを探索し削除・予約
  for (const item of preReserved) {
    // 予約可能枠の確認
    if (reservableCount <= 0) {
      // 既存予約のうち、予約しようとしている日時よりあとのものを予約解除
      if (await isExistsAfterReserve(niconico, reserveds, item)) {
        continue
      }
      // ダウンロード済みタイムシフトを削除
      if (isDownloaded(item)) {
        await niconico.deleteTimeshift(item.programId)
        continue
      }
      // 枠の空け失敗
      console.log('reserve failed(upper-limit): ' + item.programId)
      break
    }

    // 予約
    console.log(`title: ${item.title}`)
    console.log(`channel: ${item.user.username}`)
    console.log('reserve: ' + item.programId)
    const result = await niconico.reserveTimeshift(item.programId)
    if (!result.status) {
      console.log('reserve failed: ' + item.programId)
      await axios
        .post('http://discord-deliver', {
          embed: {
            title: `予約失敗: ${item.title}`,
            description: `${result.errorCode}`,
            fields: [
              {
                name: 'チャンネル',
                value: item.user.username,
              },
            ],
            thumbnail: {
              url: item.thumbnailUrl,
            },
            color: 0xff0000,
          },
        })
        .catch(() => null)
      return
    }

    const outputDir = '/data/' + item.programId + '/'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    fs.writeFileSync(outputDir + 'details.json', JSON.stringify(item))

    console.log('reserve success: ' + item.programId)
    await axios
      .post('http://discord-deliver', {
        embed: {
          title: `予約完了: ${item.title}`,
          fields: [
            {
              name: 'チャンネル',
              value: item.user.username,
            },
          ],
          thumbnail: {
            url: item.thumbnailUrl,
          },
          color: 0x00ff00,
        },
      })
      .catch(() => null)
  }
}

async function isExistsAfterReserve(
  niconico: niconicoClass,
  reserveds: Reservation[],
  item: SearchLiveItem
) {
  const afterReserves = reserveds.filter((reserve) => {
    if (reserve.timeshiftSetting.status !== 'BEFORE_OPEN') {
      return false
    }
    if (
      item.data.time &&
      item.data.time.startedAt &&
      new Date(reserve.program.schedule.openTime).getTime() >
        item.data.time.startedAt.getTime()
    ) {
      return true
    }
    return false
  })
  if (afterReserves.length > 0) {
    console.log('delete (after): ' + afterReserves[0].programId)
    await niconico.deleteTimeshift(afterReserves[0].programId)
    return true
  }
  return false
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isDownloaded(_item: SearchLiveItem) {
  return false // TODO
}

async function getSearchLives(
  reserveds: Reservation[],
  providerTypes: 'official' | 'channel' | 'community',
  words: string[]
): Promise<SearchLiveItem[]> {
  console.log('getSearchLives()')
  if (words === undefined || words.length === 0) {
    return []
  }
  const preReserved: SearchLiveItem[] = []

  for (const word of words) {
    const lives = await niconicoClass.searchLive(word, 1, {
      status: 'reserved',
      sortOrder: 'recentDesc',
      providerTypes,
      isTagSearch: false,
      timeshiftIsAvailable: true,
      hideMemberOnly: false,
    })
    console.log(`${word}: ${lives.items.length}`)
    for (const item of lives.items) {
      const isReserved = reserveds.some((reserved) => {
        return reserved.programId === item.programId
      })
      if (isReserved) {
        continue
      }
      preReserved.push(item)
    }
    // pagination必要に応じて対応
  }
  return preReserved
}

;(async () => {
  await main().catch(async (err) => {
    console.error(err)
    await axios
      .post('http://discord-deliver', {
        embed: {
          title: `Error`,
          description: `${err.message}`,
          color: 0xff0000,
        },
      })
      .catch(() => null)
  })
})()
