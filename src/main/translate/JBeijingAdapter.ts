import { existsSync } from 'fs'
import JBeijing from './JBeijing'

export default class JBeijingAdapter implements yuki.Translator {
  private config: yuki.Config.JBeijing
  private jb: JBeijing

  constructor (config: yuki.Config.JBeijing) {
    this.config = config
    this.jb = new JBeijing(config.path)
    if (config.dictPath && existsSync(config.dictPath)) {
      this.jb.loadUserDic(config.dictPath)
    }
  }

  private translateJb (text: string, callback: (translation: string) => void) {
    this.jb.translate(text, this.config.traditionalChinese ? 950 : 936, callback)
  }

  public translate (text: string): Promise<string> {
    return new Promise(resolve => {
      this.translateJb(text, tr => resolve(tr));
    })
  }

  public isEnable (): boolean {
    return this.config.enable
  }
  public setEnable (isEnable: boolean): void {
    this.config.enable = isEnable
  }
  public getName (): string {
    return 'JBeijing'
  }
}
