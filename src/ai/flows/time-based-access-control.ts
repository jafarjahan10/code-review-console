'use server';

/**
 * @fileOverview Implements time-based access control for candidates accessing problems.
 *
 * - checkTimeBasedAccess - A function to check if a candidate can access a problem based on the scheduled time.
 * - TimeBasedAccessInput - The input type for the checkTimeBasedAccess function.
 * - TimeBasedAccessOutput - The return type for the checkTimeBasedAccess function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TimeBasedAccessInputSchema = z.object({
  scheduledTime: z.string().describe('The scheduled access time for the candidate (ISO format).'),
  currentTime: z.string().describe('The current time (ISO format).'),
});
export type TimeBasedAccessInput = z.infer<typeof TimeBasedAccessInputSchema>;

const TimeBasedAccessOutputSchema = z.object({
  canAccess: z.boolean().describe('Whether the candidate can access the problem based on the time.'),
  reason: z.string().optional().describe('The reason why access is allowed or denied.'),
});
export type TimeBasedAccessOutput = z.infer<typeof TimeBasedAccessOutputSchema>;

export async function checkTimeBasedAccess(input: TimeBasedAccessInput): Promise<TimeBasedAccessOutput> {
  return timeBasedAccessFlow(input);
}

const timeBasedAccessPrompt = ai.definePrompt({
  name: 'timeBasedAccessPrompt',
  input: {schema: TimeBasedAccessInputSchema},
  output: {schema: TimeBasedAccessOutputSchema},
  prompt: `You are a time-based access control system.

  Determine whether a candidate should be granted access to a problem based on their scheduled access time and the current time.

  Scheduled Time: {{{scheduledTime}}}
  Current Time: {{{currentTime}}}

  Consider the following rules:
  - Access should be granted if the current time is equal to or later than the scheduled time.
  - Access should be denied if the current time is earlier than the scheduled time.

  Return a JSON object with the following structure:
  {
    "canAccess": boolean, // true if access is granted, false otherwise
    "reason": string // A brief explanation for the decision.
  }
  `,
});

const timeBasedAccessFlow = ai.defineFlow(
  {
    name: 'timeBasedAccessFlow',
    inputSchema: TimeBasedAccessInputSchema,
    outputSchema: TimeBasedAccessOutputSchema,
  },
  async input => {
    const {output} = await timeBasedAccessPrompt(input);
    return output!;
  }
);
