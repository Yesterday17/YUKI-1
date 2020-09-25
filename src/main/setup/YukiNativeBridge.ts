import { spawn } from 'child_process'
import { EventEmitter } from 'events'
import fetch from 'node-fetch'
import * as path from 'path'
import { client as WebSocketClient } from 'websocket'

const debug = require('debug')('yuki:native')

export default class YukiNativeBridge extends EventEmitter {
  public static readonly instance = new YukiNativeBridge()
  public readonly win32 = new EventEmitter()

  public wsRetry: number = 0

  private baseUrl: string = ''
  private ws?: WebSocketClient

  public initializeYukiNative(config: yuki.Config.Default['native']) {
    this.baseUrl = config.listen

    if (!config.path) {
      debug('unavailable')
      return
    }

    const command = spawn(config.path, { cwd: path.dirname(config.path) })

    command.stdout.on('data', (data) => {
      debug(data.toString())
    })

    command.on('close', () => {
      debug('closed')
    })

    debug('spawned')

    this.fetchPing().then((success) => {
      if (success) {
        debug('launched successfully')
        this.initializeWebSocketClient()
      } else {
        debug('failed to launch')
      }
    })
  }

  public async fetchPing(): Promise<boolean> {
    return await this.nativeFetch('/ping') === 'pong'
  }

  public async loadLibrary(libPath: string): Promise<void> {
    await this.nativeFetch('/library', libPath)
  }

  public async fetchJBeijing7Translation(text: string): Promise<string> {
    try {
      return await this.nativeFetch('/jbeijing7', text)
    } catch (e) {
      debug(`JBeijing7 error: ${e}`)
      return 'error'
    }
  }

  public async fetchJBeijing7OpenUserdict(dict: string[]): Promise<void> {
    await this.nativeFetch('/jbeijing7/dict', dict.join('\n'))
  }

  public async fetchMecab(text: string): Promise<string> {
    try {
      return await this.nativeFetch('/mecab', text)
    } catch (e) {
      debug(e)
      return text
    }
  }

  public async fetchTextractor(pid: number, code: string = '') {
    await this.nativeFetch('/textractor', `${pid}|${code}`)
  }

  ///////////////////////////////////////////////////////////////////

  public async fetchWatchProcessExit(pid: number) {
    await this.nativeFetch('/win32/exit', `${pid}`)
  }

  public async fetchMinimize(pid: number) {
    await this.nativeFetch('/win32/minimize', `${pid}`)
  }

  public async fetchRestore(pid: number) {
    await this.nativeFetch('/win32/restore', `${pid}`)
  }

  ///////////////////////////////////////////////////////////////////

  public async nativeFetch(fetchPath: string, body?: string): Promise<string> {
    const resp = await fetch('http://' + this.baseUrl + fetchPath, { method: 'POST', body })

    if (resp.status !== 200) {
      throw resp.status
    }
    return resp.text()
  }

  public async initializeWebSocketClient() {
    this.ws = new WebSocketClient()
    this.ws.on('connect', (conn) => {
      debug('WebSocket connected')

      conn.on('message', (msg) => {
        if (msg.type === 'utf8') {
          const message = JSON.parse(msg.utf8Data as string) as yuki.WebSocketPushMessage

          debug(message.message)
          switch (message.type) {
            case 'textractor':
              this.emit('textractor', { ...message.message })
              break
            case 'win32':
              this.win32.emit(message.message.event, message.message.value)
              break
          }
        }
      })

      conn.on('close', () => {
        debug('WebSocket connection closed, reconnecting...')
        const next = setTimeout(() => {
          this.initializeWebSocketClient()
          clearTimeout(next)
        }, 3000)
      })
    })
    this.ws.connect(`ws://${this.baseUrl}/ws`)
  }
}
