
'use server';

/**
 * @fileOverview Summarizes key sharing details (destination, time, number of people) using AI.
 *
 * - summarizeSharingDetails - A function that summarizes sharing details.
 * - SummarizeSharingDetailsInput - The input type for the summarizeSharingDetails function.
 * - SummarizeSharingDetailsOutput - The return type for the summarizeSharingDetails function.
 */

import {ai} from '@/server/ai/genkit';
import {z} from 'genkit';

const SummarizeSharingDetailsInputSchema = z.object({
  destination: z.string().describe('The destination of the sharing.'),
  startTime: z.string().describe('The start time of the sharing.'),
  numberOfPeople: z.number().describe('The number of people in the sharing.'),
});
export type SummarizeSharingDetailsInput = z.infer<typeof SummarizeSharingDetailsInputSchema>;

const SummarizeSharingDetailsOutputSchema = z.object({
  summary: z.string().describe('A short summary of the key sharing details.'),
});
export type SummarizeSharingDetailsOutput = z.infer<typeof SummarizeSharingDetailsOutputSchema>;

export async function summarizeSharingDetails(
  input: SummarizeSharingDetailsInput
): Promise<SummarizeSharingDetailsOutput> {
  return summarizeSharingDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSharingDetailsPrompt',
  input: {schema: SummarizeSharingDetailsInputSchema},
  output: {schema: SummarizeSharingDetailsOutputSchema},
  prompt: `You are an AI assistant helping users quickly understand sharing room details.

  Summarize the following sharing details in a concise and informative way:

  Destination: {{{destination}}}
  Start Time: {{{startTime}}}
  Number of People: {{{numberOfPeople}}}
  `,
});

const summarizeSharingDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeSharingDetailsFlow',
    inputSchema: SummarizeSharingDetailsInputSchema,
    outputSchema: SummarizeSharingDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    