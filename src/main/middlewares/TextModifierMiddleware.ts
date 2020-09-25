const debug = require('debug')('yuki:textInterceptor')

export default class TextInterceptorMiddleware
  implements yuki.Middleware<yuki.TextOutputObject> {
  private removeAscii: boolean
  private deduplicateRegex: RegExp | undefined
  private delineBreak: boolean

  constructor(config: yuki.Config.Texts['modifier']) {
    this.removeAscii = config.removeAscii
    this.delineBreak = config.delineBreak

    if (config.deduplicate) {
      this.deduplicateRegex = /([^]+?)\1+/g
    } else if (config.deduplicateCount > 0) {
      this.deduplicateRegex = new RegExp(`([^]){${config.deduplicateCount}}\\1`, 'g')
    }
    debug('initialized')
  }

  public async process(context: yuki.TextOutputObject): Promise<yuki.TextOutputObject> {
    context.text = context.text.replace(/[\x00-\x20]/g, '')
    context.text = context.text.replace(/_t.*?\//g, '')

    if (this.removeAscii) {
      context.text = context.text.replace(/[\x00-\xFF]+/g, '')
      if (context.text === '') throw new Error('empty')
    }
    if (this.deduplicateRegex) {
      context.text = context.text.replace(this.deduplicateRegex, '$1')
      if (context.text === '') throw new Error('empty')
    }
    if (this.delineBreak) {
      context.text = context.text.replace(/_r/g, '')
      context.text = context.text.replace(/<br>/g, '')
      context.text = context.text.replace(/#n/g, '')
      context.text = context.text.replace(/\s+/g, '')
      if (context.text === '') throw new Error('empty')
    }

    return context
  }
}
