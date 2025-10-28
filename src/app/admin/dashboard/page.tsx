import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, FileCode, Clock, CheckCircle } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Problems",
      value: "12",
      icon: FileCode,
      description: "Number of coding challenges created.",
    },
    {
      title: "Active Candidates",
      value: "45",
      icon: Users,
      description: "Candidates currently in the process.",
    },
    {
      title: "Pending Reviews",
      value: "8",
      icon: Clock,
      description: "Submissions awaiting your feedback.",
    },
    {
      title: "Reviewed Today",
      value: "3",
      icon: CheckCircle,
      description: "Submissions you have reviewed today.",
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Recent Submissions</CardTitle>
            <CardDescription>
              A list of the most recent candidate submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent submissions list/table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">John Doe - FizzBuzz Challenge</p>
                  <p className="text-sm text-muted-foreground">Submitted: 2 hours ago</p>
                </div>
                <p className="text-sm font-semibold text-accent-foreground">Pending</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Jane Smith - Palindrome Checker</p>
                  <p className="text-sm text-muted-foreground">Submitted: 5 hours ago</p>
                </div>
                <p className="text-sm font-semibold text-green-600">Reviewed</p>
              </div>
               <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sam Wilson - Two Sum</p>
                  <p className="text-sm text-muted-foreground">Submitted: 1 day ago</p>
                </div>
                <p className="text-sm font-semibold text-accent-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-4 md:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Activity Feed</CardTitle>
            <CardDescription>
              Recent activities across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center">
              <Users className="h-4 w-4 mr-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">New candidate <span className="font-medium text-foreground">Alice Johnson</span> was invited.</p>
            </div>
            <div className="flex items-center">
              <FileCode className="h-4 w-4 mr-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">New problem <span className="font-medium text-foreground">'React Hooks API'</span> was created.</p>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Jane Smith's</span> submission was reviewed.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
