"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Check, Coffee, Brain, Volume2, VolumeX } from "lucide-react"
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore"
import SoundUtils from "@/utils/sound-utils"
import TimerUtils from "@/utils/timer-utils"

// Timer durations in seconds
const WORK_TIME = 25 * 60
const SHORT_BREAK_TIME = 5 * 60
const LONG_BREAK_TIME = 15 * 60
const POMODOROS_UNTIL_LONG_BREAK = 4

type PomodoroPhase = "work" | "shortBreak" | "longBreak"

type PomodoroTimerProps = {
  db: any
  user: any
  updateCompletedPomodoros: (count: number) => void
  completedPomodoros: number
}

export default function PomodoroTimer({ db, user, updateCompletedPomodoros, completedPomodoros }: PomodoroTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(WORK_TIME)
  const [isActive, setIsActive] = useState(false)
  const [taskName, setTaskName] = useState("")
  const [phase, setPhase] = useState<PomodoroPhase>("work")
  const [pomodorosInCycle, setPomodorosInCycle] = useState(0)
  const [autoStartBreaks, setAutoStartBreaks] = useState(true)
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // References for timer tracking
  const phaseRef = useRef<PomodoroPhase>("work")
  const isActiveRef = useRef<boolean>(false)

  const soundUtils = SoundUtils.getInstance()
  const timerUtils = TimerUtils.getInstance()

  // Update refs when state changes
  useEffect(() => {
    phaseRef.current = phase
    isActiveRef.current = isActive
  }, [phase, isActive])

  // Load completed pomodoros count and sound settings on component mount
  useEffect(() => {
    if (db && user) {
      loadCompletedPomodoros()
    }

    // Load sound settings
    setSoundEnabled(soundUtils.isEnabled())

    // Request notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission()
    }
  }, [db, user])

  const loadCompletedPomodoros = async () => {
    try {
      const sessionsQuery = query(
        collection(db, "pomodoro_sessions"),
        where("userId", "==", user.uid),
        where("type", "==", "work"),
      )
      const querySnapshot = await getDocs(sessionsQuery)
      updateCompletedPomodoros(querySnapshot.size)

      // Calculate current position in cycle
      setPomodorosInCycle(querySnapshot.size % POMODOROS_UNTIL_LONG_BREAK)
    } catch (error) {
      console.error("Error loading completed pomodoros:", error)
    }
  }

  const saveSession = async () => {
    try {
      if (db && user) {
        await addDoc(collection(db, "pomodoro_sessions"), {
          userId: user.uid,
          taskName: phase === "work" ? taskName || "Unnamed Task" : "Break",
          duration: getDurationMinutes(),
          type: phase,
          completedAt: Timestamp.now(),
        })

        // Only update completed pomodoros count for work sessions
        if (phase === "work") {
          updateCompletedPomodoros(completedPomodoros + 1)

          // Play work complete sound
          soundUtils.play("workComplete")
        } else {
          // Play break complete sound
          soundUtils.play("breakComplete")
        }

        // Show notification
        if (Notification.permission === "granted") {
          new Notification(`${getPhaseTitle()} Completed!`, {
            body:
              phase === "work"
                ? `You completed: ${taskName || "Unnamed Task"}`
                : `Break completed. ${phase === "shortBreak" ? "Ready to work?" : "Ready for a new cycle?"}`,
            icon: "/favicon.ico",
          })
        }
      }
    } catch (error) {
      console.error("Error saving session:", error)
    }
  }

  const handleTimerComplete = () => {
    // Save the completed session
    saveSession()

    // Move to the next phase
    moveToNextPhase()
  }

  const moveToNextPhase = () => {
    if (phase === "work") {
      // After work session
      const newPomodorosInCycle = (pomodorosInCycle + 1) % POMODOROS_UNTIL_LONG_BREAK
      setPomodorosInCycle(newPomodorosInCycle)

      if (newPomodorosInCycle === 0) {
        // Time for a long break
        setPhase("longBreak")
        setTimeRemaining(LONG_BREAK_TIME)
      } else {
        // Time for a short break
        setPhase("shortBreak")
        setTimeRemaining(SHORT_BREAK_TIME)
      }

      // Auto-start breaks if enabled
      if (autoStartBreaks) {
        setTimeout(() => {
          // Make sure we're using the correct time for the break
          const breakDuration = newPomodorosInCycle === 0 ? LONG_BREAK_TIME : SHORT_BREAK_TIME
          startTimer(breakDuration)
        }, 300)
      } else {
        setIsActive(false)
      }
    } else {
      // After any break
      setPhase("work")
      setTimeRemaining(WORK_TIME)

      // Auto-start work if enabled
      if (autoStartPomodoros) {
        setTimeout(() => {
          startTimer(WORK_TIME)
        }, 300)
      } else {
        setIsActive(false)
      }
    }
  }

  const startTimer = (duration = timeRemaining) => {
    // Set active state
    setIsActive(true)

    // Start the timer using TimerUtils
    timerUtils.startTimer(
      duration,
      // onTick callback
      (remaining) => {
        setTimeRemaining(remaining)
      },
      // onComplete callback
      handleTimerComplete,
    )
  }

  const pauseTimer = () => {
    // Pause the timer
    timerUtils.pauseTimer()

    // Set inactive state
    setIsActive(false)
  }

  const resetTimer = () => {
    // Reset the timer
    timerUtils.resetTimer()

    // Set inactive state
    setIsActive(false)

    // Reset to the current phase's default time
    if (phase === "work") {
      setTimeRemaining(WORK_TIME)
    } else if (phase === "shortBreak") {
      setTimeRemaining(SHORT_BREAK_TIME)
    } else {
      setTimeRemaining(LONG_BREAK_TIME)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => {
    soundUtils.play("buttonClick")
    startTimer()
  }

  const handlePause = () => {
    soundUtils.play("buttonClick")
    pauseTimer()
  }

  const handleReset = () => {
    soundUtils.play("buttonClick")
    resetTimer()
  }

  const handleSkip = () => {
    soundUtils.play("buttonClick")

    // Reset the timer
    timerUtils.resetTimer()

    // Set inactive state
    setIsActive(false)

    // Move to next phase without saving
    moveToNextPhase()
  }

  const toggleSound = () => {
    const newState = soundUtils.toggleEnabled()
    setSoundEnabled(newState)
    soundUtils.play("buttonClick")
  }

  const getPhaseTitle = () => {
    switch (phase) {
      case "work":
        return "Focus Time"
      case "shortBreak":
        return "Short Break"
      case "longBreak":
        return "Long Break"
    }
  }

  const getDurationMinutes = () => {
    switch (phase) {
      case "work":
        return 25
      case "shortBreak":
        return 5
      case "longBreak":
        return 15
    }
  }

  const getPhaseIcon = () => {
    switch (phase) {
      case "work":
        return <Brain className="h-5 w-5 mr-2" />
      case "shortBreak":
        return <Coffee className="h-5 w-5 mr-2" />
      case "longBreak":
        return <Coffee className="h-5 w-5 mr-2" />
    }
  }

  const getPhaseColor = () => {
    switch (phase) {
      case "work":
        return "bg-primary/10 text-primary"
      case "shortBreak":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "longBreak":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    }
  }

  return (
    <>
      <CardHeader className={`pb-2 ${phase !== "work" ? "bg-primary/5" : "bg-primary/10"}`}>
        <CardTitle className="text-center text-2xl font-bold text-primary">Pomodoro Timer</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-4 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Badge variant="outline" className={`text-sm px-3 py-1 ${getPhaseColor()}`}>
            {getPhaseIcon()}
            {getPhaseTitle()}
          </Badge>

          <div className="text-6xl font-bold tabular-nums text-primary">{formatTime(timeRemaining)}</div>

          {phase === "work" && (
            <Input
              type="text"
              placeholder="What are you working on?"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="max-w-xs"
              disabled={isActive}
            />
          )}

          <div className="flex items-center space-x-2">
            {!isActive ? (
              <Button onClick={handleStart} className="rounded-full">
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline" className="rounded-full">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={handleReset} variant="outline" className="rounded-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSkip} variant="ghost" className="rounded-full">
              Skip
            </Button>
            <Button
              onClick={toggleSound}
              variant="ghost"
              size="icon"
              className="rounded-full"
              title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex justify-center gap-1">
            {Array.from({ length: POMODOROS_UNTIL_LONG_BREAK }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < pomodorosInCycle ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <Badge variant="outline" className="text-sm">
            <Check className="h-3 w-3 mr-1" />
            Completed Pomodoros: {completedPomodoros}
          </Badge>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={autoStartBreaks}
              onChange={() => setAutoStartBreaks(!autoStartBreaks)}
              className="rounded text-primary"
            />
            <span>Auto-start breaks</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={autoStartPomodoros}
              onChange={() => setAutoStartPomodoros(!autoStartPomodoros)}
              className="rounded text-primary"
            />
            <span>Auto-start pomodoros</span>
          </label>
        </div>
      </CardContent>
    </>
  )
}

