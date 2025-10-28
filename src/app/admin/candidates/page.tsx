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
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";

// Mock data for candidates
const candidates = [
  {
    id: "cand_1",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Pending",
    invitedAt: "2024-05-20",
    problemAssigned: "FizzBuzz Challenge",
  },
  {
    id: "cand_2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "Completed",
    invitedAt: "2024-05-18",
    problemAssigned: "Palindrome Checker",
  },
  {
    id: "cand_3",
    name: "Sam Wilson",
    email: "sam.wilson@example.com",
    status: "In Progress",
    invitedAt: "2024-05-22",
    problemAssigned: "Two Sum",
  },
  {
    id: "cand_4",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    status: "Invited",
    invitedAt: "2024-05-23",
    problemAssigned: "Implement a Debounce Function",
  },
];

export default function CandidatesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Candidates
          </h2>
          <p className="text-muted-foreground">
            Invite and manage candidates for your coding challenges.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Invite Candidate
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate List</CardTitle>
          <CardDescription>
            A list of all candidates in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Candidate</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Problem Assigned</TableHead>
                <TableHead className="whitespace-nowrap">Invited At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={`https://avatar.vercel.sh/${candidate.email}.png`} alt="Avatar" />
                        <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground hidden md:inline">
                          {candidate.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={
                        candidate.status === 'Completed' ? 'default' : 
                        candidate.status === 'Pending' ? 'destructive' :
                        candidate.status === 'In Progress' ? 'outline' : 'secondary'
                      }>
                      {candidate.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{candidate.problemAssigned}</TableCell>
                  <TableCell className="whitespace-nowrap">{candidate.invitedAt}</TableCell>
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
                        <DropdownMenuItem className="text-destructive">
                           <Trash2 className="mr-2 h-4 w-4" />
                           Remove
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
