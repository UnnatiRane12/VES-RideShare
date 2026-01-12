'use server';

/**
 * @fileOverview A smart route suggestion AI agent.
 *
 * - smartRouteSuggestions - A function that suggests common routes or nearby destinations.
 * - SmartRouteSuggestionsInput - The input type for the smartRouteSuggestions function.
 * - SmartRouteSuggestionsOutput - The return type for the smartRouteSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartRouteSuggestionsInputSchema = z.object({
  startPoint: z.string().describe('The starting point of the journey.'),
  destination: z.string().describe('The desired destination of the journey.'),
  autoStatus: z.boolean().describe('Whether the user has already found an auto.'),
});
export type SmartRouteSuggestionsInput = z.infer<typeof SmartRouteSuggestionsInputSchema>;

const SmartRouteSuggestionsOutputSchema = z.object({
  suggestedRoutes: z
    .array(z.string())
    .describe('A list of suggested routes based on the start point and destination.'),
  nearbyDestinations:
    z.array(z.string()).describe('A list of nearby destinations that are commonly traveled to.'),
});
export type SmartRouteSuggestionsOutput = z.infer<typeof SmartRouteSuggestionsOutputSchema>;

export async function smartRouteSuggestions(
  input: SmartRouteSuggestionsInput
): Promise<SmartRouteSuggestionsOutput> {
  return smartRouteSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartRouteSuggestionsPrompt',
  input: {schema: SmartRouteSuggestionsInputSchema},
  output: {schema: SmartRouteSuggestionsOutputSchema},
  prompt: `You are a ride-sharing assistant that suggests routes and destinations to users.

  Based on the user's starting point and destination, suggest common routes and nearby destinations.
  Consider whether the user has found an auto already, and tailor the suggestions accordingly.

  Starting Point: {{{startPoint}}}
  Destination: {{{destination}}}
  Auto Status: {{{autoStatus}}}

  Format your response as a JSON object with "suggestedRoutes" and "nearbyDestinations" fields. suggestedRoutes should be a list of possible route suggestions and nearbyDestinations should be destinations that are nearby the user's current destination.
  The nearbyDestinations should be within a 5 mile radius of the user's final destination.
  The routes suggestions should focus on major roads or ways to get to the final destination.
  `,
});

const smartRouteSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartRouteSuggestionsFlow',
    inputSchema: SmartRouteSuggestionsInputSchema,
    outputSchema: SmartRouteSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
