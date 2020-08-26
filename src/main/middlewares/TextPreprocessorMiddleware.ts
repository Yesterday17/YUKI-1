import TranslatorWindow from "../TranslatorWindow";

export default class TextPreprocessorMiddleware implements yuki.Middleware<yuki.TextOutputObject> {
  process(context: yuki.TextOutputObject, next: (newContext: yuki.TextOutputObject) => void) {
    let window = TranslatorWindow.getInstance()

    if (window?.getGameInfo().textPreprocessor) {
      try {
        const preprocess = new Function('text', window.getGameInfo().textPreprocessor)
        context.text = preprocess(context.text)
      } catch (e) { }
    }

    next(context)
  }
}