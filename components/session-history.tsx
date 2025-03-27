"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Brain, Coffee } from "lucide-react"
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"

type SessionHistoryProps = {
  db: any
  user: any
  updateCompletedPomodoros: (count: number) => void
}

type SessionType = {
  id: string
  taskName: string
  duration: number
  type: "work" | "shortBreak" | "longBreak"
  completedAt: any
}

export default function SessionHistory({ db, user, updateCompletedPomodoros }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionType[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    work: 0,
    shortBreak: 0,
    longBreak: 0,
    totalTime: 0,
  })

  useEffect(() => {
    if (db && user) {
      loadSessions()
    }
  }, [db, user])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const sessionsQuery = query(
        collection(db, "pomodoro_sessions"),
        where("userId", "==", user.uid),
        orderBy("completedAt", "desc"),
      )
      const querySnapshot = await getDocs(sessionsQuery)
      const sessionsList: SessionType[] = []

      let workCount = 0
      let shortBreakCount = 0
      let longBreakCount = 0
      let totalMinutes = 0

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<SessionType, "id">
        sessionsList.push({
          id: doc.id,
          ...data,
        } as SessionType)

        // Update stats
        if (data.type === "work") workCount++
        else if (data.type === "shortBreak") shortBreakCount++
        else if (data.type === "longBreak") longBreakCount++

        totalMinutes += data.duration || 0
      })

      setSessions(sessionsList)
      setStats({
        work: workCount,
        shortBreak: shortBreakCount,
        longBreak: longBreakCount,
        totalTime: totalMinutes,
      })

      // Update completed pomodoros count
      updateCompletedPomodoros(workCount)
      setLoading(false)
    } catch (error) {
      console.error("Error loading sessions:", error)
      setLoading(false)
    }
  }

  const clearHistory = async () => {
    try {
      if (!window.confirm("Are you sure you want to clear all session history?")) {
        return
      }

      setLoading(true)
      const sessionsQuery = query(collection(db, "pomodoro_sessions"), where("userId", "==", user.uid))
      const querySnapshot = await getDocs(sessionsQuery)

      const deletePromises = querySnapshot.docs.map((document) => deleteDoc(doc(db, "pomodoro_sessions", document.id)))

      await Promise.all(deletePromises)

      setSessions([])
      setStats({
        work: 0,
        shortBreak: 0,
        longBreak: 0,
        totalTime: 0,
      })
      updateCompletedPomodoros(0)
      setLoading(false)
    } catch (error) {
      console.error("Error clearing history:", error)
      setLoading(false)
    }
  }

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "work":
        return <Brain className="h-4 w-4" />
      case "shortBreak":
        return <Coffee className="h-4 w-4" />
      case "longBreak":
        return <Coffee className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getSessionBadgeStyle = (type: string) => {
    switch (type) {
      case "work":
        return "bg-primary/20 text-primary"
      case "shortBreak":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "longBreak":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatSessionType = (type: string) => {
    switch (type) {
      case "work":
        return "Focus"
      case "shortBreak":
        return "Short Break"
      case "longBreak":
        return "Long Break"
      default:
        return type
    }
  }

  return (
    <CardContent className="pt-6 pb-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Session History</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="h-8 text-xs"
          disabled={loading || sessions.length === 0}
        >
          <X className="h-3 w-3 mr-1" />
          Clear History
        </Button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="bg-muted/50 p-2 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Focus Sessions</p>
          <p className="text-lg font-bold">{stats.work}</p>
        </div>
        <div className="bg-muted/50 p-2 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Short Breaks</p>
          <p className="text-lg font-bold">{stats.shortBreak}</p>
        </div>
        <div className="bg-muted/50 p-2 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Long Breaks</p>
          <p className="text-lg font-bold">{stats.longBreak}</p>
        </div>
        <div className="bg-muted/50 p-2 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Total Time</p>
          <p className="text-lg font-bold">{stats.totalTime} min</p>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-pulse">Loading sessions...</div>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div key={session.id} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-full ${getSessionBadgeStyle(session.type)}`}>
                    {getSessionIcon(session.type)}
                  </div>
                  <div>
                    <p className="font-medium">{session.taskName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(session.completedAt.toDate(), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={`text-xs ${getSessionBadgeStyle(session.type)}`}>
                    {formatSessionType(session.type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{session.duration} min</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No sessions yet. Complete a Pomodoro to see it here.
            </p>
          )}
        </div>
      )}
    </CardContent>
  )
}

