import { getOpenAI } from './openai';
import {
  getSystemPrompt,
  getPostActionReviewPrompt,
  getConversationStarterPrompt,
  getMotivationQuotePrompt,
} from './prompts';

export const generatePersonalizedCoaching = async (userProfile, userMessage, chatHistory = []) => {
  try {
    const openai = getOpenAI();
    const systemPrompt = getSystemPrompt(userProfile);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-10), // Last 10 messages for context
      { role: 'user', content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating coaching:', error);
    throw new Error('Failed to generate coaching response. Please try again.');
  }
};

export const processPostActionReview = async (outcome, notes, userProfile) => {
  try {
    const openai = getOpenAI();
    const prompt = getPostActionReviewPrompt(outcome, notes, userProfile);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: getSystemPrompt(userProfile) },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error processing review:', error);
    throw new Error('Failed to generate feedback. Please try again.');
  }
};

export const generateConversationStarter = async (userProfile, environment = 'general') => {
  try {
    const openai = getOpenAI();
    const prompt = getConversationStarterPrompt(userProfile, environment);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: getSystemPrompt(userProfile) },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating conversation starter:', error);
    throw new Error('Failed to generate conversation starter. Please try again.');
  }
};

export const generateMotivationQuote = async (userProfile) => {
  try {
    const openai = getOpenAI();
    const prompt = getMotivationQuotePrompt(userProfile);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: getSystemPrompt(userProfile) },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 100,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating motivation quote:', error);
    throw new Error('Failed to generate motivation quote. Please try again.');
  }
};

