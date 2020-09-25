const debug = require('debug')('yuki:filter')

export default class FilterMiddleware implements yuki.Middleware<yuki.TextOutputObject> {
  public async process(context: yuki.TextOutputObject): Promise<yuki.TextOutputObject> {
    debug('[%d] %s', context.handle, context.text)
    context.code = `/${context.code}`
    return context
  }
}
