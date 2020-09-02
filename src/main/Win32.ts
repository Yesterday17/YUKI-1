const debug = require('debug')('yuki:win32')
import { EventEmitter } from 'events'
import YukiNativeBridge from './setup/YukiNativeBridge'


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
  YukiNativeBridge.instance.fetchMinimize(handle)
  YukiNativeBridge.instance.win32.on('minimize', () => {
    callback()
  })
}

export function registerWindowRestoreCallback(
  handle: number,
  callback: () => void
) {
  YukiNativeBridge.instance.fetchRestore(handle)
  YukiNativeBridge.instance.win32.on('restore', () => {
    callback()
  })
}

function doRegister(pids: number[], callback: () => void, index: number) {
  if (index === pids.length) {
    callback()
    return
  }

  debug('registering process exit callback at pid %d...', pids[index])

  YukiNativeBridge.instance.fetchWatchProcessExit(pids[index])

  YukiNativeBridge.instance.win32.on('exit', (pid: number) => {
    if (pid === pids[index]) {
      doRegister(pids, callback, index + 1)
    }
  })

  debug('process exit callback registered')
}
