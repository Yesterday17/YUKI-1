import Api from './Api'
import JBeijingAdapter from './JBeijingAdapter'

const debug = require('debug')('yuki:translationManager')
import ExternalApi from './ExternalApi'

export default class TranslationManager {
  public static getInstance(): TranslationManager {
    if (!this.instance) {
      this.instance = new TranslationManager()
    }
    return this.instance
  }

  private static instance: TranslationManager | undefined

  private apis: { [name: string]: yuki.Translator } = {}

  public initializeApis(
    apis: yuki.Config.Default['onlineApis']
  ): TranslationManager {
    this.apis = {}
    for (const api of apis) {
      try {
        if (api.external && api.jsFile) {
          this.apis[api.name] = new ExternalApi(api)
        } else {
          this.apis[api.name] = new Api(api)
        }
      } catch (e) {
        continue
      }
    }
    return this
  }

  public initializeTranslators(
    translators: yuki.Config.Default['native']['translators']
  ) {
    if (translators.jBeijing && translators.jBeijing.enable) {
      const jb = new JBeijingAdapter(translators.jBeijing)
      this.apis[jb.getName()] = jb
    }
  }

  public translate(
    text: string,
    callback: (translation: yuki.Translations['translations']) => void
  ) {
    let hasTranslation = false
    Object.keys(this.apis).forEach((key) => {
      if (this.apis[key].isEnable()) {
        hasTranslation = true
        this.apis[key].translate(text).then((translation) => {
          debug('[%s] -> %s', this.apis[key].getName(), translation)
          callback({
            [this.apis[key].getName()]: translation
          })
        }).catch((e) => {
          debug('[Error][%s] -> %s', this.apis[key].getName(), e)
          callback({
            [this.apis[key].getName()]: '[Error]'
          })
        })
      }
    })

    if (!hasTranslation) {
      callback({})
    }
  }
}
