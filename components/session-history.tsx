"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
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
  completedAt: any
}

export default function SessionHistory({ db, user, updateCompletedPomodoros }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionType[]>([])
  const [loading, setLoading] = useState(true)

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

      querySnapshot.forEach((doc) => {
        sessionsList.push({
          id: doc.id,
          ...doc.data(),
        } as SessionType)
      })

      setSessions(sessionsList)
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
      updateCompletedPomodoros(0)
      setLoading(false)
    } catch (error) {
      console.error("Error clearing history:", error)
      setLoading(false)
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

      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-pulse">Loading sessions...</div>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div key={session.id} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{session.taskName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(session.completedAt.toDate(), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {session.duration} min
                </Badge>
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

