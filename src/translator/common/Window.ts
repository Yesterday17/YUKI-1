import { remote } from 'electron'

let finished: Promise<void> = Promise.resolve()

export function updateWindowHeight(
  component: Vue.default, addBodyHeight: boolean, offset: number, animation = true) {
  let currentHeight = addBodyHeight ? document.body.offsetHeight : 0
  const newHeight = currentHeight + offset

  finished.then(() => {
    const window = remote.getCurrentWindow()
    const width = window.getSize()[0]
    if (component) {
      if (newHeight > 640) {
        component.$nextTick(() => {
          component.$store.dispatch('View/setWindowTooHigh', true)
        })
      } else {
        component.$nextTick(() => {
          component.$store.dispatch('View/setWindowTooHigh', false)
        })
      }
    }

    if (animation) {
      finished = ((): Promise<void> => {
        currentHeight = remote.getCurrentWindow().getSize()[1]
        offset = newHeight - currentHeight
        let counter = 0
        return new Promise((resolve) => {
          requestAnimationFrame(function update() {
            // 60 frames
            counter++
            currentHeight += offset / 60
            window.setSize(width, Math.floor(currentHeight))

            if (counter < 60 && offset !== 0) {
              requestAnimationFrame(update)
            } else {
              resolve()
            }
          })
        })
      })()
    } else {
      finished = Promise.resolve()
      window.setSize(width, newHeight)
    }
  })

  return newHeight
}
