import axios from 'axios'
import niconicoClass from './niconico'
import fs from 'fs'
import { execLiveDL } from './lib/livedl'
import { SearchLiveItem } from './model/search-live-result'
import path from 'path'

interface Config {
  username: string
  password: string
}

async function main() {
  console.log('main()')
  const config: Config = JSON.parse(fs.readFileSync('/app/config.json', 'utf8'))
  let niconico = await niconicoClass.login(config.username, config.password)

  // 予約済み一覧を取得
  const reserveds = await niconico.getTimeshiftReservation()
  console.log('reserved: ' + reserveds.length + ' / 10')

  // ダウンロード可能なタイムシフトを取得
  const downloadables = reserveds.filter((item) => {
    if (item.timeshiftSetting.status !== 'OPENED') {
      return false
    }
    if (item.timeshiftTicket.expireTime) {
      const expireTime = new Date(item.timeshiftTicket.expireTime)
      if (expireTime.getTime() < Date.now()) {
        // 期限切れの場合はダウンロード不可
        return false
      }
    }
    return true
  })

  // ダウンロード
  for (const item of downloadables) {
    const programId = item.programId
    if (isDownloaded(programId)) {
      // ダウンロード済みならスキップ
      console.log('downloaded. skip: ' + programId)
      continue
    }
    // 視聴権利処理
    await niconico.useAcceptWatch(programId)

    const outputDir = '/data/' + programId + '/'
    const userSession = fs
      .readFileSync(niconicoClass.SESSIONFILE, 'utf8')
      .toString()

    // conf.dbがあったら削除
    if (fs.existsSync(path.join(outputDir, 'conf.db'))) {
      fs.unlinkSync(path.join(outputDir, 'conf.db'))
    }

    if (!(await niconico.isLogined())) {
      console.log('relogin...')
      niconico = await niconicoClass.login(config.username, config.password)
    }

    // livedlを使ってダウンロード
    const result = await execLiveDL(outputDir, programId, userSession)

    // conf.dbがあったら削除
    if (fs.existsSync(path.join(outputDir, 'conf.db'))) {
      fs.unlinkSync(path.join(outputDir, 'conf.db'))
    }

    if (!result.status) {
      console.log('error: ' + programId)
      console.error(result.error)
      continue
    }
    console.log('downloaded: ' + programId)
    console.log('tryCount: ' + result.tryCount)

    let details: SearchLiveItem | null = null
    if (fs.existsSync(outputDir + 'details.json')) {
      details = JSON.parse(fs.readFileSync(outputDir + 'details.json', 'utf8'))
    }
    const title = details?.title || ''
    const username = details?.user.username || ''
    const thumbnailUrl = details?.thumbnailUrl || ''

    await axios
      .post('http://discord-deliver', {
        embed: {
          title: `ダウンロード完了: ${title}`,
          fields: [
            {
              name: 'チャンネル',
              value: username,
            },
          ],
          thumbnail: {
            url: thumbnailUrl,
          },
          color: 0x00ff00,
        },
      })
      .catch(() => null)

    addDownloaded(programId)
  }
}

function addDownloaded(programId: string) {
  const filePath = '/data/downloaded.json'
  const downloaded = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
    : []
  downloaded.push(programId)
  fs.writeFileSync(filePath, JSON.stringify(downloaded))
}

function isDownloaded(programId: string) {
  const filePath = '/data/downloaded.json'
  const downloaded = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
    : []
  return downloaded.includes(programId)
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
