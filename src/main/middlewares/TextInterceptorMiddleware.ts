const debug = require('debug')('yuki:textInterceptor')

export default class TextInterceptorMiddleware implements yuki.Middleware<yuki.TextOutputObject> {
  private static DEFAULT_MAX_LENGTH = 1000

  private maxLength: number
  private shouldBeIgnorePatterns: string[]
  private ignoreAsciiOnly: boolean

  constructor(config: yuki.Config.Texts['interceptor']) {
    this.shouldBeIgnorePatterns = config.shouldBeIgnore
    this.ignoreAsciiOnly = config.ignoreAsciiOnly
    this.maxLength = config.maxLength
      ? config.maxLength
      : TextInterceptorMiddleware.DEFAULT_MAX_LENGTH
    debug('initialized')
  }

  public async process(context: yuki.TextOutputObject): Promise<yuki.TextOutputObject> {
    if (this.textShouldBeIgnore(context.text)) throw new Error('ignore')
    if (this.ignoreAsciiOnly && this.isAsciiOnly(context.text)) throw new Error('ignore')

    return context
  }

  public textShouldBeIgnore(text: string): boolean {
    return this.isTooLong(text) || this.containsShouldBeIgnorePattern(text)
  }

  private isTooLong(text: string) {
    return text.length > this.maxLength
  }

  private containsShouldBeIgnorePattern(text: string) {
    for (const pattern of this.shouldBeIgnorePatterns) {
      if (text.indexOf(pattern) > -1) {
        return true
      }
    }
    return false
  }

  private isAsciiOnly(text: string) {
    return /^[\x00-\xFF]*$/.test(text)
  }
}
