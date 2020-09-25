import * as fs from 'fs'
import * as path from 'path'
import YukiNativeBridge from '../setup/YukiNativeBridge'

const debug = require('debug')('yuki:jbeijing')

export default class JBeijing {
  public static readonly DICT_PATH = 'lib\\dict\\jb\\'

  private exePath: string

  constructor(exePath: string) {
    this.exePath = exePath
    try {
      this.checkExePathAndThrow()
      YukiNativeBridge.instance.loadLibrary(this.exePath)
      this.checkDictDir()
    } catch (e) {
      return
    }
  }

  public loadUserDic(dicPath?: string) {
    debug('start loading user dict')
    if (!dicPath) {
      dicPath = JBeijing.DICT_PATH
    }

    const dics = this.findAvailableUserdicPaths(dicPath)
    debug(dics)
    YukiNativeBridge.instance.fetchJBeijing7OpenUserdict(dics)
      .then(() => debug('user dict loaded'))
      .catch(() => debug('cannot load user dict. abort'))
  }

  public translate(text: string, destCodePage: number, callback: (translation: string) => void) {
    YukiNativeBridge.instance.fetchJBeijing7Translation(text).then((translated) => {
      callback(translated)
    })
  }

  private checkExePathAndThrow() {
    if (!fs.existsSync(path.join(this.exePath, 'JBJCT.dll'))) {
      debug('there is no jbeijing translator in path %s. abort', this.exePath)
      throw new Error()
    }
  }

  private checkDictDir() {
    if (!fs.existsSync(JBeijing.DICT_PATH)) {
      debug('user dict path not exists. ignore')
    }
  }

  private findAvailableUserdicPaths(basePath: string): string[] {
    const paths: string[] = []
    this.walk(basePath, paths)
    return paths
  }

  private walk(basePath: string, out: string[]) {
    const dirList = fs.readdirSync(basePath)
    dirList.forEach((item) => {
      if (
        fs.statSync(path.join(basePath, item)).isFile() &&
        item.toLowerCase().endsWith('.dic')
      ) {
        out.push(path.resolve(basePath, item.substr(0, item.length - 4)))
      }
    })

    dirList.forEach((item) => {
      if (fs.statSync(path.join(basePath, item)).isDirectory()) {
        this.walk(path.join(basePath, item), out)
      }
    })
  }
}
