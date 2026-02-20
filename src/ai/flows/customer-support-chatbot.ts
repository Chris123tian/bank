'use server';
/**
 * @fileOverview An AI-powered chatbot for instant customer support.
 *
 * - customerSupportChatbot - A function that handles customer support queries.
 * - CustomerSupportChatbotInput - The input type for the customerSupportChatbot function.
 * - CustomerSupportChatbotOutput - The return type for the customerSupportChatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CustomerSupportChatbotInputSchema = z.object({
  query: z.string().describe('The user\'s query to the banking support chatbot.'),
});
export type CustomerSupportChatbotInput = z.infer<typeof CustomerSupportChatbotInputSchema>;

const CustomerSupportChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s comprehensive response to the user query.'),
});
export type CustomerSupportChatbotOutput = z.infer<typeof CustomerSupportChatbotOutputSchema>;

export async function customerSupportChatbot(input: CustomerSupportChatbotInput): Promise<CustomerSupportChatbotOutput> {
  return customerSupportChatbotFlow(input);
}

const customerSupportChatbotPrompt = ai.definePrompt({
  name: 'customerSupportChatbotPrompt',
  input: { schema: CustomerSupportChatbotInputSchema },
  output: { schema: CustomerSupportChatbotOutputSchema },
  prompt: `You are an AI-powered customer support chatbot for Nexa International Bank. Your purpose is to provide instant support to users, answering common questions about banking services and guiding them through tasks. Be helpful, knowledgeable, and friendly.

Instructions:
- Answer questions about banking services accurately and concisely.
- Provide clear, step-by-step guidance for performing tasks within the banking application.
- If a question is outside the scope of general banking services (e.g., personal financial advice) or requires access to specific account details, politely state that you cannot assist with that particular query and suggest contacting a human support agent for personalized help.

User Query: {{{query}}}`,
});

const customerSupportChatbotFlow = ai.defineFlow(
  {
    name: 'customerSupportChatbotFlow',
    inputSchema: CustomerSupportChatbotInputSchema,
    outputSchema: CustomerSupportChatbotOutputSchema,
  },
  async (input) => {
    const { output } = await customerSupportChatbotPrompt(input);
    return output!;
  }
);
