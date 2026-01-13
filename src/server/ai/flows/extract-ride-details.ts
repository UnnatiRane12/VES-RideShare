
'use server';

/**
 * @fileOverview Extracts ride details from a natural language query using AI.
 *
 * - extractRideDetails - A function that parses a user's text to fill ride details.
 * - ExtractRideDetailsInput - The input type for the extractRideDetails function.
 * - ExtractRideDetailsOutput - The return type for the extractRideDetails function.
 */

import {ai} from '@/server/ai/genkit';
import {z} from 'genkit';

const ExtractRideDetailsInputSchema = z.object({
  query: z.string().describe('The natural language query from the user describing the ride they want to create.'),
});
export type ExtractRideDetailsInput = z.infer<typeof ExtractRideDetailsInputSchema>;

const ExtractRideDetailsOutputSchema = z.object({
    name: z.string().describe("A short, suitable name for the ride, like 'Morning Commute' or 'Ride to VESIT'."),
    startingPoint: z.string().describe("The starting location for the ride."),
    destination: z.string().describe("The destination for the ride."),
    passengerLimit: z.number().min(1).max(4).describe("The total number of people for the ride, including the user. Default to 2 if not specified."),
});
export type ExtractRideDetailsOutput = z.infer<typeof ExtractRideDetailsOutputSchema>;

export async function extractRideDetails(
  input: ExtractRideDetailsInput
): Promise<ExtractRideDetailsOutput> {
  return extractRideDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractRideDetailsPrompt',
  input: {schema: ExtractRideDetailsInputSchema},
  output: {schema: ExtractRideDetailsOutputSchema},
  prompt: `You are an AI assistant that helps users create ride-sharing rooms. Your task is to parse the user's natural language query and extract the necessary details to fill out a form.

  The user is a college student in Mumbai, likely traveling to or from a VES (Vivekanand Education Society) campus. If a location is ambiguous, assume it's a well-known place in Mumbai (e.g., 'station' likely means a train station).

  User's request: "{{{query}}}"

  Extract the following information:
  1.  **startingPoint**: The starting location of the journey.
  2.  **destination**: The final destination. If only one location is mentioned and it's not a college, assume it's the destination and the starting point is unknown. If a VES college is mentioned, it's almost always the destination.
  3.  **passengerLimit**: The total number of people. If the user says "with 2 friends" it means 3 people total. If not specified, default to 2. The maximum is 4.
  4.  **name**: Create a simple, descriptive name for the ride based on the start and end points, e.g., "Ride to VESIT" or "Chembur to VESIT".

  If any piece of information is missing, leave the corresponding field empty, except for passengerLimit which should default to 2.
  `,
});

const extractRideDetailsFlow = ai.defineFlow(
  {
    name: 'extractRideDetailsFlow',
    inputSchema: ExtractRideDetailsInputSchema,
    outputSchema: ExtractRideDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    