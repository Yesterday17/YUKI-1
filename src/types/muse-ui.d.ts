import { CreateElement, PluginFunction, VNode } from 'vue'

export type MessageModel = 'alert' | 'prompt' | 'confirm'
export type MessageType = '' | 'success' | 'info' | 'warning' | 'error'
type CreateElementFunc = (h: CreateElement) => VNode
type BeforeCloseFunction = (
  result: boolean,
  modal: any,
  close: () => void
) => any

interface ValidatorResult {
  valid: boolean
  message: string
}

interface MessageReturn {
  result: boolean
  value?: string | number
}

type Validator = (value: string | number) => ValidatorResult

export interface MessageOptions {
  successIcon?: string
  infoIcon?: string
  warningIcon?: string
  errorIcon?: string
  title?: string
  icon?: string
  iconSize?: number
  mode?: MessageModel
  type?: MessageType
  content?: string | CreateElementFunc
  width?: number | string
  maxWidth?: number | string
  className?: string
  transition?: string
  beforeClose?: BeforeCloseFunction
  okLabel?: string
  cancelLabel?: string
  inputType?: string
  inputPlaceholder?: string
  inputValue?: string | number
  validator?: Validator
}

declare module 'vue/types/vue' {
  export interface Vue {
    $message(options: MessageOptions): Promise<MessageReturn>

    $alert(content: string, options: MessageOptions): Promise<MessageReturn>

    $alert(
      content: string,
      title: string,
      options: MessageOptions
    ): Promise<MessageReturn>

    $confirm(content: string, options: MessageOptions): Promise<MessageReturn>

    $confirm(
      content: string,
      title: string,
      options: MessageOptions
    ): Promise<MessageReturn>

    $prompt(content: string, options: MessageOptions): Promise<MessageReturn>

    $prompt(
      content: string,
      title: string,
      options: MessageOptions
    ): Promise<MessageReturn>
  }
}

export type ToastPosition =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'

export interface ToastAction {
  action: string | VNode
  click: (id: string) => any
}

export interface ToastOptions {
  message?: string
  time?: number
  position?: ToastPosition
  close?: boolean
  icon?: string
  actions?: ToastAction[]
  color?: string
  textColor?: string
  closeIcon?: string
  successIcon?: string
  infoIcon?: string
  warningIcon?: string
  errorIcon?: string
}

export interface Toast {
  install: PluginFunction<ToastOptions>

  config(options: ToastOptions): ToastOptions

  message(options: ToastOptions): string

  success(message: string | ToastOptions): string

  info(message: string | ToastOptions): string

  warning(message: string | ToastOptions): string

  error(message: string | ToastOptions): string

  close(id: string): void
}

export default Toast

declare module 'vue/types/vue' {
  interface Vue {
    $toast: Toast
  }
}
