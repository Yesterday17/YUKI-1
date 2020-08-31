import TranslatorWindow from "../TranslatorWindow";

export default class TextPreprocessorMiddleware implements yuki.Middleware<yuki.TextOutputObject> {
  async process(context: yuki.TextOutputObject): Promise<yuki.TextOutputObject> {
    let window = TranslatorWindow.getInstance()

    if (window?.getGameInfo().textPreprocessor) {
      try {
        const preprocess = new Function('text', window.getGameInfo().textPreprocessor)
        context.text = preprocess(context.text)
      } catch (e) { }
    }

    return context
  }
}