import * as ffi from 'ffi'
const debug = require('debug')('yuki:win32')

const SYNCHRONIZE = 0x00100000
const FALSE = 0
const INFINITE = 0xffffffff

const knl32 = ffi.Library('kernel32.dll', {
  OpenProcess: ['uint32', ['uint32', 'int', 'uint32']],
  WaitForSingleObject: ['uint32', ['uint32', 'uint32']]
})

const user32 = ffi.Library('user32.dll', {
  SetWinEventHook: ['uint32', ['uint32', 'uint32', 'uint32', 'pointer', 'uint32', 'uint32', 'uint32']],
  UnhookWinEvent: ['bool', ['uint32']]
})

export function registerProcessExitCallback(
  pids: number[],
  callback: () => void
): void {
  doRegister(pids, callback, 0)
}

const EVENT_SYSTEM_MINIMIZESTART = 0x0016
const EVENT_SYSTEM_MINIMIZEEND = 0x0017

export function registerWindowMinimizeStartCallback(
  handle: number,
  callback: () => void
): boolean {
  return doRegisterEventHook(EVENT_SYSTEM_MINIMIZESTART, handle, callback)
}

export function registerWindowMinimizeEndCallback(
  handle: number,
  callback: () => void
): boolean {
  return doRegisterEventHook(EVENT_SYSTEM_MINIMIZEEND, handle, callback)
}

function doRegisterEventHook(
  event: number,
  handle: number,
  callback: () => void
): boolean {
  const eventProc = ffi.Callback('void',
    [ffi.types.ulong, ffi.types.ulong, ffi.types.int32, ffi.types.long, ffi.types.long, ffi.types.ulong, ffi.types.ulong],
    (hook: number, event: number, hwnd: number, obj: number, child: number, thread: number, time: number) => {
      callback()
    })

  const num = user32.SetWinEventHook(event, event, 0, eventProc, handle, 0, 0)
  process.on('exit', () => {
    if (num !== 0) {
      user32.UnhookWinEvent(num);
    }
    eventProc;
  })

  return num !== 0
}

function doRegister(pids: number[], callback: () => void, index: number) {
  if (index === pids.length) {
    callback()
    return
  }

  debug('registering process exit callback at pid %d...', pids[index])

  const hProc = knl32.OpenProcess(SYNCHRONIZE, FALSE, pids[index])
  debug('process handle: %d', hProc)

  knl32.WaitForSingleObject.async(hProc, INFINITE, () => {
    doRegister(pids, callback, index + 1)
  })
  debug('process exit callback registered')
}
