import fetch from 'node-fetch'
import { spawn } from 'child_process'
const debug = require('debug')('yuki:native')

export default class YukiNativeBridge {
  private static instance = new YukiNativeBridge();
  static getInstance(): YukiNativeBridge {
    return YukiNativeBridge.instance
  }

  private baseUrl: string = ''

  initializeYukiNative(config: yuki.Config.Default['native']) {
    this.baseUrl = config.listen

    spawn(config.path)
    debug('spawned')
  }

  async loadLibrary(path: string): Promise<void> {
    await this.nativeFetch("/library", path)
  }

  async fetchJBeijing7(text: string): Promise<string> {
    try {
      return await this.nativeFetch("/jbeijing7", text)
    } catch (e) {
      debug(`JBeijing7 error: ${e}`)
      return 'error'
    }
  }

  async fetchMecab(text: string): Promise<string> {
    try {
      return await this.nativeFetch("/mecab", text)
    } catch (e) {
      debug(e)
      return text
    }
  }

  async nativeFetch(path: string, body?: string): Promise<string> {
    const resp = await fetch(this.baseUrl + path, { method: body ? 'POST' : 'GET', body: body })

    if (resp.status !== 200) {
      throw resp.status
    }
    return await resp.text()
  }
}