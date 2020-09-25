export = vuetify

declare class vuetify {
  public static installed: boolean
  public static version: string

  public static install(Vue: any, args: any): void

  public framework: any
  public installed: any
  public preset: any

  constructor(preset: any);

  public init(root: any, ssrContext: any): void

  public use(Service: any): void
}
