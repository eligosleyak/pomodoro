import PomodoroApp from "@/components/pomodoro-app"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <PomodoroApp />
    </main>
  )
}

