"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Target, Calendar, TrendingUp } from "lucide-react"

interface Goal {
  id: string
  title: string
  description: string
  targetDate: string
  progress: number
  category: string
  milestones: string[]
}

export function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Learn React Development",
      description: "Master React and build 3 projects",
      targetDate: "2024-06-01",
      progress: 65,
      category: "Learning",
      milestones: ["Complete React course", "Build todo app", "Build portfolio"],
    },
    {
      id: "2",
      title: "Fitness Goal",
      description: "Exercise 4 times per week",
      targetDate: "2024-12-31",
      progress: 40,
      category: "Health",
      milestones: ["Join gym", "Create workout plan", "Track progress"],
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetDate: "",
    category: "",
  })

  const createGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      progress: 0,
      milestones: [],
    }
    setGoals([goal, ...goals])
    setNewGoal({ title: "", description: "", targetDate: "", category: "" })
    setIsDialogOpen(false)
  }

  const updateProgress = (goalId: string, progress: number) => {
    setGoals(goals.map((goal) => (goal.id === goalId ? { ...goal, progress } : goal)))
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 50) return "bg-yellow-500"
    return "bg-blue-500"
  }

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate)
    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Goal Tracker</h2>
          <p className="text-gray-600">Track your progress and achieve your dreams</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              <Textarea
                placeholder="Goal description"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              />
              <Input
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              />
              <Input
                placeholder="Category"
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
              />
              <Button onClick={createGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {goals.map((goal) => {
          const daysRemaining = getDaysRemaining(goal.targetDate)

          return (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {goal.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  </div>
                  <Badge variant="outline">{goal.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {daysRemaining > 0
                        ? `${daysRemaining} days left`
                        : daysRemaining === 0
                          ? "Due today"
                          : `${Math.abs(daysRemaining)} days overdue`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateProgress(goal.id, Math.min(100, goal.progress + 10))}
                  >
                    +10%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateProgress(goal.id, Math.max(0, goal.progress - 10))}
                  >
                    -10%
                  </Button>
                </div>

                {goal.milestones.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Milestones</h4>
                    <ul className="text-sm space-y-1">
                      {goal.milestones.map((milestone, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {goals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first goal to track your progress</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
