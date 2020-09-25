declare namespace yuki {
  export interface TextractorPushMessage {
    type: 'textractor'
    message: TextOutputObject
  }

  export interface Win32PushMessage {
    type: 'win32'
    message: Win32ExitEvent | Win32MinimizeEvent | Win32RestoreEvent
  }

  export interface Win32Event {
    event: string
    value: number
  }

  export interface Win32ExitEvent {
    event: 'exit',
    value: number
  }

  export interface Win32MinimizeEvent {
    event: 'minimize',
    value: 0
  }

  export interface Win32RestoreEvent {
    event: 'restore',
    value: 0
  }

  export type WebSocketPushMessage = TextractorPushMessage | Win32PushMessage

  export interface Middleware<T> {
    process: (context: T) => Promise<T>
  }

  export interface MeCabPattern {
    word: string
    abbr: string
    kana: string
  }

  export type MeCabPatterns = MeCabPattern[]

  export interface DictResult {
    found?: boolean
    word?: string
    content?: LingoesPattern
  }

  export interface DictOptions {
    dict: string
    word: string
  }

  export interface LingoesPattern {
    kana?: string[]
    definitions?: Array<{
      partOfSpeech: string,
      explanations: Array<{
        content: string,
        example: {
          sentence: string,
          content: string
        }
      }>
    }>
  }

  export interface Process {
    name: string,
    pid: number
  }

  export type Processes = Process[]

  export interface ProcessWithText extends Process {
    text: string
  }

  export type ProcessesWithText = ProcessWithText[]
}
