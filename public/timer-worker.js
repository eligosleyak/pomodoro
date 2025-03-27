// This is a Web Worker that helps keep time accurately even when the tab is inactive

let timerId = null
let startTime = null
let targetTime = null

self.onmessage = (e) => {
  const { command, duration } = e.data

  if (command === "start") {
    // Start the timer
    startTime = Date.now()
    targetTime = startTime + duration * 1000

    // Clear any existing timer
    if (timerId) {
      clearInterval(timerId)
    }

    // Set up interval to check time and send updates
    timerId = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((targetTime - now) / 1000))

      // Send current remaining time to the main thread
      self.postMessage({ type: "tick", remaining })

      // If timer is complete, send completion message
      if (now >= targetTime) {
        self.postMessage({ type: "complete" })
        clearInterval(timerId)
        timerId = null
      }
    }, 500)
  } else if (command === "pause") {
    // Pause the timer
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  } else if (command === "reset") {
    // Reset the timer
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
    startTime = null
    targetTime = null
  }
}

