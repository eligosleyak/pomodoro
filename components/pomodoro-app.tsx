"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, List, User } from "lucide-react"
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"

import PomodoroTimer from "./pomodoro-timer"
import SessionHistory from "./session-history"
import AuthComponent from "./auth-component"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
let app
let db
let auth

try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
} catch (error) {
  console.error("Firebase initialization error:", error)
}

export default function PomodoroApp() {
  const [activeTab, setActiveTab] = useState("timer")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [])

  const updateCompletedPomodoros = (count: number) => {
    setCompletedPomodoros(count)
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md shadow-lg p-8 text-center">
        <div className="animate-pulse">Loading...</div>
      </Card>
    )
  }

  if (!user) {
    return <AuthComponent auth={auth} />
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="p-0">
          <PomodoroTimer
            db={db}
            user={user}
            updateCompletedPomodoros={updateCompletedPomodoros}
            completedPomodoros={completedPomodoros}
          />
        </TabsContent>

        <TabsContent value="history" className="p-0">
          <SessionHistory db={db} user={user} updateCompletedPomodoros={updateCompletedPomodoros} />
        </TabsContent>

        <TabsContent value="account" className="p-0">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Account</h2>
            <div className="space-y-2">
              <p className="text-sm">Signed in as:</p>
              <p className="font-medium">{user.email}</p>
              <button
                onClick={() => auth.signOut()}
                className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

