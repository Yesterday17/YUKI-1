const debug = require('debug')('yuki:api')
import fetch from 'node-fetch'
import * as vm from 'vm'

interface Options {
  url: string
  method: string
  headers: { [key: string]: string }
  body?: URLSearchParams | string
}

export default class Api implements yuki.Translator {
  private config: yuki.Config.OnlineApiItem
  private requestOptions: Options
  private responseVmContext: vm.Context = vm.createContext({
    response: '',
    result: ''
  })

  constructor(config: yuki.Config.OnlineApiItem) {
    this.config = config
    if (
      !this.config.url ||
      !this.config.method ||
      !this.config.requestBodyFormat ||
      !this.config.responseBodyPattern
    ) {
      debug(
        '[%s] config not contains enough information. ignore',
        this.config.name
      )
      throw new TypeError()
    }
    this.requestOptions = {
      url: this.config.url,
      method: this.config.method,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) ' +
          'Gecko/20100101 Firefox/62.0'
      }
    }
  }

  public async translate(text: string): Promise<string> {
    this.generateRequestBody(text)
    const body = await this.getResponseBody()
    return this.parseResponse(body)
  }

  public isEnable() {
    return this.config.enable
  }

  public setEnable(isEnable: boolean) {
    this.config.enable = isEnable
  }

  public getName() {
    return this.config.name
  }

  private generateRequestBody(text: string) {
    if (!this.config.requestBodyFormat || !this.config.responseBodyPattern) {
      return
    }
    const requestBodyString = this.config.requestBodyFormat.replace(
      '%TEXT%',
      `"${text}"`
    )
    if (this.config.requestHeaders) {
      this.requestOptions.headers = JSON.parse(this.config.requestHeaders)
    }
    if (this.config.requestBodyFormat.startsWith('X')) {
      const params = new URLSearchParams()
      const b = JSON.parse(requestBodyString.substring(1))
      for (const key in b) {
        params.append(key, b[key])
      }
      this.requestOptions.body = params
    } else if (this.config.requestBodyFormat.startsWith('J')) {
      this.requestOptions.headers['content-type'] = 'application/json'
      this.requestOptions.body = requestBodyString.substring(1)
    } else {
      debug(
        '[%s] no such request body type: %s',
        this.config.name,
        this.config.requestBodyFormat.substring(0, 1)
      )
    }
  }

  private async getResponseBody(): Promise<string> {
    return fetch(this.requestOptions.url, this.requestOptions)
      .then(resp => resp.text())
      .catch(error => debug('[%s error] %s', this.config.name, error))
  }

  private parseResponse(body: string): string {
    if (!this.config.responseBodyPattern) return ''

    if (this.config.responseBodyPattern.startsWith('J')) {
      return this.parseResponseByJsObject(body)
    } else if (this.config.responseBodyPattern.startsWith('R')) {
      return this.fixEscapeCharacters(
        this.parseResponseByRegExp(body)
      )
    } else {
      debug(
        '[%s] no such response parser type: %s',
        this.config.name,
        this.config.responseBodyPattern.substring(0, 1)
      )
      return ''
    }
  }

  private parseResponseByJsObject(body: string | object): string {
    if (!this.config.responseBodyPattern) return ''

    debug('[%s] get raw response: %o', this.config.name, body)
    if (typeof body === 'string') body = JSON.parse(body)
    this.responseVmContext.response = body
    const scriptString = this.config.responseBodyPattern
      .substring(1)
      .replace('%RESPONSE%', `result = response`)
    try {
      vm.runInNewContext(scriptString, this.responseVmContext)
    } catch (e) {
      return `ERR: ${e}`
    }
    return this.responseVmContext.result
  }

  private parseResponseByRegExp(body: string): string {
    if (!this.config.responseBodyPattern) return ''

    const pattern = new RegExp(this.config.responseBodyPattern.substring(1))
    const response = pattern.exec(body)
    if (response) {
      return response[1]
    } else {
      return ''
    }
  }

  private fixEscapeCharacters(body: string): string {
    return body
      .replace(/&quot;/g, '"')
      .replace(/&#34;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
  }
}
