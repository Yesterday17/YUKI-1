export default class ApplicationBuilder<T> {
  private middlewares: Array<yuki.Middleware<T>> = []

  public use(middleware: yuki.Middleware<T>) {
    this.middlewares.push(middleware)
  }

  public run(initContext: T) {
    this.iterator(initContext, 0)
  }

  private async iterator(context: T, index: number): Promise<T> {
    if (index === this.middlewares.length) return context

    try {
      context = await this.middlewares[index].process(context)
      return this.iterator(context, index + 1)
    } catch {
      return Promise.resolve(context)
    }
  }
}
