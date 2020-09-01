import fetch from 'node-fetch'
import * as path from 'path';
import { spawn } from 'child_process'
import { client as WebSocketClient } from 'websocket'
import { EventEmitter } from 'events';
import { Win32Events } from '../Win32';
const debug = require('debug')('yuki:native')

export default class YukiNativeBridge {
  private static instance = new YukiNativeBridge();
  static getInstance(): YukiNativeBridge {
    return YukiNativeBridge.instance
  }

  private baseUrl: string = ''
  private ws?: WebSocketClient;
  private emitter = new EventEmitter();

  initializeYukiNative(config: yuki.Config.Default['native']) {
    this.baseUrl = config.listen

    const command = spawn(config.path, ['-t', path.join(
      global.__baseDir,
      'lib/textractor/TextractorCLI.exe'
    )])

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

  async fetchPing(): Promise<boolean> {
    return await this.nativeFetch('/ping') === 'pong'
  }

  async loadLibrary(path: string): Promise<void> {
    await this.nativeFetch('/library', path)
  }

  async fetchJBeijing7Translation(text: string): Promise<string> {
    try {
      return await this.nativeFetch('/jbeijing7', text)
    } catch (e) {
      debug(`JBeijing7 error: ${e}`)
      return 'error'
    }
  }

  async fetchJBeijing7OpenUserdict(dict: string[]): Promise<void> {
    await this.nativeFetch("/jbeijing7/dict", dict.join('\n'))
  }

  async fetchMecab(text: string): Promise<string> {
    try {
      return await this.nativeFetch('/mecab', text)
    } catch (e) {
      debug(e)
      return text
    }
  }

  async fetchTextractor(pid: number, code: string = '') {
    await this.nativeFetch('/textractor', `${pid}|${code}`)
  }

  async fetchWatchProcessExit(pid: number) {
    await this.nativeFetch('/win32/exit', `${pid}`)
  }

  registerListener<T>(event: string, listener: (result: T) => void) {
    this.emitter.on(event, listener)
  }

  async nativeFetch(path: string, body?: string): Promise<string> {
    debug(path)
    const resp = await fetch('http://' + this.baseUrl + path, { method: 'POST', body: body })

    if (resp.status !== 200) {
      throw resp.status
    }
    return await resp.text()
  }

  wsRetry: number = 0;
  async initializeWebSocketClient() {
    this.ws = new WebSocketClient()
    this.ws.on('connect', (conn) => {
      debug('WebSocket connected')

      conn.on('message', (msg) => {
        if (msg.type === 'utf8') {
          const message = JSON.parse(msg.utf8Data as string) as yuki.WebSocketPushMessage

          debug(message.message)
          switch (message.type) {
            case 'textractor':
              this.emitter.emit('textractor-output', { ...message.message })
              break
            case 'win32':
              switch (message.message.event) {
                case 'exit':
                  Win32Events.instance.emit('exit', message.message.value)
                  break
              }
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