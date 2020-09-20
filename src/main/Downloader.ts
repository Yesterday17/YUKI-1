import * as fs from 'fs'
import fetch, { Response } from 'node-fetch'
const Progress = require('node-fetch-progress')

export interface FetchProgress {
  total: number
  done: number
  totalh: number
  doneh: number
  startedAt: number
  elapsed: number
  rate: number
  rateh: number
  estimated: number
  progress: number
  eta: number
  etah: number
  etaDate: number
}

export default class Downloader {
  private endCallback: () => void
  private errorCallback: (err: Error) => void
  private downloadRequest: Promise<Response> | undefined
  private progressCallback: (state: FetchProgress) => void | undefined

  constructor(private fileUrl: string, private saveToPath: string) {
    this.progressCallback = () => { return }
    this.errorCallback = () => { return }
    this.endCallback = () => { return }
  }

  public start() {
    this.downloadRequest = fetch(this.fileUrl)
    const progress = new Progress(this.downloadRequest)
    progress.on('progress', (p: FetchProgress) => {
      this.progressCallback(p)
    })
    this.downloadRequest.then(r => r.blob()).then(blob => {
      fs.createWriteStream(this.saveToPath).write(blob)
      this.endCallback()
    }).catch(e => {
      this.errorCallback(e)
    })
    return this
  }

  public pause() {
    if (!this.downloadRequest) return
    // TODO
  }
  public resume() {
    if (!this.downloadRequest) return
    // TODO
  }
  public abort() {
    if (!this.downloadRequest) return
    // TODO

    if (fs.existsSync(this.saveToPath)) {
      fs.unlinkSync(this.saveToPath)
    }

    this.errorCallback(new Error('download aborted'))
  }

  public onProgress(callback: (state: FetchProgress) => void) {
    this.progressCallback = callback
    return this
  }
  public onEnd(callback: () => void) {
    this.endCallback = callback
    return this
  }
  public onError(callback: (err: Error) => void) {
    this.errorCallback = callback
    return this
  }
}
