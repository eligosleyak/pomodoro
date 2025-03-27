// Timer utility for reliable background timing
class TimerUtils {
  private static instance: TimerUtils
  private worker: Worker | null = null
  private callbacks: {
    onTick?: (remaining: number) => void
    onComplete?: () => void
  } = {}

  private constructor() {
    // Initialize worker if in browser environment
    if (typeof window !== "undefined" && window.Worker) {
      try {
        this.worker = new Worker("/timer-worker.js")

        // Set up message handler
        this.worker.onmessage = (e) => {
          const { type, remaining } = e.data

          if (type === "tick" && this.callbacks.onTick) {
            this.callbacks.onTick(remaining)
          } else if (type === "complete" && this.callbacks.onComplete) {
            this.callbacks.onComplete()
          }
        }
      } catch (error) {
        console.error("Error initializing timer worker:", error)
      }
    }
  }

  public static getInstance(): TimerUtils {
    if (!TimerUtils.instance) {
      TimerUtils.instance = new TimerUtils()
    }
    return TimerUtils.instance
  }

  public startTimer(duration: number, onTick?: (remaining: number) => void, onComplete?: () => void): void {
    // Store callbacks
    this.callbacks.onTick = onTick
    this.callbacks.onComplete = onComplete

    // Start the timer in the worker
    if (this.worker) {
      this.worker.postMessage({ command: "start", duration })
    } else {
      // Fallback for environments without worker support
      console.warn("Web Worker not supported, using fallback timer")
      this.fallbackTimer(duration)
    }
  }

  public pauseTimer(): void {
    if (this.worker) {
      this.worker.postMessage({ command: "pause" })
    }
  }

  public resetTimer(): void {
    if (this.worker) {
      this.worker.postMessage({ command: "reset" })
    }
  }

  private fallbackTimer(duration: number): void {
    // This is a less reliable fallback for browsers without worker support
    const startTime = Date.now()
    const targetTime = startTime + duration * 1000

    const intervalId = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((targetTime - now) / 1000))

      if (this.callbacks.onTick) {
        this.callbacks.onTick(remaining)
      }

      if (now >= targetTime) {
        if (this.callbacks.onComplete) {
          this.callbacks.onComplete()
        }
        clearInterval(intervalId)
      }
    }, 500)
  }
}

export default TimerUtils

