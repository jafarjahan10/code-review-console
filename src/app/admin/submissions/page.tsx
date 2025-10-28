import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Eye, MessageSquare } from "lucide-react";

// Mock data for submissions
const submissions = [
  {
    id: "sub_1",
    candidateName: "John Doe",
    candidateEmail: "john.doe@example.com",
    problemTitle: "FizzBuzz Challenge",
    submittedAt: "2024-05-21",
    status: "Pending",
  },
  {
    id: "sub_2",
    candidateName: "Jane Smith",
    candidateEmail: "jane.smith@example.com",
    problemTitle: "Palindrome Checker",
    submittedAt: "2024-05-19",
    status: "Reviewed",
  },
  {
    id: "sub_3",
    candidateName: "Sam Wilson",
    candidateEmail: "sam.wilson@example.com",
    problemTitle: "Two Sum",
    submittedAt: "2024-05-23",
    status: "Pending",
  },
];

export default function SubmissionsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Submissions
          </h2>
          <p className="text-muted-foreground">
            Review and manage candidate submissions.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>
            A list of all submissions from candidates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Problem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="whitespace-nowrap">Submitted At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={`https://avatar.vercel.sh/${submission.candidateEmail}.png`} alt="Avatar" />
                        <AvatarFallback>{submission.candidateName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p className="font-medium">{submission.candidateName}</p>
                        <p className="text-sm text-muted-foreground hidden md:inline">
                          {submission.candidateEmail}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{submission.problemTitle}</TableCell>
                  <TableCell>
                    <Badge variant={submission.status === 'Reviewed' ? 'default' : 'destructive'}>
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{submission.submittedAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Submission
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Add Remark
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
