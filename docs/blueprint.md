# **App Name**: CodeReview Console

## Core Features:

- Admin Authentication: Firebase Authentication with email/password and custom 'admin' role claim. Admin profile stored in /admins collection.
- Candidate Authentication: Firebase Authentication with email/password and custom 'candidate' role claim. Candidate profile stored in /candidates collection.
- Problem Management: Admins can create, read, update, and delete problems in the /problems collection through the /api/admin/create-problem API route.
- Candidate Invitation: Admins can invite candidates through the /api/admin/invite-candidate API route, sending an invitation email via SendGrid.
- Time-Based Problem Access: Candidates can only access their assigned problem via /api/candidate/get-problem if the current time is greater than or equal to their scheduled time. This will require a 'tool' powered by generative AI, to ensure strict rules for when access is granted to each user.
- Code Submission: Candidates can submit their code (HTML, CSS, JS) via /api/candidate/submit, which saves the submission to the /submissions collection.
- Submission Review: Admins can add remarks to submissions via /api/admin/add-remark.

## Style Guidelines:

- Primary color: Soft blue (#F25912) to convey trust and reliability, complementing a coding-focused interface.
- Background color: Light gray (#F5F5F5), creating a clean and unobtrusive backdrop for code and UI elements.
- Accent color: Subtle orange (#FFAB40), providing highlights and call-to-action emphasis.
- Headline font: 'Space Grotesk' sans-serif, giving a computerized techy look. Body font: 'Inter', for longer text, for maximum readability
- Code font: 'Source Code Pro' monospace, for clear code presentation.
- Simple, clear icons from a library like Lucide to represent actions and status.
- Role-based layouts for admin and candidate views, ensuring a focused user experience.