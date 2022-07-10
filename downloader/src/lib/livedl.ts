import { spawn } from 'child_process'
import fs from 'fs'

const livedlPath = '/bin/livedl'

export async function execLiveDL(
  outputDir: string,
  programId: string,
  userSession: string
): Promise<{
  status: boolean
  tryCount?: number | undefined
  error?: Error | undefined
}> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // @see https://github.com/nnn-revo2012/livedl/blob/fd0ca7a435b6d9756775a78525093d22b7b08aaf/src/options/options.go#L91
  const livedlArgs = [
    '-no-chdir', // 起動する時chdirしない(conf.dbは起動したディレクトリに作成されます)
    '-nico', // ニコニコ生放送の録画
    '-nico-session', // Cookie[user_session]を指定する
    userSession,
    '-nico-login-only=on', // 必ずログイン状態で録画する
    '-nico-fast-ts', // 倍速タイムシフト録画を行う(新配信タイムシフト)
    '-nico-auto-convert=off', // 録画終了後自動的にMP4に変換しないように設定 (ffmpegがないため)
    '-nico-format', // 保存時のファイル名を指定する
    programId,
    '--',
    programId,
  ]

  let tryCount = 0
  while (true) {
    type Result = 'SUCCESS' | 'RETRY'
    const promise = new Promise<Result>((resolve, reject) => {
      const process = spawn(livedlPath, livedlArgs, {
        cwd: outputDir,
      })
      let isPlaylistEnd = false
      let isCommentDone = false
      process.stdout.on('data', (data) => {
        console.log(data.toString())
        if (data.toString().includes('playlist end.')) {
          isPlaylistEnd = true
        }
        if (data.toString().includes('Comment done.')) {
          isCommentDone = true
        }
      })
      process.stderr.on('data', (data) => {
        console.error(data.toString())
      })
      process.on('close', (code) => {
        if (isPlaylistEnd && isCommentDone) {
          resolve('SUCCESS')
        } else if (code === 0) {
          resolve('RETRY')
        } else {
          reject(code)
        }
      })
    })
    try {
      const result = await promise
      if (result === 'SUCCESS') {
        break
      }
      if (result === 'RETRY') {
        tryCount++
      }
    } catch (e) {
      return {
        status: false,
        error: e as Error,
      }
    }
  }
  return {
    status: true,
    tryCount,
  }
}
