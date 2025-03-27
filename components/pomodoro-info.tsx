import { CardContent } from "@/components/ui/card"
import { Brain, Coffee, Clock, Volume2 } from "lucide-react"

export default function PomodoroInfo() {
  return (
    <CardContent className="pt-6 pb-4 space-y-4">
      <h2 className="text-xl font-semibold">The Pomodoro Technique</h2>

      <p className="text-sm text-muted-foreground">
        The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It uses a
        timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.
      </p>

      <div className="space-y-3">
        <h3 className="font-medium">How it works:</h3>

        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Focus Session (25 min)</p>
            <p className="text-sm text-muted-foreground">Work on a single task without interruption</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-green-100 p-2 rounded-full dark:bg-green-900/30">
            <Coffee className="h-5 w-5 text-green-700 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium">Short Break (5 min)</p>
            <p className="text-sm text-muted-foreground">Take a brief rest to recharge</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full dark:bg-blue-900/30">
            <Coffee className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium">Long Break (15 min)</p>
            <p className="text-sm text-muted-foreground">After 4 focus sessions, take a longer break</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Benefits:</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Improves focus and concentration</li>
          <li>Reduces mental fatigue</li>
          <li>Increases productivity and efficiency</li>
          <li>Creates a sense of accomplishment</li>
          <li>Helps manage distractions</li>
        </ul>
      </div>

      <div className="bg-muted/50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Tips for success:</p>
        </div>
        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
          <li>Choose one specific task for each Pomodoro</li>
          <li>Set a clear goal for what you want to accomplish</li>
          <li>Respect the timer - when it rings, take your break</li>
          <li>Use breaks to truly disconnect (stretch, walk, hydrate)</li>
          <li>Track your progress to stay motivated</li>
        </ul>
      </div>

      <div className="bg-muted/50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Sound Notifications:</p>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          This app includes sound notifications to alert you when a timer completes. You can toggle sounds on/off using
          the sound button in the timer view.
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
          <li>Work complete: Bell sound when a focus session ends</li>
          <li>Break complete: Gentle notification when a break ends</li>
          <li>Button clicks: Subtle feedback when interacting with controls</li>
        </ul>
      </div>
    </CardContent>
  )
}

