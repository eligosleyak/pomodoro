// Sound utility for playing notification sounds
class SoundUtils {
  private static instance: SoundUtils
  private sounds: { [key: string]: HTMLAudioElement } = {}
  private enabled = true

  private constructor() {
    // Initialize sounds
    this.sounds = {
      workComplete: new Audio("/sounds/work-complete.mp3"),
      breakComplete: new Audio("/sounds/break-complete.mp3"),
      buttonClick: new Audio("/sounds/button-click.mp3"),
    }

    // Load sounds from localStorage if available
    if (typeof window !== "undefined") {
      const soundEnabled = localStorage.getItem("pomodoroSoundEnabled")
      this.enabled = soundEnabled === null ? true : soundEnabled === "true"
    }

    // Set volume for all sounds
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = 0.7
    })
  }

  public static getInstance(): SoundUtils {
    if (!SoundUtils.instance) {
      SoundUtils.instance = new SoundUtils()
    }
    return SoundUtils.instance
  }

  public play(soundName: "workComplete" | "breakComplete" | "buttonClick"): void {
    if (!this.enabled) return

    const sound = this.sounds[soundName]
    if (sound) {
      // Reset the audio to the beginning if it's already playing
      sound.currentTime = 0

      // Play the sound
      sound.play().catch((error) => {
        console.error("Error playing sound:", error)
      })
    }
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoroSoundEnabled", enabled.toString())
    }
  }

  public toggleEnabled(): boolean {
    this.setEnabled(!this.enabled)
    return this.enabled
  }
}

export default SoundUtils

