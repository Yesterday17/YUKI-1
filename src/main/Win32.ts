const debug = require('debug')('yuki:win32')
import { EventEmitter } from 'events'
import YukiNativeBridge from './setup/YukiNativeBridge'


export class Win32Events extends EventEmitter {
  public static readonly instance = new Win32Events()
}

export function registerProcessExitCallback(
  pids: number[],
  callback: () => void
): void {
  doRegister(pids, callback, 0)
}

export function registerWindowMinimizeCallback(
  handle: number,
  callback: () => void
) {
  YukiNativeBridge.getInstance().fetchMinimize(handle)
  Win32Events.instance.on('minimize', () => {
    callback()
  })
}

export function registerWindowRestoreCallback(
  handle: number,
  callback: () => void
) {
  YukiNativeBridge.getInstance().fetchRestore(handle)
  Win32Events.instance.on('restore', () => {
    callback()
  })
}

function doRegister(pids: number[], callback: () => void, index: number) {
  if (index === pids.length) {
    callback()
    return
  }

  debug('registering process exit callback at pid %d...', pids[index])

  YukiNativeBridge.getInstance().fetchWatchProcessExit(pids[index])

  Win32Events.instance.on('exit', (pid: number) => {
    if (pid === pids[index]) {
      doRegister(pids, callback, index + 1)
    }
  })

  debug('process exit callback registered')
}
