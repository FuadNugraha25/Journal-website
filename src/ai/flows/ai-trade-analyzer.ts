'use server';

/**
 * @fileOverview Analyzes trading history for XAUUSD, GBPJPY, and EURUSD to identify patterns,
 * strengths, and weaknesses, generating a report with personalized improvement suggestions.
 *
 * - aiTradeAnalyzer - A function that handles the trade analysis process.
 * - AiTradeAnalyzerInput - The input type for the aiTradeAnalyzer function.
 * - AiTradeAnalyzerOutput - The return type for the aiTradeAnalyzer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTradeAnalyzerInputSchema = z.object({
  tradingHistory: z.string().describe(
    'A detailed record of trading history for XAUUSD, GBPJPY, and EURUSD pairs, including trade type, Profit/Loss (P/L), and Risk/Reward Ratio (R/R).'
  ),
});
export type AiTradeAnalyzerInput = z.infer<typeof AiTradeAnalyzerInputSchema>;

const AiTradeAnalyzerOutputSchema = z.object({
  analysisReport: z.string().describe(
    'A comprehensive report detailing trading patterns, strengths, weaknesses, personalized improvement suggestions, and potential opportunities.'
  ),
});
export type AiTradeAnalyzerOutput = z.infer<typeof AiTradeAnalyzerOutputSchema>;

export async function aiTradeAnalyzer(input: AiTradeAnalyzerInput): Promise<AiTradeAnalyzerOutput> {
  return aiTradeAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTradeAnalyzerPrompt',
  input: {schema: AiTradeAnalyzerInputSchema},
  output: {schema: AiTradeAnalyzerOutputSchema},
  prompt: `You are an expert trading analyst specializing in forex, particularly XAUUSD, GBPJPY, and EURUSD pairs. Analyze the provided trading history to identify patterns, strengths, and weaknesses. Generate a detailed report with personalized improvement suggestions and potential opportunities based on the user's trading data. Pay close attention to the Risk/Reward ratio and P/L of each trade. Also, identify market factors, or past trading tendencies.

Trading History:
{{{tradingHistory}}}

Report Format: The report should include sections for pattern identification, strength assessment, weakness identification, personalized improvement suggestions, and potential opportunities. Be as specific as possible, and quantify your findings where applicable.
`,
});

const aiTradeAnalyzerFlow = ai.defineFlow(
  {
    name: 'aiTradeAnalyzerFlow',
    inputSchema: AiTradeAnalyzerInputSchema,
    outputSchema: AiTradeAnalyzerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
