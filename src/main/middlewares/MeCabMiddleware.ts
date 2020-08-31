import YukiNativeBridge from "../setup/YukiNativeBridge"

const debug = require('debug')('yuki:mecab')
const toRomaji = require('wanakana').toRomaji

export default class MecabMiddleware
  implements yuki.Middleware<yuki.TextOutputObject> {

  public static readonly ABBR_TO_COLOR_MAP = {
    m: '#a7ffeb',
    mp: '#84ffff',
    n: '#80d8ff',
    num: '#b9f6ca',
    pn: '#d500f9',
    v: '#ff9e80',
    a: '#bbdefb',
    adn: '#e1bee7',
    adj: '#ce93d8',
    adv: '#e1bee7',
    p: '#ffeb3b',
    aux: '#fff176',
    suf: '#fdd835',
    pref: '#fbc02d',
    int: '#ffcdd2',
    conj: '#ff8a65',
    punct: '#d32f2f',
    w: '#bcaaa4'
  }

  public static isMeCabString(mstring: string): boolean {
    return mstring.startsWith('$')
  }

  public static stringToObject(mstring: string): yuki.MeCabPatterns {
    if (!this.isMeCabString(mstring)) return []

    const validString = mstring.substring(1)
    const result: yuki.MeCabPatterns = []
    validString.split('|').forEach((value) => {
      const aWord = value.split(',')
      result.push({ word: aWord[0], abbr: aWord[1], kana: aWord[2] })
    })
    return result
  }

  public static objectToOriginalText(patterns: yuki.MeCabPatterns): string {
    let result = ''
    for (const pattern of patterns) {
      result += pattern.word
    }
    return result
  }

  public static kanaToRomaji(kana: string): string {
    return toRomaji(kana)
  }

  private enabled: boolean

  constructor(config: yuki.Config.YukiNative) {
    this.enabled = config.mecab
    if (this.enabled) {
      debug('disabled')
      return
    }
  }

  public async process(context: yuki.TextOutputObject): Promise<yuki.TextOutputObject> {
    if (this.enabled) {
      context.text = '$' + await YukiNativeBridge.getInstance().fetchMecab(context.text)
    }

    return context
  }
}
