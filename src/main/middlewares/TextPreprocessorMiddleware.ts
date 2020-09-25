const debug = require('debug')('yuki:textPreprocessor')
import TranslatorWindow from '../TranslatorWindow'

export default class TextPreprocessorMiddleware implements yuki.Middleware<yuki.TextOutputObject> {
  public async process(context: yuki.TextOutputObject): Promise<yuki.TextOutputObject> {
    const window = TranslatorWindow.getInstance()

    if (window?.getGameInfo().textPreprocessor) {
      try {
        const preprocess = new Function('text', window.getGameInfo().textPreprocessor)
        context.text = preprocess(context.text)
      } catch (e) {
        debug(e)
      }
    }

    return context
  }
}
