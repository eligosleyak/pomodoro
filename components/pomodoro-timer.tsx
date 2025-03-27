"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Check } from "lucide-react"
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore"

type PomodoroTimerProps = {
  db: any
  user: any
  updateCompletedPomodoros: (count: number) => void
  completedPomodoros: number
}

export default function PomodoroTimer({ db, user, updateCompletedPomodoros, completedPomodoros }: PomodoroTimerProps) {
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [taskName, setTaskName] = useState("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load completed pomodoros count on component mount
  useEffect(() => {
    if (db && user) {
      loadCompletedPomodoros()
    }
  }, [db, user])

  const loadCompletedPomodoros = async () => {
    try {
      const sessionsQuery = query(collection(db, "pomodoro_sessions"), where("userId", "==", user.uid))
      const querySnapshot = await getDocs(sessionsQuery)
      updateCompletedPomodoros(querySnapshot.size)
    } catch (error) {
      console.error("Error loading completed pomodoros:", error)
    }
  }

  const saveSession = async () => {
    try {
      if (db && user) {
        await addDoc(collection(db, "pomodoro_sessions"), {
          userId: user.uid,
          taskName: taskName || "Unnamed Task",
          duration: 25, // minutes
          completedAt: Timestamp.now(),
        })

        // Update completed pomodoros count
        updateCompletedPomodoros(completedPomodoros + 1)

        // Show notification
        if (Notification.permission === "granted") {
          new Notification("Pomodoro Completed!", {
            body: `You completed: ${taskName || "Unnamed Task"}`,
            icon: "/favicon.ico",
          })
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission()
        }
      }
    } catch (error) {
      console.error("Error saving session:", error)
    }
  }

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!)
            setIsActive(false)
            saveSession()
            return 25 * 60
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => {
    setIsActive(true)
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setTime(25 * 60)
  }

  return (
    <>
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-center text-2xl font-bold text-primary">Pomodoro Timer</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-4 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-6xl font-bold tabular-nums text-primary">{formatTime(time)}</div>

          <Input
            type="text"
            placeholder="What are you working on?"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="max-w-xs"
            disabled={isActive}
          />

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
          </div>
        </div>

        <div className="flex justify-center">
          <Badge variant="outline" className="text-sm">
            <Check className="h-3 w-3 mr-1" />
            Completed Pomodoros: {completedPomodoros}
          </Badge>
        </div>
      </CardContent>
    </>
  )
}

