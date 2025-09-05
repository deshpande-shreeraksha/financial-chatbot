import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || '',
});

export const getCohereResponse = async (userPrompt: string): Promise<string> => {
  try {
    const response = await cohere.chat({
      model: 'command-r-plus',
      message: userPrompt,
      temperature: 0.7,
      maxTokens: 300,
    });

    return response.text || 'No response received.';
  } catch (error: any) {
    console.error('Cohere API error:', error.message);
    throw new Error('Failed to fetch response from Cohere');
  }
};
